package br.com.fatec.fatecrooms.DTO;

import br.com.fatec.fatecrooms.model.ClassGroup;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ClassGroupDTO {
    private Integer id;
    private Integer courseId;
    private String courseName;
    private String courseAbbreviation;
    private int courseSemester;
    private ClassGroup.Shift shift;
    private String label;
    private boolean active;
}