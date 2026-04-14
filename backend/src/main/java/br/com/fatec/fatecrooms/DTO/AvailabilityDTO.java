package br.com.fatec.fatecrooms.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class AvailabilityDTO {
    private Integer roomId;
    private String roomName;
    private LocalDate date;
    private List<PeriodAvailabilityDTO> periods;

    @Getter
    @AllArgsConstructor
    public static class PeriodAvailabilityDTO {
        private Integer periodId;
        private String periodName;
        private java.time.LocalTime startTime;
        private java.time.LocalTime endTime;
        private boolean available;
    }
}