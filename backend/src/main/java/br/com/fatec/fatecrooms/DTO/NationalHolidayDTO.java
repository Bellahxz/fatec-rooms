package br.com.fatec.fatecrooms.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NationalHolidayDTO {

    @JsonProperty("date")
    private String date;        // formato "YYYY-MM-DD"

    @JsonProperty("name")
    private String name;

    @JsonProperty("type")
    private String type;        // "national" ou "optional"
}
