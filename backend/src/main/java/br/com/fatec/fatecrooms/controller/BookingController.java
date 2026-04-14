package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.DTO.*;
import br.com.fatec.fatecrooms.model.Booking;
import br.com.fatec.fatecrooms.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ─────────────────────────────────────────────
    //  DISPONIBILIDADE / CALENDÁRIO (abertas para auth)
    // ─────────────────────────────────────────────

    /**
     * GET /api/bookings/availability?roomId=1&date=2025-08-10
     * Retorna todos os períodos ativos com flag available=true/false.
     */
    @GetMapping("/availability")
    public ResponseEntity<AvailabilityDTO> getAvailability(
            @RequestParam Integer roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getAvailability(roomId, date));
    }

    /**
     * GET /api/bookings/calendar?roomId=1&start=2025-08-01&end=2025-08-31
     * Retorna reservas aprovadas/pendentes de uma sala num período.
     */
    @GetMapping("/calendar")
    public ResponseEntity<List<BookingDTO>> getRoomCalendar(
            @RequestParam Integer roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(bookingService.getRoomCalendar(roomId, start, end));
    }

    // ─────────────────────────────────────────────
    //  PROFESSOR — operações sobre as próprias reservas
    // ─────────────────────────────────────────────

    /**
     * POST /api/bookings
     * Cria nova reserva (status inicial = PENDING).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR')")
    public ResponseEntity<BookingDTO> create(
            @Valid @RequestBody BookingRequest request,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.create(auth.getName(), request));
    }

    /**
     * GET /api/bookings/my
     * Lista reservas do usuário logado.
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR')")
    public ResponseEntity<List<BookingDTO>> listMyBookings(Authentication auth) {
        return ResponseEntity.ok(bookingService.listMyBookings(auth.getName()));
    }

    /**
     * GET /api/bookings/{id}
     * Detalhe de uma reserva específica.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR')")
    public ResponseEntity<BookingDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.findById(id));
    }

    /**
     * PATCH /api/bookings/{id}/cancel
     * Professor cancela a própria reserva.
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR')")
    public ResponseEntity<BookingDTO> cancel(
            @PathVariable Integer id,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.cancel(auth.getName(), id));
    }

    /**
     * PATCH /api/bookings/{id}/notes
     * Atualiza somente as observações da reserva.
     */
    @PatchMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR')")
    public ResponseEntity<BookingDTO> updateNotes(
            @PathVariable Integer id,
            @RequestBody BookingNotesRequest request,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.updateNotes(auth.getName(), id, request));
    }

    // ─────────────────────────────────────────────
    //  COORDENADOR — visão administrativa
    // ─────────────────────────────────────────────

    /**
     * GET /api/bookings/admin/all
     * Lista todas as reservas.
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<BookingDTO>> listAll() {
        return ResponseEntity.ok(bookingService.listAll());
    }

    /**
     * GET /api/bookings/admin/pending
     * Lista somente reservas pendentes de aprovação.
     */
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<BookingDTO>> listPending() {
        return ResponseEntity.ok(bookingService.listByStatus(Booking.Status.PENDING));
    }

    /**
     * GET /api/bookings/admin/by-status?status=APPROVED
     * Lista por status (PENDING | APPROVED | REJECTED | CANCELLED).
     */
    @GetMapping("/admin/by-status")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<BookingDTO>> listByStatus(
            @RequestParam Booking.Status status) {
        return ResponseEntity.ok(bookingService.listByStatus(status));
    }

    /**
     * GET /api/bookings/admin/by-date?date=2025-08-10
     * Agenda do dia.
     */
    @GetMapping("/admin/by-date")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<BookingDTO>> listByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.listByDate(date));
    }

    /**
     * POST /api/bookings/admin/{id}/review
     * Aprova ou rejeita reserva.
     * Body: { "approved": true } ou { "approved": false, "rejectReason": "motivo" }
     */
    @PostMapping("/admin/{id}/review")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<BookingDTO> review(
            @PathVariable Integer id,
            @RequestBody BookingReviewRequest request,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.review(auth.getName(), id, request));
    }

    /**
     * PATCH /api/bookings/admin/{id}/cancel
     * Coordenador cancela qualquer reserva ativa.
     */
    @PatchMapping("/admin/{id}/cancel")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<BookingDTO> cancelByCoordinator(
            @PathVariable Integer id,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.cancelByCoordinator(auth.getName(), id));
    }
}