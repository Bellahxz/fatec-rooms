package br.com.fatec.fatecrooms.DTO;

import br.com.fatec.fatecrooms.model.ExamWeek;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ExamWeekDTO {

    private Integer id;
    private Integer semesterId;
    private String semesterName;
    private ExamWeek.ExamType examType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
