package br.com.fatec.fatecrooms.security;

import br.com.fatec.fatecrooms.model.User;
import br.com.fatec.fatecrooms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));

        String role = switch (user.getAuthlevel()) {
            case 1 -> "ROLE_COORDINATOR";
            case 2 -> "ROLE_TEACHER";
            default -> "ROLE_PENDING";
        };

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority(role)))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(user.getEnabled().equals((byte) 0)) // disabled=true quando enabled=0 (pendente)
                .build();
    }
}