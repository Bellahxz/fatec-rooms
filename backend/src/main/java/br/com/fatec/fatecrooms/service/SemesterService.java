package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.SemesterDTO;
import br.com.fatec.fatecrooms.DTO.SemesterRequest;
import br.com.fatec.fatecrooms.exception.BusinessException;
import br.com.fatec.fatecrooms.exception.ResourceNotFoundException;
import br.com.fatec.fatecrooms.model.Semester;
import br.com.fatec.fatecrooms.repository.SemesterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SemesterService {

    private final SemesterRepository semesterRepository;

    // ─────────────────────────────────────────────
    //  CONSULTAS
    // ─────────────────────────────────────────────

    public List<SemesterDTO> listAll() {
        return semesterRepository.findAllByOrderByStartDateDesc()
                .stream().map(this::toDTO).toList();
    }

    public List<SemesterDTO> listActive() {
        return semesterRepository.findByActiveOrderByStartDateDesc((byte) 1)
                .stream().map(this::toDTO).toList();
    }

    public SemesterDTO findById(Integer id) {
        return toDTO(getOrThrow(id));
    }

    /** Retorna o semestre ativo que abrange uma data específica. */
    public Optional<SemesterDTO> findActiveByDate(LocalDate date) {
        return semesterRepository.findActiveByDate(date).map(this::toDTO);
    }

    // ─────────────────────────────────────────────
    //  OPERAÇÕES (apenas coordenador)
    // ─────────────────────────────────────────────

    @Transactional
    public SemesterDTO create(SemesterRequest request) {
        validate(request, null);

        Semester semester = new Semester();
        semester.setName(request.getName().trim());
        semester.setStartDate(request.getStartDate());
        semester.setEndDate(request.getEndDate());
        semester.setActive(request.getActive() != null ? request.getActive() : (byte) 1);

        return toDTO(semesterRepository.save(semester));
    }

    @Transactional
    public SemesterDTO update(Integer id, SemesterRequest request) {
        Semester semester = getOrThrow(id);
        validate(request, id);

        semester.setName(request.getName().trim());
        semester.setStartDate(request.getStartDate());
        semester.setEndDate(request.getEndDate());
        if (request.getActive() != null) {
            semester.setActive(request.getActive());
        }

        return toDTO(semesterRepository.save(semester));
    }

    @Transactional
    public String toggleActive(Integer id) {
        Semester semester = getOrThrow(id);
        boolean nowActive = semester.getActive() == 0;
        semester.setActive((byte) (nowActive ? 1 : 0));
        semesterRepository.save(semester);
        return "Semestre '" + semester.getName() + "' " + (nowActive ? "ativado" : "desativado") + ".";
    }

    @Transactional
    public String delete(Integer id) {
        Semester semester = getOrThrow(id);
        semesterRepository.delete(semester);
        return "Semestre '" + semester.getName() + "' removido com sucesso.";
    }

    // ─────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────

    private void validate(SemesterRequest request, Integer excludeId) {
        if (!request.getStartDate().isBefore(request.getEndDate())) {
            throw new BusinessException("A data de início deve ser anterior à data de fim.");
        }

        if (semesterRepository.existsOverlap(request.getStartDate(), request.getEndDate(), excludeId)) {
            throw new BusinessException(
                    "As datas informadas se sobrepõem com outro semestre ativo já cadastrado."
            );
        }
    }

    public Semester getOrThrow(Integer id) {
        return semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semestre não encontrado: " + id));
    }

    public SemesterDTO toDTO(Semester s) {
        return new SemesterDTO(
                s.getId(),
                s.getName(),
                s.getStartDate(),
                s.getEndDate(),
                s.getActive(),
                s.getCreatedAt(),
                s.getUpdatedAt(),
                s.getExamWeeks().size()
        );
    }
}
