package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.DTO.HolidayDTO;
import br.com.fatec.fatecrooms.DTO.HolidayRequest;
import br.com.fatec.fatecrooms.DTO.NationalHolidayDTO;
import br.com.fatec.fatecrooms.service.HolidayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/semesters/{semesterId}/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayService holidayService;

    /**
     * GET /api/semesters/{semesterId}/holidays
     * Lista todos os feriados de um semestre — qualquer usuário autenticado.
     */
    @GetMapping
    public ResponseEntity<List<HolidayDTO>> listBySemester(@PathVariable Integer semesterId) {
        return ResponseEntity.ok(holidayService.listBySemester(semesterId));
    }

    /**
     * GET /api/semesters/{semesterId}/holidays/{id}
     * Detalhe de um feriado específico.
     */
    @GetMapping("/{id}")
    public ResponseEntity<HolidayDTO> findById(
            @PathVariable Integer semesterId,
            @PathVariable Integer id) {
        return ResponseEntity.ok(holidayService.findById(id));
    }

    /**
     * GET /api/semesters/{semesterId}/holidays/national/preview
     * Consulta os feriados nacionais disponíveis para o semestre via BrasilAPI.
     * Não persiste — apenas prévia para o coordenador.
     */
    @GetMapping("/national/preview")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<NationalHolidayDTO>> previewNational(@PathVariable Integer semesterId) {
        return ResponseEntity.ok(holidayService.previewNationalHolidays(semesterId));
    }

    /**
     * POST /api/semesters/{semesterId}/holidays/national/import
     * Importa todos os feriados nacionais do semestre via BrasilAPI.
     * Ignora datas já cadastradas.
     */
    @PostMapping("/national/import")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<HolidayDTO>> importNational(@PathVariable Integer semesterId) {
        return ResponseEntity.ok(holidayService.importNationalHolidays(semesterId));
    }

    /**
     * POST /api/semesters/{semesterId}/holidays
     * Cria um feriado personalizado no semestre — coordenador.
     * Pode ser usado para feriados municipais, aniversário da instituição,
     * emendas de feriado, recessos, etc.
     */
    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<HolidayDTO> create(
            @PathVariable Integer semesterId,
            @Valid @RequestBody HolidayRequest request) {
        return ResponseEntity.ok(holidayService.create(semesterId, request));
    }

    /**
     * PUT /api/semesters/{semesterId}/holidays/{id}
     * Atualiza um feriado — coordenador.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<HolidayDTO> update(
            @PathVariable Integer semesterId,
            @PathVariable Integer id,
            @Valid @RequestBody HolidayRequest request) {
        return ResponseEntity.ok(holidayService.update(id, request));
    }

    /**
     * DELETE /api/semesters/{semesterId}/holidays/{id}
     * Remove um feriado — coordenador.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Integer semesterId,
            @PathVariable Integer id) {
        String message = holidayService.delete(id);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
