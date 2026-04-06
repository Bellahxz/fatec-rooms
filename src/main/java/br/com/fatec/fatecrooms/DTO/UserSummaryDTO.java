package br.com.fatec.fatecrooms.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserSummaryDTO {
    private Integer id;
    private String username;
    private String firstname;
    private String lastname;
    private String email;
    private Byte authlevel;
    private Byte enabled;
}
