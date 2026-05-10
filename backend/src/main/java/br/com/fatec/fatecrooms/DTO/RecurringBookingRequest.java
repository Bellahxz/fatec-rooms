package br.com.fatec.fatecrooms.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RecurringBookingRequest {

    @NotNull(message = "O semestre é obrigatório.")
    private Integer semesterId;

    @NotNull(message = "A sala é obrigatória.")
    private Integer roomId;

    @NotNull(message = "A turma é obrigatória.")
    private Integer classGroupId;

    @NotEmpty(message = "Selecione ao menos um período.")
    private List<Integer> periodIds;

    /**
     * Dias da semana: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY.
     * Para turmas de sábado, deve conter apenas ["SATURDAY"].
     * Para turmas normais, deve conter de 1 a 5 dias úteis.
     */
    @NotEmpty(message = "Selecione ao menos um dia da semana.")
    private List<String> weekDays;

    @NotBlank(message = "A matéria/disciplina é obrigatória.")
    private String subject;

    private String notes;
}