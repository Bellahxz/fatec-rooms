package br.com.fatec.fatecrooms.DTO;

import br.com.fatec.fatecrooms.model.Booking;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class BookingDTO {

    private Integer id;

    // Sala
    private Integer roomId;
    private String roomName;
    private String roomLocation;

    // Usuário
    private Integer userId;
    private String username;
    private String userDisplayName;

    // Período
    private Integer periodId;
    private String periodName;
    private LocalTime periodStart;
    private LocalTime periodEnd;

    // Reserva
    private LocalDate bookingDate;
    private String subject;
    private String notes;
    private Booking.Status status;

    // Revisão
    private String reviewedByUsername;
    private LocalDateTime reviewedAt;
    private String rejectReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}