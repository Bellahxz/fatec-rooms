package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.ExamWeek;
import br.com.fatec.fatecrooms.model.ExamWeek.ExamType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExamWeekRepository extends JpaRepository<ExamWeek, Integer> {

    List<ExamWeek> findBySemesterIdOrderByStartDateAsc(Integer semesterId);

    Optional<ExamWeek> findBySemesterIdAndExamType(Integer semesterId, ExamType examType);

    boolean existsBySemesterIdAndExamType(Integer semesterId, ExamType examType);

    /** Retorna as semanas de prova de um semestre que contêm uma data específica. */
    @Query("""
        SELECT ew FROM ExamWeek ew
        WHERE ew.semester.id = :semesterId
          AND ew.startDate <= :date
          AND ew.endDate >= :date
        """)
    List<ExamWeek> findBySemesterIdAndDate(
            @Param("semesterId") Integer semesterId,
            @Param("date") LocalDate date
    );
}
