package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.Period;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PeriodRepository extends JpaRepository<Period, Integer> {
    List<Period> findByActiveOrderByStartTime(Byte active);
}