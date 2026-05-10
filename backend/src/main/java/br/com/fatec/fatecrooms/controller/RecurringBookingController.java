package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.DTO.CancelInstanceRequest;
import br.com.fatec.fatecrooms.DTO.RecurringBookingDTO;
import br.com.fatec.fatecrooms.DTO.RecurringBookingInstanceDTO;
import br.com.fatec.fatecrooms.DTO.RecurringBookingRequest;
import br.com.fatec.fatecrooms.service.RecurringBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recurring-bookings")
@RequiredArgsConstructor
public class RecurringBookingController {

    private final RecurringBookingService recurringBookingService;

    // apenas coordenador
    /**
     * GET /api/recurring-bookings
     * Lista todas as reservas recorrentes.
     */
    @GetMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<RecurringBookingDTO>> listAll() {
        return ResponseEntity.ok(recurringBookingService.listAll());
    }

    /**
     * GET /api/recurring-bookings/by-semester/{semesterId}
     * Lista reservas recorrentes de um semestre específico.
     */
    @GetMapping("/by-semester/{semesterId}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<RecurringBookingDTO>> listBySemester(
            @PathVariable Integer semesterId) {
        return ResponseEntity.ok(recurringBookingService.listBySemester(semesterId));
    }

    /**
     * GET /api/recurring-bookings/{id}
     * Detalhe de uma reserva recorrente.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<RecurringBookingDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(recurringBookingService.findById(id));
    }

    /**
     * GET /api/recurring-bookings/{id}/instances
     * Lista todas as instâncias (datas concretas) de uma reserva recorrente.
     */
    @GetMapping("/{id}/instances")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<RecurringBookingInstanceDTO>> listInstances(
            @PathVariable Integer id) {
        return ResponseEntity.ok(recurringBookingService.listInstances(id));
    }


    //apenas coordenador
    /**
     * POST /api/recurring-bookings
     * Cria nova reserva recorrente semestral e gera todas as instâncias.
     * Body: { semesterId, roomId, classGroupId, periodIds, weekDays, subject, notes }
     */
    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<RecurringBookingDTO> create(
            @Valid @RequestBody RecurringBookingRequest request,
            Authentication auth) {
        return ResponseEntity.ok(recurringBookingService.create(auth.getName(), request));
    }

    /**
     * PATCH /api/recurring-bookings/{id}/cancel
     * Cancela a reserva recorrente inteira e todas as instâncias futuras.
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<RecurringBookingDTO> cancel(
            @PathVariable Integer id,
            Authentication auth) {
        return ResponseEntity.ok(recurringBookingService.cancel(id, auth.getName()));
    }

    /**
     * PATCH /api/recurring-bookings/{id}/instances/{instanceId}/cancel
     * Cancela uma instância específica (ex: suspensão de aula num dia pontual).
     * Body (opcional): { "reason": "motivo" }
     */
    @PatchMapping("/{id}/instances/{instanceId}/cancel")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<RecurringBookingInstanceDTO> cancelInstance(
            @PathVariable Integer id,
            @PathVariable Integer instanceId,
            @RequestBody(required = false) CancelInstanceRequest request) {
        String reason = request != null ? request.getReason() : null;
        return ResponseEntity.ok(
                recurringBookingService.cancelInstance(id, instanceId, reason));
    }

    /**
     * GET /api/recurring-bookings/{id}/instances/summary
     * Retorna um resumo rápido de instâncias (total, ativas, canceladas, puladas).
     */
    @GetMapping("/{id}/instances/summary")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Map<String, Object>> instancesSummary(@PathVariable Integer id) {
        RecurringBookingDTO dto = recurringBookingService.findById(id);
        return ResponseEntity.ok(Map.of(
                "recurringBookingId", id,
                "total",     dto.getTotalInstances(),
                "active",    dto.getActiveInstances(),
                "cancelled", dto.getCancelledInstances(),
                "skipped",   dto.getSkippedInstances()
        ));
    }
}