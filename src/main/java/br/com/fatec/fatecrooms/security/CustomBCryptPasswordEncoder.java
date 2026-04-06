package br.com.fatec.fatecrooms.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class CustomBCryptPasswordEncoder implements PasswordEncoder {

    private final BCryptPasswordEncoder delegate = new BCryptPasswordEncoder();

    @Override
    public String encode(CharSequence rawPassword) {
        // Novas senhas são salvas com $2a$ (padrão Java)
        return delegate.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        // Normaliza $2y$ e $2b$ para $2a$ antes de comparar
        String normalized = encodedPassword.replace("$2y$", "$2a$")
                .replace("$2b$", "$2a$");
        return delegate.matches(rawPassword, normalized);
    }
}