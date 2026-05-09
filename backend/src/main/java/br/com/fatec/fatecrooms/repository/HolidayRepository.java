package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface HolidayRepository extends JpaRepository<Holiday, Integer> {

    List<Holiday> findAllByOrderByHolidayDateAsc();

    boolean existsByHolidayDate(LocalDate holidayDate);
}
