package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.DTO.ExamWeekDTO;
import br.com.fatec.fatecrooms.DTO.ExamWeekRequest;
import br.com.fatec.fatecrooms.service.ExamWeekService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/semesters/{semesterId}/exam-weeks")
@RequiredArgsConstructor
public class ExamWeekController {

    private final ExamWeekService examWeekService;

    /**
     * GET /api/semesters/{semesterId}/exam-weeks
     * Lista as semanas de prova de um semestre — qualquer usuário autenticado.
     * O frontend usa isso para colorir o calendário com as sugestões de P1/P2/P3.
     */
    @GetMapping
    public ResponseEntity<List<ExamWeekDTO>> listBySemester(@PathVariable Integer semesterId) {
        return ResponseEntity.ok(examWeekService.listBySemester(semesterId));
    }

    /**
     * GET /api/semesters/{semesterId}/exam-weeks/{id}
     * Detalhe de uma semana de prova específica.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExamWeekDTO> findById(
            @PathVariable Integer semesterId,
            @PathVariable Integer id) {
        return ResponseEntity.ok(examWeekService.findById(id));
    }

    /**
     * POST /api/semesters/{semesterId}/exam-weeks
     * Cadastra uma semana de prova (P1, P2 ou P3) no semestre — coordenador.
     * Cada tipo (P1/P2/P3) pode ser cadastrado apenas uma vez por semestre.
     */
    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<ExamWeekDTO> create(
            @PathVariable Integer semesterId,
            @Valid @RequestBody ExamWeekRequest request) {
        return ResponseEntity.ok(examWeekService.create(semesterId, request));
    }

    /**
     * PUT /api/semesters/{semesterId}/exam-weeks/{id}
     * Atualiza uma semana de prova — coordenador.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<ExamWeekDTO> update(
            @PathVariable Integer semesterId,
            @PathVariable Integer id,
            @Valid @RequestBody ExamWeekRequest request) {
        return ResponseEntity.ok(examWeekService.update(id, request));
    }

    /**
     * DELETE /api/semesters/{semesterId}/exam-weeks/{id}
     * Remove uma semana de prova — coordenador.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Integer semesterId,
            @PathVariable Integer id) {
        String message = examWeekService.delete(id);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
