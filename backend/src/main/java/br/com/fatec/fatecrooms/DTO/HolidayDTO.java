package br.com.fatec.fatecrooms.DTO;

import br.com.fatec.fatecrooms.model.Holiday;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class HolidayDTO {

    private Integer id;
    private Integer semesterId;
    private String semesterName;
    private String name;
    private LocalDate holidayDate;
    private Holiday.Type type;
    private String description;
    private LocalDateTime createdAt;
}
