package br.com.fatec.fatecrooms.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RegisterRequest {
    @NotBlank
    private String username;

    @NotBlank
    @Size(min = 6, message = "Senha deve ter ao menos 6 caracteres")
    private String password;

    @NotBlank
    private String firstname;

    @NotBlank
    private String lastname;

    @Email @NotBlank
    private String email;

    private String displayname;
    private String ext;
    private Integer departmentId;
}