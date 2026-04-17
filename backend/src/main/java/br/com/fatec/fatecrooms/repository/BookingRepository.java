package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.Booking;
import br.com.fatec.fatecrooms.model.Booking.Status;
import br.com.fatec.fatecrooms.model.Period;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    // ── Conflito exato por ID de período ─────────────────────────────────────
    /**
     * Verifica se existe pelo menos uma reserva ativa (PENDING ou APPROVED)
     * para a mesma sala/data que ocupe exatamente um dos IDs de período informados.
     */
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
            @Param("roomId")    Integer    roomId,
            @Param("periodIds") List<Integer> periodIds,
            @Param("date")      LocalDate  date,
            @Param("excludeId") Integer    excludeId
    );

    // ── Períodos já ocupados com seus horários (para detecção de sobreposição) ──
    /**
     * Retorna todos os objetos Period vinculados a reservas ativas
     * (PENDING ou APPROVED) para a sala e data informadas.
     *
     * Usado pelo BookingService para checar sobreposição de horário mesmo
     * quando os IDs dos períodos são distintos (ex.: futuros períodos com
     * intervalos sobrepostos como 10:30-11:30 e 11:20-12:00).
     *
     * @param excludeBookingId reserva a ignorar (útil em re-validações de edição;
     *                         passe null para não excluir nenhuma)
     */
    @Query("""
        SELECT DISTINCT p FROM Booking b
        JOIN b.periods p
        WHERE b.room.id = :roomId
          AND b.bookingDate = :date
          AND b.status IN ('PENDING', 'APPROVED')
          AND (:excludeId IS NULL OR b.id <> :excludeId)
        """)
    List<Period> findOccupiedPeriodsWithTimes(
            @Param("roomId")    Integer   roomId,
            @Param("date")      LocalDate date,
            @Param("excludeId") Integer   excludeId
    );

    // ── IDs dos períodos ocupados (usado por getAvailability) ─────────────────
    @Query("""
        SELECT p.id FROM Booking b
        JOIN b.periods p
        WHERE b.room.id = :roomId
          AND b.bookingDate = :date
          AND b.status IN ('PENDING', 'APPROVED')
        """)
    List<Integer> findOccupiedPeriodIds(
            @Param("roomId") Integer roomId,
            @Param("date")   LocalDate date
    );

    // ── Reservas do usuário ───────────────────────────────────────────────────
    @Query("""
        SELECT DISTINCT b FROM Booking b
        LEFT JOIN FETCH b.periods
        WHERE b.user.id = :userId
        ORDER BY b.bookingDate DESC, b.createdAt DESC
        """)
    List<Booking> findByUserIdOrderByBookingDateDescCreatedAtDesc(@Param("userId") Integer userId);

    // ── Reservas por status ───────────────────────────────────────────────────
    @Query("""
        SELECT DISTINCT b FROM Booking b
        LEFT JOIN FETCH b.periods
        WHERE b.status = :status
        ORDER BY b.bookingDate ASC, b.createdAt ASC
        """)
    List<Booking> findByStatusOrderByBookingDateAscCreatedAtAsc(@Param("status") Status status);

    // ── Todas as reservas (visão do coordenador) ──────────────────────────────
    @Query("""
        SELECT DISTINCT b FROM Booking b
        JOIN FETCH b.room
        JOIN FETCH b.user
        LEFT JOIN FETCH b.periods
        ORDER BY b.bookingDate DESC, b.createdAt DESC
        """)
    List<Booking> findAllWithDetails();

    // ── Agenda do dia ─────────────────────────────────────────────────────────
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

    // ── Reservas de uma sala num intervalo ────────────────────────────────────
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
            @Param("roomId") Integer   roomId,
            @Param("start")  LocalDate start,
            @Param("end")    LocalDate end
    );
}