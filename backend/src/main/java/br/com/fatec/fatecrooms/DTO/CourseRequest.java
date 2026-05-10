package br.com.fatec.fatecrooms.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseRequest {

    @NotBlank(message = "O nome do curso é obrigatório.")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres.")
    private String name;

    @NotBlank(message = "A abreviação do curso é obrigatória.")
    @Size(max = 20, message = "Abreviação deve ter no máximo 20 caracteres.")
    private String abbreviation;

    private boolean hasSaturday = false;
}