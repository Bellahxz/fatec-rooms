package br.com.fatec.fatecrooms.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    private Integer examWeekCount;
}
