package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.DTO.PeriodDTO;
import br.com.fatec.fatecrooms.DTO.PeriodRequest;
import br.com.fatec.fatecrooms.service.PeriodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/periods")
@RequiredArgsConstructor
public class PeriodController {

    private final PeriodService periodService;

    /** Lista períodos ativos — qualquer usuário autenticado. */
    @GetMapping
    public ResponseEntity<List<PeriodDTO>> listActive() {
        return ResponseEntity.ok(periodService.listActive());
    }

    /** Lista todos os períodos (ativos + inativos) — coordenador. */
    @GetMapping("/all")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<PeriodDTO>> listAll() {
        return ResponseEntity.ok(periodService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PeriodDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(periodService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<PeriodDTO> create(@Valid @RequestBody PeriodRequest request) {
        return ResponseEntity.ok(periodService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<PeriodDTO> update(
            @PathVariable Integer id,
            @Valid @RequestBody PeriodRequest request) {
        return ResponseEntity.ok(periodService.update(id, request));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<String> toggleActive(@PathVariable Integer id) {
        return ResponseEntity.ok(periodService.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        return ResponseEntity.ok(periodService.delete(id));
    }
}