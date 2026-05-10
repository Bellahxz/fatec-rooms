package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.Period;
import br.com.fatec.fatecrooms.model.RecurringBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RecurringBookingRepository extends JpaRepository<RecurringBooking, Integer> {

    @Query("""
        SELECT DISTINCT rb FROM RecurringBooking rb
        JOIN FETCH rb.semester
        JOIN FETCH rb.room
        JOIN FETCH rb.classGroup cg
        JOIN FETCH cg.course
        JOIN FETCH rb.createdBy
        LEFT JOIN FETCH rb.periods
        LEFT JOIN FETCH rb.instances
        WHERE rb.semester.id = :semesterId
        ORDER BY rb.createdAt DESC
        """)
    List<RecurringBooking> findBySemesterWithDetails(@Param("semesterId") Integer semesterId);

    @Query("""
        SELECT DISTINCT rb FROM RecurringBooking rb
        JOIN FETCH rb.semester
        JOIN FETCH rb.room
        JOIN FETCH rb.classGroup cg
        JOIN FETCH cg.course
        JOIN FETCH rb.createdBy
        LEFT JOIN FETCH rb.periods
        LEFT JOIN FETCH rb.instances
        ORDER BY rb.createdAt DESC
        """)
    List<RecurringBooking> findAllWithDetails();

    /**
     * Verifica conflito: mesma sala + pelo menos um período em comum + instância ativa na data.
     */
    @Query("""
        SELECT COUNT(rb) > 0
        FROM RecurringBooking rb
        JOIN rb.instances inst
        JOIN rb.periods p
        WHERE rb.room.id      = :roomId
          AND rb.status       = 'ACTIVE'
          AND inst.status     = 'ACTIVE'
          AND inst.bookingDate = :date
          AND p.id IN :periodIds
          AND (:excludeId IS NULL OR rb.id <> :excludeId)
        """)
    boolean existsConflictOnDate(
            @Param("roomId")    Integer roomId,
            @Param("date")      LocalDate date,
            @Param("periodIds") List<Integer> periodIds,
            @Param("excludeId") Integer excludeId
    );

    /**
     * Retorna períodos já ocupados por reservas recorrentes ativas em sala/data.
     * Utilizado para cruzamento com reservas avulsas e no getAvailability.
     */
    @Query("""
        SELECT DISTINCT p FROM RecurringBooking rb
        JOIN rb.instances inst
        JOIN rb.periods p
        WHERE rb.room.id       = :roomId
          AND rb.status        = 'ACTIVE'
          AND inst.status      = 'ACTIVE'
          AND inst.bookingDate = :date
        """)
    List<Period> findOccupiedPeriodsByRecurring(
            @Param("roomId") Integer roomId,
            @Param("date")   LocalDate date
    );
}