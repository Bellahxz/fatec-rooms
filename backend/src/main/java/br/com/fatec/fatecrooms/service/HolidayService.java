package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.HolidayDTO;
import br.com.fatec.fatecrooms.DTO.HolidayRequest;
import br.com.fatec.fatecrooms.DTO.NationalHolidayDTO;
import br.com.fatec.fatecrooms.exception.BusinessException;
import br.com.fatec.fatecrooms.exception.ResourceNotFoundException;
import br.com.fatec.fatecrooms.model.Holiday;
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

    private final RestClient restClient = RestClient.create();
    private static final String BRASIL_API_URL =
            "https://brasilapi.com.br/api/feriados/v1/{year}";

    // ─────────────────────────────────────────────
    //  CONSULTAS
    // ─────────────────────────────────────────────

    public List<HolidayDTO> listAll() {
        return holidayRepository.findAllByOrderByHolidayDateAsc()
                .stream().map(this::toDTO).toList();
    }

    public HolidayDTO findById(Integer id) {
        return toDTO(getOrThrow(id));
    }

    /**
     * Consulta os feriados nacionais do ano via BrasilAPI.
     * Não persiste — apenas prévia para o coordenador decidir quais importar.
     */
    public List<NationalHolidayDTO> previewNationalHolidays(int year) {
        return fetchNationalHolidays(year);
    }

    // ─────────────────────────────────────────────
    //  OPERAÇÕES (apenas coordenador)
    // ─────────────────────────────────────────────

    @Transactional
    public HolidayDTO create(HolidayRequest request) {
        if (holidayRepository.existsByHolidayDate(request.getHolidayDate())) {
            throw new BusinessException("Já existe um feriado cadastrado para essa data.");
        }

        Holiday holiday = new Holiday();
        holiday.setName(request.getName().trim());
        holiday.setHolidayDate(request.getHolidayDate());
        holiday.setType(request.getType() != null ? request.getType() : Holiday.Type.CUSTOM);
        holiday.setDescription(request.getDescription());

        return toDTO(holidayRepository.save(holiday));
    }

    /**
     * Importa em lote os feriados nacionais de um ano consultando a BrasilAPI.
     * Ignora datas já cadastradas silenciosamente.
     * Retorna a lista dos que foram efetivamente inseridos.
     */
    @Transactional
    public List<HolidayDTO> importNationalHolidays(int year) {
        List<NationalHolidayDTO> national = fetchNationalHolidays(year);
        List<HolidayDTO> imported = new ArrayList<>();

        for (NationalHolidayDTO nh : national) {
            LocalDate date;
            try {
                date = LocalDate.parse(nh.getDate());
            } catch (Exception e) {
                continue;
            }

            if (holidayRepository.existsByHolidayDate(date)) {
                continue;
            }

            Holiday holiday = new Holiday();
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

        // Verifica duplicidade apenas se a data mudou
        if (!holiday.getHolidayDate().equals(request.getHolidayDate())
                && holidayRepository.existsByHolidayDate(request.getHolidayDate())) {
            throw new BusinessException("Já existe um feriado cadastrado para essa data.");
        }

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
                h.getName(),
                h.getHolidayDate(),
                h.getType(),
                h.getDescription(),
                h.getCreatedAt()
        );
    }
}
