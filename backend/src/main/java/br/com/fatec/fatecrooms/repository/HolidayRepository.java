package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface HolidayRepository extends JpaRepository<Holiday, Integer> {

    List<Holiday> findBySemesterIdOrderByHolidayDateAsc(Integer semesterId);

    /** Verifica se uma data é feriado num semestre específico. */
    boolean existsBySemesterIdAndHolidayDate(Integer semesterId, LocalDate holidayDate);

    /** Retorna todos os feriados de um semestre num intervalo de datas. */
    @Query("""
        SELECT h FROM Holiday h
        WHERE h.semester.id = :semesterId
          AND h.holidayDate BETWEEN :start AND :end
        ORDER BY h.holidayDate ASC
        """)
    List<Holiday> findBySemesterIdAndDateRange(
            @Param("semesterId") Integer semesterId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    /** Retorna todas as datas de feriado de um semestre (apenas as datas). */
    @Query("SELECT h.holidayDate FROM Holiday h WHERE h.semester.id = :semesterId")
    List<LocalDate> findHolidayDatesBySemesterId(@Param("semesterId") Integer semesterId);
}
