package br.com.fatec.fatecrooms.DTO;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BookingRequest {

    @NotNull
    private Integer roomId;

    @NotNull
    private Integer periodId;

    @NotNull
    @Future(message = "A data da reserva deve ser futura")
    private LocalDate bookingDate;

    @NotBlank(message = "A matéria é obrigatória")
    private String subject;

    private String notes;
}