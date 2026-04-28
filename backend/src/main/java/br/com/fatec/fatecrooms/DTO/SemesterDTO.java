package br.com.fatec.fatecrooms.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class SemesterDTO {

    private Integer id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Byte active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Resumo de quantidade — evita trafegar listas inteiras no listing
    private Integer holidayCount;
    private Integer examWeekCount;
}
