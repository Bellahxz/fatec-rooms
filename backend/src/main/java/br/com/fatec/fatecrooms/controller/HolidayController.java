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
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayService holidayService;

    /**
     * GET /api/holidays
     * Lista todos os feriados — qualquer usuário autenticado.
     */
    @GetMapping
    public ResponseEntity<List<HolidayDTO>> listAll() {
        return ResponseEntity.ok(holidayService.listAll());
    }

    /**
     * GET /api/holidays/{id}
     * Detalhe de um feriado específico.
     */
    @GetMapping("/{id}")
    public ResponseEntity<HolidayDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(holidayService.findById(id));
    }

    /**
     * GET /api/holidays/national/preview?year=2026
     * Consulta os feriados nacionais disponíveis via BrasilAPI.
     * Não persiste — apenas prévia para o coordenador.
     */
    @GetMapping("/national/preview")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<NationalHolidayDTO>> previewNational(
            @RequestParam int year) {
        return ResponseEntity.ok(holidayService.previewNationalHolidays(year));
    }

    /**
     * POST /api/holidays/national/import?year=2026
     * Importa todos os feriados nacionais do ano via BrasilAPI.
     * Ignora datas já cadastradas.
     */
    @PostMapping("/national/import")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<HolidayDTO>> importNational(@RequestParam int year) {
        return ResponseEntity.ok(holidayService.importNationalHolidays(year));
    }

    /**
     * POST /api/holidays
     * Cria um feriado — coordenador.
     */
    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<HolidayDTO> create(@Valid @RequestBody HolidayRequest request) {
        return ResponseEntity.ok(holidayService.create(request));
    }

    /**
     * PUT /api/holidays/{id}
     * Atualiza um feriado — coordenador.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<HolidayDTO> update(
            @PathVariable Integer id,
            @Valid @RequestBody HolidayRequest request) {
        return ResponseEntity.ok(holidayService.update(id, request));
    }

    /**
     * DELETE /api/holidays/{id}
     * Remove um feriado — coordenador.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Integer id) {
        String message = holidayService.delete(id);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
