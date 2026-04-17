package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {
}