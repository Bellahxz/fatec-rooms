package br.com.fatec.fatecrooms.DTO;

import br.com.fatec.fatecrooms.model.RecurringBookingInstance;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class RecurringBookingInstanceDTO {
    private Integer id;
    private Integer recurringBookingId;
    private LocalDate bookingDate;
    private RecurringBookingInstance.Status status;
    private String skipReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}