package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.DTO.SemesterDTO;
import br.com.fatec.fatecrooms.DTO.SemesterRequest;
import br.com.fatec.fatecrooms.service.SemesterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/semesters")
@RequiredArgsConstructor
public class SemesterController {

    private final SemesterService semesterService;

    /**
     * GET /api/semesters
     * Lista todos os semestres ativos — qualquer usuário autenticado.
     */
    @GetMapping
    public ResponseEntity<List<SemesterDTO>> listActive() {
        return ResponseEntity.ok(semesterService.listActive());
    }

    /**
     * GET /api/semesters/all
     * Lista todos os semestres (ativos e inativos) — coordenador.
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<SemesterDTO>> listAll() {
        return ResponseEntity.ok(semesterService.listAll());
    }

    /**
     * GET /api/semesters/{id}
     * Detalhe de um semestre específico.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SemesterDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(semesterService.findById(id));
    }

    /**
     * GET /api/semesters/by-date?date=2025-08-10
     * Retorna o semestre ativo que contém a data informada.
     */
    @GetMapping("/by-date")
    public ResponseEntity<?> findByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return semesterService.findActiveByDate(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    /**
     * POST /api/semesters
     * Cria um novo semestre — coordenador.
     */
    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<SemesterDTO> create(@Valid @RequestBody SemesterRequest request) {
        return ResponseEntity.ok(semesterService.create(request));
    }

    /**
     * PUT /api/semesters/{id}
     * Atualiza um semestre — coordenador.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<SemesterDTO> update(
            @PathVariable Integer id,
            @Valid @RequestBody SemesterRequest request) {
        return ResponseEntity.ok(semesterService.update(id, request));
    }

    /**
     * PATCH /api/semesters/{id}/toggle
     * Ativa ou desativa um semestre — coordenador.
     */
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Map<String, String>> toggleActive(@PathVariable Integer id) {
        String message = semesterService.toggleActive(id);
        return ResponseEntity.ok(Map.of("message", message));
    }

    /**
     * DELETE /api/semesters/{id}
     * Remove um semestre e todos os seus feriados e semanas de prova (cascade) — coordenador.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Integer id) {
        String message = semesterService.delete(id);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
