package br.com.fatec.fatecrooms.DTO;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class BookingRequest {

    @NotNull
    private Integer roomId;

    @NotEmpty(message = "Selecione ao menos um período")
    private List<Integer> periodIds;

    @NotNull
    @Future(message = "A data da reserva deve ser futura")
    private LocalDate bookingDate;

    @NotBlank(message = "A matéria é obrigatória")
    private String subject;

    private String notes;
}