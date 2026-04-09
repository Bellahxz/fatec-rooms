package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.*;
import br.com.fatec.fatecrooms.model.User;
import br.com.fatec.fatecrooms.repository.UserRepository;
import br.com.fatec.fatecrooms.security.JwtService;
import br.com.fatec.fatecrooms.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    /**
     * Qualquer pessoa pode se cadastrar.
     * O cadastro fica pendente (authlevel=0, enabled=0) até um coordenador aprovar.
     */
    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username já está em uso.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("E-mail já está em uso.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setEmail(request.getEmail());
        user.setDisplayname(
                request.getDisplayname() != null
                        ? request.getDisplayname()
                        : request.getFirstname() + " " + request.getLastname()
        );
        user.setExt(request.getExt());
        user.setDepartmentId(request.getDepartmentId());
        user.setAuthlevel((byte) 0);  // pendente de aprovação
        user.setEnabled((byte) 0);    // bloqueado até ser aprovado
        user.setCreated(LocalDateTime.now());

        userRepository.save(user);

        return "Cadastro realizado com sucesso! Aguarde a aprovação de um coordenador.";
    }

    /**
     * Login por e-mail institucional.
     * Internamente busca o username pelo email e autentica normalmente via Spring Security.
     */
    public AuthResponse login(LoginRequest request) {
        // Busca o usuário pelo email informado
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Usuário ou senha inválidos."));

        // Verificação antecipada: cadastro ainda não aprovado
        if (user.getEnabled() == 0) {
            throw new DisabledException("Seu cadastro ainda não foi aprovado por um coordenador.");
        }

        // Autentica usando o username internamente (Spring Security trabalha com username)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        user.setLastlogin(LocalDateTime.now());
        userRepository.save(user);

        return new AuthResponse(token, user.getUsername(), user.getAuthlevel(), "Login realizado com sucesso.");
    }
}