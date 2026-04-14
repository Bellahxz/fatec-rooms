package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.Booking;
import br.com.fatec.fatecrooms.model.Booking.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    // Verifica conflito de reserva (mesma sala + período + data, excluindo CANCELLED e REJECTED)
    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.room.id = :roomId
          AND b.period.id = :periodId
          AND b.bookingDate = :date
          AND b.status IN ('PENDING', 'APPROVED')
          AND (:excludeId IS NULL OR b.id <> :excludeId)
        """)
    boolean existsConflict(
            @Param("roomId") Integer roomId,
            @Param("periodId") Integer periodId,
            @Param("date") LocalDate date,
            @Param("excludeId") Integer excludeId
    );

    // Reservas de um usuário ordenadas por data desc
    List<Booking> findByUserIdOrderByBookingDateDescCreatedAtDesc(Integer userId);

    // Reservas por status (para coordenador)
    List<Booking> findByStatusOrderByBookingDateAscCreatedAtAsc(Status status);

    // Todas as reservas (para coordenador)
    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.room
        JOIN FETCH b.user
        JOIN FETCH b.period
        ORDER BY b.bookingDate DESC, b.createdAt DESC
        """)
    List<Booking> findAllWithDetails();

    // Disponibilidade: períodos já ocupados em uma sala/data
    @Query("""
        SELECT b.period.id FROM Booking b
        WHERE b.room.id = :roomId
          AND b.bookingDate = :date
          AND b.status IN ('PENDING', 'APPROVED')
        """)
    List<Integer> findOccupiedPeriodIds(
            @Param("roomId") Integer roomId,
            @Param("date") LocalDate date
    );

    // Reservas por data (agenda do dia para coordenador)
    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.room
        JOIN FETCH b.user
        JOIN FETCH b.period
        WHERE b.bookingDate = :date
          AND b.status IN ('PENDING', 'APPROVED')
        ORDER BY b.period.startTime
        """)
    List<Booking> findByDateWithDetails(@Param("date") LocalDate date);

    // Reservas de uma sala num intervalo de datas
    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.period
        JOIN FETCH b.user
        WHERE b.room.id = :roomId
          AND b.bookingDate BETWEEN :start AND :end
          AND b.status IN ('PENDING', 'APPROVED')
        ORDER BY b.bookingDate, b.period.startTime
        """)
    List<Booking> findByRoomAndDateRange(
            @Param("roomId") Integer roomId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
}