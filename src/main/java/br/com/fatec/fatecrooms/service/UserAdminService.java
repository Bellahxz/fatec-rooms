package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.UserSummaryDTO;
import br.com.fatec.fatecrooms.model.User;
import br.com.fatec.fatecrooms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository UserRepository;

    /**
     * Lista cadastros aguardando aprovação (authlevel = 0).
     */
    public List<UserSummaryDTO> listPendingRegistrations() {
        return UserRepository.findByAuthlevel((byte) 0)
                .stream()
                .map(this::toSummary)
                .toList();
    }

    /**
     * Aprova o cadastro de um usuário pendente.
     * Após aprovado, ele pode fazer login livremente — sem precisar de nova autorização.
     */
    public String approveRegistration(Integer userId, Byte authlevel) {
        if (authlevel != 1 && authlevel != 2) {
            throw new IllegalArgumentException("Nível inválido. Use 1 para coordenador ou 2 para professor.");
        }

        User user = findPendingUser(userId);
        user.setAuthlevel(authlevel);
        user.setEnabled((byte) 1);
        UserRepository.save(user);

        String role = authlevel == 1 ? "coordenador" : "professor";
        return "Cadastro de '" + user.getUsername() + "' aprovado como " + role + ".";
    }

    /**
     * Rejeita e remove o cadastro pendente.
     */
    public String rejectRegistration(Integer userId) {
        User user = findPendingUser(userId);
        UserRepository.delete(user);

        return "Cadastro de '" + user.getUsername() + "' rejeitado e removido.";
    }

    /**
     * Lista todos os usuários (para visão geral do coordenador).
     */
    public List<UserSummaryDTO> listAllUsers() {
        return UserRepository.findAll()
                .stream()
                .map(this::toSummary)
                .toList();
    }

    /**
     * Desabilita um usuário ativo (suspensão — não afeta o fluxo de aprovação de cadastro).
     */
    public String disableUser(Integer userId) {
        User user = UserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (user.getEnabled() == 0) {
            throw new IllegalStateException("Usuário já está desabilitado.");
        }

        user.setEnabled((byte) 0);
        UserRepository.save(user);

        return "Usuário '" + user.getUsername() + "' desabilitado.";
    }

    // ----- helpers privados -----

    private User findPendingUser(Integer userId) {
        User user = UserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (user.getAuthlevel() != 0) {
            throw new IllegalStateException("Este cadastro não está pendente de aprovação.");
        }
        return user;
    }

    private UserSummaryDTO toSummary(User u) {
        return new UserSummaryDTO(
                u.getId(), u.getUsername(), u.getFirstname(),
                u.getLastname(), u.getEmail(), u.getAuthlevel(), u.getEnabled()
        );
    }
}