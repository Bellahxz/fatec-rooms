package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.RecurringBookingInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface RecurringBookingInstanceRepository extends JpaRepository<RecurringBookingInstance, Integer> {

    List<RecurringBookingInstance> findByRecurringBookingIdOrderByBookingDateAsc(Integer recurringBookingId);

    @Query("""
        SELECT rbi FROM RecurringBookingInstance rbi
        WHERE rbi.recurringBooking.id = :recurringId
          AND rbi.bookingDate BETWEEN :start AND :end
        ORDER BY rbi.bookingDate ASC
        """)
    List<RecurringBookingInstance> findByRecurringAndDateRange(
            @Param("recurringId") Integer recurringId,
            @Param("start")       LocalDate start,
            @Param("end")         LocalDate end
    );

    @Modifying
    @Transactional
    @Query("""
        UPDATE RecurringBookingInstance rbi
        SET rbi.status = 'CANCELLED', rbi.skipReason = :reason
        WHERE rbi.recurringBooking.id = :recurringId
          AND rbi.bookingDate >= :fromDate
          AND rbi.status = 'ACTIVE'
        """)
    int cancelFutureInstances(
            @Param("recurringId") Integer recurringId,
            @Param("fromDate")    LocalDate fromDate,
            @Param("reason")      String reason
    );

    @Query("""
        SELECT rbi FROM RecurringBookingInstance rbi
        JOIN rbi.recurringBooking rb
        JOIN rb.room
        WHERE rb.room.id = :roomId
          AND rbi.bookingDate BETWEEN :start AND :end
          AND rbi.status = 'ACTIVE'
          AND rb.status = 'ACTIVE'
        ORDER BY rbi.bookingDate ASC
        """)
    List<RecurringBookingInstance> findActiveByRoomAndDateRange(
            @Param("roomId") Integer roomId,
            @Param("start")  LocalDate start,
            @Param("end")    LocalDate end
    );
}