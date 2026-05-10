package br.com.fatec.fatecrooms.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CourseDTO {
    private Integer id;
    private String  name;
    private String  abbreviation;
    private boolean hasSaturday;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}