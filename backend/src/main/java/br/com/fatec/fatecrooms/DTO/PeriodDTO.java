package br.com.fatec.fatecrooms.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class PeriodDTO {
    private Integer id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private Byte active;
}