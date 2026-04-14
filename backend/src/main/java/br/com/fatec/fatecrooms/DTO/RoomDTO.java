package br.com.fatec.fatecrooms.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RoomDTO {
    private Integer id;
    private String name;
    private String location;
    private Byte bookable;
    private String notes;
}