package br.com.fatec.fatecrooms.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private Byte authlevel;
    private String message;
}