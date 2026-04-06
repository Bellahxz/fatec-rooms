package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByAuthlevel(Byte authlevel); // buscar pendentes (0)
}