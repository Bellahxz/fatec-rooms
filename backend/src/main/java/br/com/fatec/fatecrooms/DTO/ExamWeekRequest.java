package br.com.fatec.fatecrooms.DTO;

import br.com.fatec.fatecrooms.model.ExamWeek;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ExamWeekRequest {

    @NotNull(message = "O tipo de prova é obrigatório (P1, P2 ou P3).")
    private ExamWeek.ExamType examType;

    @NotNull(message = "A data de início da semana de prova é obrigatória.")
    private LocalDate startDate;

    @NotNull(message = "A data de fim da semana de prova é obrigatória.")
    private LocalDate endDate;

    private String description;
}
