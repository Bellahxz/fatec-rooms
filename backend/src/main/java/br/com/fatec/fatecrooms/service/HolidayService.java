package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.HolidayDTO;
import br.com.fatec.fatecrooms.DTO.HolidayRequest;
import br.com.fatec.fatecrooms.DTO.NationalHolidayDTO;
import br.com.fatec.fatecrooms.exception.BusinessException;
import br.com.fatec.fatecrooms.exception.ResourceNotFoundException;
import br.com.fatec.fatecrooms.model.Holiday;
import br.com.fatec.fatecrooms.model.Semester;
import br.com.fatec.fatecrooms.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HolidayService {

    private final HolidayRepository holidayRepository;
    private final SemesterService semesterService;

    private final RestClient restClient = RestClient.create();
    private static final String BRASIL_API_URL =
            "https://brasilapi.com.br/api/feriados/v1/{year}";

    // ─────────────────────────────────────────────
    //  CONSULTAS
    // ─────────────────────────────────────────────

    public List<HolidayDTO> listBySemester(Integer semesterId) {
        semesterService.getOrThrow(semesterId); // valida existência
        return holidayRepository.findBySemesterIdOrderByHolidayDateAsc(semesterId)
                .stream().map(this::toDTO).toList();
    }

    public HolidayDTO findById(Integer id) {
        return toDTO(getOrThrow(id));
    }

    /**
     * Consulta os feriados nacionais do ano via BrasilAPI e retorna os que
     * estão dentro do intervalo do semestre informado.
     * Não persiste nada — é apenas uma prévia para o coordenador decidir quais importar.
     */
    public List<NationalHolidayDTO> previewNationalHolidays(Integer semesterId) {
        Semester semester = semesterService.getOrThrow(semesterId);

        List<NationalHolidayDTO> result = new ArrayList<>();
        int startYear = semester.getStartDate().getYear();
        int endYear   = semester.getEndDate().getYear();

        for (int year = startYear; year <= endYear; year++) {
            List<NationalHolidayDTO> yearHolidays = fetchNationalHolidays(year);
            for (NationalHolidayDTO h : yearHolidays) {
                try {
                    LocalDate date = LocalDate.parse(h.getDate());
                    if (!date.isBefore(semester.getStartDate())
                            && !date.isAfter(semester.getEndDate())) {
                        result.add(h);
                    }
                } catch (Exception e) {
                    log.warn("Falha ao parsear data de feriado nacional: {}", h.getDate());
                }
            }
        }
        return result;
    }

    // ─────────────────────────────────────────────
    //  OPERAÇÕES (apenas coordenador)
    // ─────────────────────────────────────────────

    @Transactional
    public HolidayDTO create(Integer semesterId, HolidayRequest request) {
        Semester semester = semesterService.getOrThrow(semesterId);
        validateHolidayDate(semester, request.getHolidayDate(), null);

        Holiday holiday = new Holiday();
        holiday.setSemester(semester);
        holiday.setName(request.getName().trim());
        holiday.setHolidayDate(request.getHolidayDate());
        holiday.setType(request.getType() != null ? request.getType() : Holiday.Type.CUSTOM);
        holiday.setDescription(request.getDescription());

        return toDTO(holidayRepository.save(holiday));
    }

    /**
     * Importa em lote os feriados nacionais de um semestre consultando a BrasilAPI.
     * Ignora datas já cadastradas silenciosamente.
     * Retorna a lista dos que foram efetivamente inseridos.
     */
    @Transactional
    public List<HolidayDTO> importNationalHolidays(Integer semesterId) {
        Semester semester = semesterService.getOrThrow(semesterId);

        List<NationalHolidayDTO> national = previewNationalHolidays(semesterId);
        List<HolidayDTO> imported = new ArrayList<>();

        for (NationalHolidayDTO nh : national) {
            LocalDate date;
            try {
                date = LocalDate.parse(nh.getDate());
            } catch (Exception e) {
                continue;
            }

            // Pula se já existir feriado nessa data neste semestre
            if (holidayRepository.existsBySemesterIdAndHolidayDate(semesterId, date)) {
                continue;
            }

            Holiday holiday = new Holiday();
            holiday.setSemester(semester);
            holiday.setName(nh.getName());
            holiday.setHolidayDate(date);
            holiday.setType(Holiday.Type.NATIONAL);
            holiday.setDescription("Importado automaticamente via BrasilAPI.");

            imported.add(toDTO(holidayRepository.save(holiday)));
        }

        return imported;
    }

    @Transactional
    public HolidayDTO update(Integer id, HolidayRequest request) {
        Holiday holiday = getOrThrow(id);
        validateHolidayDate(holiday.getSemester(), request.getHolidayDate(), id);

        holiday.setName(request.getName().trim());
        holiday.setHolidayDate(request.getHolidayDate());
        if (request.getType() != null) holiday.setType(request.getType());
        holiday.setDescription(request.getDescription());

        return toDTO(holidayRepository.save(holiday));
    }

    @Transactional
    public String delete(Integer id) {
        Holiday holiday = getOrThrow(id);
        holidayRepository.delete(holiday);
        return "Feriado '" + holiday.getName() + "' removido com sucesso.";
    }

    // ─────────────────────────────────────────────
    //  HELPERS INTERNOS
    // ─────────────────────────────────────────────

    /**
     * Verifica se a data do feriado está dentro do semestre e
     * se não há duplicidade (ignorando o próprio registro ao editar).
     */
    private void validateHolidayDate(Semester semester, LocalDate date, Integer excludeId) {
        if (date.isBefore(semester.getStartDate()) || date.isAfter(semester.getEndDate())) {
            throw new BusinessException(
                    "A data do feriado deve estar dentro do período do semestre ("
                    + semester.getStartDate() + " a " + semester.getEndDate() + ")."
            );
        }

        boolean exists = holidayRepository.existsBySemesterIdAndHolidayDate(semester.getId(), date);
        // Se excluindo um ID (edição), precisamos verificar se a colisão é com OUTRO registro
        if (exists && excludeId != null) {
            Holiday existing = holidayRepository.findBySemesterIdOrderByHolidayDateAsc(semester.getId())
                    .stream()
                    .filter(h -> h.getHolidayDate().equals(date))
                    .findFirst()
                    .orElse(null);
            if (existing != null && !existing.getId().equals(excludeId)) {
                throw new BusinessException("Já existe um feriado cadastrado para essa data neste semestre.");
            }
        } else if (exists) {
            throw new BusinessException("Já existe um feriado cadastrado para essa data neste semestre.");
        }
    }

    private List<NationalHolidayDTO> fetchNationalHolidays(int year) {
        try {
            return restClient.get()
                    .uri(BRASIL_API_URL, year)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<NationalHolidayDTO>>() {});
        } catch (Exception e) {
            log.error("Falha ao buscar feriados nacionais para o ano {}: {}", year, e.getMessage());
            return List.of();
        }
    }

    private Holiday getOrThrow(Integer id) {
        return holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feriado não encontrado: " + id));
    }

    public HolidayDTO toDTO(Holiday h) {
        return new HolidayDTO(
                h.getId(),
                h.getSemester().getId(),
                h.getSemester().getName(),
                h.getName(),
                h.getHolidayDate(),
                h.getType(),
                h.getDescription(),
                h.getCreatedAt()
        );
    }
}
