package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.*;
import br.com.fatec.fatecrooms.model.*;
import br.com.fatec.fatecrooms.model.Booking.Status;
import br.com.fatec.fatecrooms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository    bookingRepository;
    private final RoomRepository       roomRepository;
    private final UserRepository       userRepository;
    private final PeriodRepository     periodRepository;

    // ─────────────────────────────────────────────
    //  CONSULTAS ABERTAS
    // ─────────────────────────────────────────────

    /** Disponibilidade de uma sala num dia (todos os períodos ativos + flag livre/ocupado). */
    public AvailabilityDTO getAvailability(Integer roomId, LocalDate date) {
        Room room = getRoomOrThrow(roomId);

        List<Integer> occupied = bookingRepository.findOccupiedPeriodIds(roomId, date);
        DayOfWeek dayOfWeek = date.getDayOfWeek();

        List<Period> periods = periodRepository.findByActiveOrderByStartTime((byte) 1)
                .stream()
                .filter(p -> {
                    boolean saturdayPeriod = isSaturdayPeriod(p);
                    if (dayOfWeek == DayOfWeek.SATURDAY) {
                        return saturdayPeriod;
                    }
                    if (dayOfWeek == DayOfWeek.SUNDAY) {
                        return false;
                    }
                    return !saturdayPeriod;
                })
                .toList();

        List<AvailabilityDTO.PeriodAvailabilityDTO> slots = periods.stream()
                .map(p -> new AvailabilityDTO.PeriodAvailabilityDTO(
                        p.getId(), p.getName(), p.getStartTime(), p.getEndTime(),
                        !occupied.contains(p.getId())
                ))
                .toList();

        return new AvailabilityDTO(room.getId(), room.getName(), date, slots);
    }

    /** Agenda de uma sala num intervalo de datas. */
    public List<BookingDTO> getRoomCalendar(Integer roomId, LocalDate start, LocalDate end) {
        if (start.isAfter(end)) throw new IllegalArgumentException("Data início deve ser anterior ao fim.");
        return bookingRepository.findByRoomAndDateRange(roomId, start, end)
                .stream().map(this::toDTO).toList();
    }

    // ─────────────────────────────────────────────
    //  PROFESSOR
    // ─────────────────────────────────────────────

    /** Cria reserva. Status inicial PENDING (aguarda coordenador). */
    @Transactional
    public BookingDTO create(String username, BookingRequest request) {
        User   user   = getUserOrThrow(username);
        Room   room   = getRoomOrThrow(request.getRoomId());
        Period period = getPeriodOrThrow(request.getPeriodId());

        if (room.getBookable() != 1) {
            throw new IllegalStateException("Sala não está disponível para reservas.");
        }
        if (period.getActive() != 1) {
            throw new IllegalStateException("Período não está ativo.");
        }

        DayOfWeek bookingDay = request.getBookingDate().getDayOfWeek();
        boolean saturdayPeriod = isSaturdayPeriod(period);

        if (bookingDay == DayOfWeek.SUNDAY) {
            throw new IllegalArgumentException("Domingo não aceita reservas.");
        }
        if (bookingDay == DayOfWeek.SATURDAY && !saturdayPeriod) {
            throw new IllegalStateException("Períodos de sábado só podem ser usados em reservas de sábado.");
        }
        if (bookingDay != DayOfWeek.SATURDAY && saturdayPeriod) {
            throw new IllegalStateException("Períodos de sábado não estão disponíveis em dias úteis.");
        }

        if (!request.getBookingDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("A data da reserva deve ser futura.");
        }
        if (bookingRepository.existsConflict(room.getId(), period.getId(), request.getBookingDate(), null)) {
            throw new IllegalStateException("Já existe uma reserva para essa sala nesse horário.");
        }

        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setUser(user);
        booking.setPeriod(period);
        booking.setBookingDate(request.getBookingDate());
        booking.setSubject(request.getSubject());
        booking.setNotes(request.getNotes());
        booking.setStatus(Status.PENDING);

        return toDTO(bookingRepository.save(booking));
    }

    /** Lista reservas do próprio usuário. */
    public List<BookingDTO> listMyBookings(String username) {
        User user = getUserOrThrow(username);
        return bookingRepository
                .findByUserIdOrderByBookingDateDescCreatedAtDesc(user.getId())
                .stream().map(this::toDTO).toList();
    }

    /** Cancela reserva (apenas pelo dono, apenas PENDING ou APPROVED). */
    @Transactional
    public BookingDTO cancel(String username, Integer bookingId) {
        Booking booking = getOrThrow(bookingId);
        User    user    = getUserOrThrow(username);

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Você não tem permissão para cancelar esta reserva.");
        }
        if (booking.getStatus() == Status.CANCELLED) {
            throw new IllegalStateException("Reserva já está cancelada.");
        }
        if (booking.getStatus() == Status.REJECTED) {
            throw new IllegalStateException("Não é possível cancelar uma reserva rejeitada.");
        }
        if (booking.getBookingDate().isBefore(LocalDate.now())) {
            throw new IllegalStateException("Não é possível cancelar uma reserva de data passada.");
        }

        booking.setStatus(Status.CANCELLED);
        return toDTO(bookingRepository.save(booking));
    }

    /** Atualiza observações (apenas pelo dono, apenas PENDING ou APPROVED). */
    @Transactional
    public BookingDTO updateNotes(String username, Integer bookingId, BookingNotesRequest request) {
        Booking booking = getOrThrow(bookingId);
        User    user    = getUserOrThrow(username);

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Você não tem permissão para editar esta reserva.");
        }
        if (booking.getStatus() == Status.CANCELLED || booking.getStatus() == Status.REJECTED) {
            throw new IllegalStateException("Não é possível editar uma reserva " + booking.getStatus() + ".");
        }

        booking.setNotes(request.getNotes());
        return toDTO(bookingRepository.save(booking));
    }

    // ─────────────────────────────────────────────
    //  COORDENADOR
    // ─────────────────────────────────────────────

    /** Lista todas as reservas (visão coordenador). */
    public List<BookingDTO> listAll() {
        return bookingRepository.findAllWithDetails()
                .stream().map(this::toDTO).toList();
    }

    /** Lista reservas por status. */
    public List<BookingDTO> listByStatus(Status status) {
        return bookingRepository.findByStatusOrderByBookingDateAscCreatedAtAsc(status)
                .stream().map(this::toDTO).toList();
    }

    /** Agenda do dia (todas as reservas PENDING/APPROVED de uma data). */
    public List<BookingDTO> listByDate(LocalDate date) {
        return bookingRepository.findByDateWithDetails(date)
                .stream().map(this::toDTO).toList();
    }

    /** Aprova ou rejeita reserva. */
    @Transactional
    public BookingDTO review(String coordinatorUsername, Integer bookingId, BookingReviewRequest request) {
        Booking booking     = getOrThrow(bookingId);
        User    coordinator = getUserOrThrow(coordinatorUsername);

        if (booking.getStatus() != Status.PENDING) {
            throw new IllegalStateException("Apenas reservas PENDENTES podem ser revisadas. Status atual: " + booking.getStatus());
        }
        if (!request.isApproved() && (request.getRejectReason() == null || request.getRejectReason().isBlank())) {
            throw new IllegalArgumentException("Informe o motivo da rejeição.");
        }

        booking.setStatus(request.isApproved() ? Status.APPROVED : Status.REJECTED);
        booking.setReviewedBy(coordinator);
        booking.setReviewedAt(LocalDateTime.now());
        if (!request.isApproved()) {
            booking.setRejectReason(request.getRejectReason());
        }

        return toDTO(bookingRepository.save(booking));
    }

    /** Coordenador pode cancelar qualquer reserva ativa. */
    @Transactional
    public BookingDTO cancelByCoordinator(String coordinatorUsername, Integer bookingId) {
        Booking booking     = getOrThrow(bookingId);
        User    coordinator = getUserOrThrow(coordinatorUsername);

        if (booking.getStatus() == Status.CANCELLED) {
            throw new IllegalStateException("Reserva já está cancelada.");
        }
        if (booking.getStatus() == Status.REJECTED) {
            throw new IllegalStateException("Não é possível cancelar uma reserva rejeitada.");
        }

        booking.setStatus(Status.CANCELLED);
        booking.setReviewedBy(coordinator);
        booking.setReviewedAt(LocalDateTime.now());
        booking.setRejectReason("Cancelada pelo coordenador.");

        return toDTO(bookingRepository.save(booking));
    }

    /** Busca reserva por ID (qualquer usuário autenticado pode ver detalhes). */
    public BookingDTO findById(Integer id) {
        return toDTO(getOrThrow(id));
    }

    // ─────────────────────────────────────────────
    //  HELPERS PRIVADOS
    // ─────────────────────────────────────────────

    private Booking getOrThrow(Integer id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva não encontrada."));
    }

    private Room getRoomOrThrow(Integer id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sala não encontrada."));
    }

    private User getUserOrThrow(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
    }

    private Period getPeriodOrThrow(Integer id) {
        return periodRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Período não encontrado."));
    }

    private boolean isSaturdayPeriod(Period p) {
        String name = p.getName() == null ? "" : p.getName().replaceAll("\\s+", "").toLowerCase();
        return name.contains("sabado") || name.contains("sábado");
    }

    public BookingDTO toDTO(Booking b) {
        return new BookingDTO(
                b.getId(),
                b.getRoom().getId(),
                b.getRoom().getName(),
                b.getRoom().getLocation(),
                b.getUser().getId(),
                b.getUser().getUsername(),
                b.getUser().getDisplayname() != null
                        ? b.getUser().getDisplayname()
                        : b.getUser().getFirstname() + " " + b.getUser().getLastname(),
                b.getPeriod().getId(),
                b.getPeriod().getName(),
                b.getPeriod().getStartTime(),
                b.getPeriod().getEndTime(),
                b.getBookingDate(),
                b.getSubject(),
                b.getNotes(),
                b.getStatus(),
                b.getReviewedBy() != null ? b.getReviewedBy().getUsername() : null,
                b.getReviewedAt(),
                b.getRejectReason(),
                b.getCreatedAt(),
                b.getUpdatedAt()
        );
    }
}