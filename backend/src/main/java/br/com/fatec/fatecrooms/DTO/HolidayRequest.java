package br.com.fatec.fatecrooms.DTO;

import br.com.fatec.fatecrooms.model.Holiday;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class HolidayRequest {

    @NotBlank(message = "O nome do feriado é obrigatório.")
    private String name;

    @NotNull(message = "A data do feriado é obrigatória.")
    private LocalDate holidayDate;

    private Holiday.Type type = Holiday.Type.CUSTOM;

    private String description;
}
