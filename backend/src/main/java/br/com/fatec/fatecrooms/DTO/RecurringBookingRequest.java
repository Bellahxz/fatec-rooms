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
     * Dias da semana em que a reserva ocorre.
     * Valores aceitos: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY.
     * SATURDAY só é permitido se a turma tiver has_saturday = true.
     * Não é necessário incluir todos os dias — o coordenador escolhe quais dias
     * a turma tem aula presencial (ex: algumas turmas são híbridas).
     */
    @NotEmpty(message = "Selecione ao menos um dia da semana.")
    private List<String> weekDays;

    @NotBlank(message = "A matéria/disciplina é obrigatória.")
    private String subject;

    private String notes;
}