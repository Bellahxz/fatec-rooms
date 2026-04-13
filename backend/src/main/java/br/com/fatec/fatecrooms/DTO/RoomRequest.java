package br.com.fatec.fatecrooms.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoomRequest {

    @NotBlank
    private String name;

    private String location;

    private Byte bookable = 1;

    private String notes;
}