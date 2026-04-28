package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SemesterRepository extends JpaRepository<Semester, Integer> {

    List<Semester> findByActiveOrderByStartDateDesc(Byte active);

    List<Semester> findAllByOrderByStartDateDesc();

    /** Verifica se existe semestre com datas sobrepostas (exceto o próprio ao editar). */
    @Query("""
        SELECT COUNT(s) > 0 FROM Semester s
        WHERE s.active = 1
          AND s.startDate <= :endDate
          AND s.endDate >= :startDate
          AND (:excludeId IS NULL OR s.id <> :excludeId)
        """)
    boolean existsOverlap(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("excludeId") Integer excludeId
    );

    /** Retorna o semestre ativo que contém uma determinada data. */
    @Query("""
        SELECT s FROM Semester s
        WHERE s.active = 1
          AND s.startDate <= :date
          AND s.endDate >= :date
        """)
    Optional<Semester> findActiveByDate(@Param("date") LocalDate date);
}
