package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.ExamWeekDTO;
import br.com.fatec.fatecrooms.DTO.ExamWeekRequest;
import br.com.fatec.fatecrooms.exception.BusinessException;
import br.com.fatec.fatecrooms.exception.ResourceNotFoundException;
import br.com.fatec.fatecrooms.model.ExamWeek;
import br.com.fatec.fatecrooms.model.Semester;
import br.com.fatec.fatecrooms.repository.ExamWeekRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamWeekService {

    private final ExamWeekRepository examWeekRepository;
    private final SemesterService semesterService;

    // ─────────────────────────────────────────────
    //  CONSULTAS
    // ─────────────────────────────────────────────

    public List<ExamWeekDTO> listBySemester(Integer semesterId) {
        semesterService.getOrThrow(semesterId);
        return examWeekRepository.findBySemesterIdOrderByStartDateAsc(semesterId)
                .stream().map(this::toDTO).toList();
    }

    public ExamWeekDTO findById(Integer id) {
        return toDTO(getOrThrow(id));
    }

    // ─────────────────────────────────────────────
    //  OPERAÇÕES (apenas coordenador)
    // ─────────────────────────────────────────────

    @Transactional
    public ExamWeekDTO create(Integer semesterId, ExamWeekRequest request) {
        Semester semester = semesterService.getOrThrow(semesterId);
        validate(request, semester, null);

        ExamWeek examWeek = new ExamWeek();
        examWeek.setSemester(semester);
        examWeek.setExamType(request.getExamType());
        examWeek.setStartDate(request.getStartDate());
        examWeek.setEndDate(request.getEndDate());
        examWeek.setDescription(request.getDescription());

        return toDTO(examWeekRepository.save(examWeek));
    }

    @Transactional
    public ExamWeekDTO update(Integer id, ExamWeekRequest request) {
        ExamWeek examWeek = getOrThrow(id);
        Semester semester = examWeek.getSemester();
        validate(request, semester, id);

        // Se o tipo de prova mudou, verifica se o novo tipo já existe no semestre
        if (!examWeek.getExamType().equals(request.getExamType())) {
            if (examWeekRepository.existsBySemesterIdAndExamType(semester.getId(), request.getExamType())) {
                throw new BusinessException(
                        "Já existe uma semana de " + request.getExamType()
                        + " cadastrada para este semestre."
                );
            }
        }

        examWeek.setExamType(request.getExamType());
        examWeek.setStartDate(request.getStartDate());
        examWeek.setEndDate(request.getEndDate());
        examWeek.setDescription(request.getDescription());

        return toDTO(examWeekRepository.save(examWeek));
    }

    @Transactional
    public String delete(Integer id) {
        ExamWeek examWeek = getOrThrow(id);
        examWeekRepository.delete(examWeek);
        return "Semana de " + examWeek.getExamType()
               + " do semestre '" + examWeek.getSemester().getName() + "' removida com sucesso.";
    }

    // ─────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────

    private void validate(ExamWeekRequest request, Semester semester, Integer excludeId) {
        if (!request.getStartDate().isBefore(request.getEndDate())
                && !request.getStartDate().isEqual(request.getEndDate())) {
            // Permite mesmo dia (semana de 1 dia) mas endDate não pode ser antes de startDate
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException(
                    "A data de fim da semana de prova deve ser igual ou posterior à data de início."
            );
        }

        if (request.getStartDate().isBefore(semester.getStartDate())
                || request.getEndDate().isAfter(semester.getEndDate())) {
            throw new BusinessException(
                    "O período da semana de prova deve estar dentro do semestre ("
                    + semester.getStartDate() + " a " + semester.getEndDate() + ")."
            );
        }

        // Verifica duplicidade de tipo (ao criar — excludeId == null)
        if (excludeId == null
                && examWeekRepository.existsBySemesterIdAndExamType(semester.getId(), request.getExamType())) {
            throw new BusinessException(
                    "Já existe uma semana de " + request.getExamType()
                    + " cadastrada para este semestre."
            );
        }
    }

    private ExamWeek getOrThrow(Integer id) {
        return examWeekRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semana de prova não encontrada: " + id));
    }

    public ExamWeekDTO toDTO(ExamWeek ew) {
        return new ExamWeekDTO(
                ew.getId(),
                ew.getSemester().getId(),
                ew.getSemester().getName(),
                ew.getExamType(),
                ew.getStartDate(),
                ew.getEndDate(),
                ew.getDescription(),
                ew.getCreatedAt(),
                ew.getUpdatedAt()
        );
    }
}
