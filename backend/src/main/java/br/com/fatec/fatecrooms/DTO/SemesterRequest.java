package br.com.fatec.fatecrooms.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SemesterRequest {

    @NotBlank(message = "O nome do semestre é obrigatório.")
    private String name;

    @NotNull(message = "A data de início é obrigatória.")
    private LocalDate startDate;

    @NotNull(message = "A data de fim é obrigatória.")
    private LocalDate endDate;

    private Byte active = 1;
}
