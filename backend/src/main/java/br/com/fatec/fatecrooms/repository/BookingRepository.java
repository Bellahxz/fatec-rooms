package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.Booking;
import br.com.fatec.fatecrooms.model.Booking.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    // Verifica conflito: mesma sala + período + data, excluindo CANCELLED/REJECTED
    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        JOIN b.periods p
        WHERE b.room.id = :roomId
          AND p.id IN :periodIds
          AND b.bookingDate = :date
          AND b.status IN ('PENDING', 'APPROVED')
          AND (:excludeId IS NULL OR b.id <> :excludeId)
        """)
    boolean existsConflict(
            @Param("roomId") Integer roomId,
            @Param("periodIds") List<Integer> periodIds,
            @Param("date") LocalDate date,
            @Param("excludeId") Integer excludeId
    );

    // Reservas de um usuário ordenadas por data desc
    @Query("""
        SELECT DISTINCT b FROM Booking b
        LEFT JOIN FETCH b.periods
        WHERE b.user.id = :userId
        ORDER BY b.bookingDate DESC, b.createdAt DESC
        """)
    List<Booking> findByUserIdOrderByBookingDateDescCreatedAtDesc(@Param("userId") Integer userId);

    // Reservas por status
    @Query("""
        SELECT DISTINCT b FROM Booking b
        LEFT JOIN FETCH b.periods
        WHERE b.status = :status
        ORDER BY b.bookingDate ASC, b.createdAt ASC
        """)
    List<Booking> findByStatusOrderByBookingDateAscCreatedAtAsc(@Param("status") Status status);

    // Todas as reservas (coordenador)
    @Query("""
        SELECT DISTINCT b FROM Booking b
        JOIN FETCH b.room
        JOIN FETCH b.user
        LEFT JOIN FETCH b.periods
        ORDER BY b.bookingDate DESC, b.createdAt DESC
        """)
    List<Booking> findAllWithDetails();

    // Períodos já ocupados em sala/data
    @Query("""
        SELECT p.id FROM Booking b
        JOIN b.periods p
        WHERE b.room.id = :roomId
          AND b.bookingDate = :date
          AND b.status IN ('PENDING', 'APPROVED')
        """)
    List<Integer> findOccupiedPeriodIds(
            @Param("roomId") Integer roomId,
            @Param("date") LocalDate date
    );

    // Agenda do dia
    @Query("""
        SELECT DISTINCT b FROM Booking b
        JOIN FETCH b.room
        JOIN FETCH b.user
        LEFT JOIN FETCH b.periods
        WHERE b.bookingDate = :date
          AND b.status IN ('PENDING', 'APPROVED')
        ORDER BY b.bookingDate
        """)
    List<Booking> findByDateWithDetails(@Param("date") LocalDate date);

    // Reservas de uma sala num intervalo
    @Query("""
        SELECT DISTINCT b FROM Booking b
        LEFT JOIN FETCH b.periods
        JOIN FETCH b.user
        WHERE b.room.id = :roomId
          AND b.bookingDate BETWEEN :start AND :end
          AND b.status IN ('PENDING', 'APPROVED')
        ORDER BY b.bookingDate
        """)
    List<Booking> findByRoomAndDateRange(
            @Param("roomId") Integer roomId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
}