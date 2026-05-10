package br.com.fatec.fatecrooms.DTO;

import br.com.fatec.fatecrooms.model.ClassGroup;
import br.com.fatec.fatecrooms.model.RecurringBooking;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class RecurringBookingDTO {

    private Integer id;

    // Semestre acadêmico
    private Integer semesterId;
    private String semesterName;

    // Sala
    private Integer roomId;
    private String roomName;
    private String roomLocation;

    // Turma
    private Integer classGroupId;
    private String classGroupLabel;
    private ClassGroup.Shift shift;

    // Curso
    private Integer courseId;
    private String courseName;
    private String courseAbbreviation;

    // Quem criou
    private Integer createdById;
    private String createdByUsername;

    // Períodos
    private List<PeriodSummary> periods;

    // Configuração de recorrência
    private List<String> weekDays;

    private String subject;
    private String notes;
    private RecurringBooking.Status status;

    // Estatísticas de instâncias
    private int totalInstances;
    private int activeInstances;
    private int cancelledInstances;
    private int skippedInstances;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @AllArgsConstructor
    public static class PeriodSummary {
        private Integer periodId;
        private String periodName;
        private LocalTime periodStart;
        private LocalTime periodEnd;
    }
}