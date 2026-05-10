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

    private Integer semesterId;
    private String  semesterName;

    private Integer roomId;
    private String  roomName;
    private String  roomLocation;

    private Integer classGroupId;
    private String  classGroupLabel;
    private ClassGroup.Shift shift;
    private boolean classGroupHasSaturday;

    private Integer courseId;
    private String  courseName;
    private String  courseAbbreviation;

    private Integer createdById;
    private String  createdByUsername;

    private List<PeriodSummary> periods;

    // Dias da semana selecionados.
    private List<String> weekDays;

    private String  subject;
    private String  notes;
    private RecurringBooking.Status status;

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
        private String  periodName;
        private LocalTime periodStart;
        private LocalTime periodEnd;
    }
}