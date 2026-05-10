package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.RecurringBookingDTO;
import br.com.fatec.fatecrooms.DTO.RecurringBookingInstanceDTO;
import br.com.fatec.fatecrooms.DTO.RecurringBookingRequest;
import br.com.fatec.fatecrooms.exception.BusinessException;
import br.com.fatec.fatecrooms.exception.ResourceNotFoundException;
import br.com.fatec.fatecrooms.model.*;
import br.com.fatec.fatecrooms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecurringBookingService {

    private final RecurringBookingRepository recurringBookingRepository;
    private final RecurringBookingInstanceRepository instanceRepository;
    private final SemesterRepository semesterRepository;
    private final RoomRepository roomRepository;
    private final ClassGroupRepository classGroupRepository;
    private final UserRepository userRepository;
    private final PeriodRepository periodRepository;
    private final HolidayRepository holidayRepository;
    private final BookingRepository bookingRepository;

    public List<RecurringBookingDTO> listAll() {
        return recurringBookingRepository.findAllWithDetails()
                .stream().map(this::toDTO).toList();
    }

    public List<RecurringBookingDTO> listBySemester(Integer semesterId) {
        return recurringBookingRepository.findBySemesterWithDetails(semesterId)
                .stream().map(this::toDTO).toList();
    }

    public RecurringBookingDTO findById(Integer id) {
        return toDTO(getOrThrow(id));
    }

    public List<RecurringBookingInstanceDTO> listInstances(Integer recurringBookingId) {
        getOrThrow(recurringBookingId); // garante que existe
        return instanceRepository
                .findByRecurringBookingIdOrderByBookingDateAsc(recurringBookingId)
                .stream().map(this::instanceToDTO).toList();
    }


    @Transactional
    public RecurringBookingDTO create(String coordinatorUsername, RecurringBookingRequest request) {

        User coordinator  = getUserOrThrow(coordinatorUsername);
        Semester semester = getSemesterOrThrow(request.getSemesterId());
        Room room         = getRoomOrThrow(request.getRoomId());
        ClassGroup cg     = getClassGroupOrThrow(request.getClassGroupId());

        if (room.getBookable() != 1) {
            throw new BusinessException("Sala não está disponível para reservas.");
        }

        // ── Valida dias da semana ────────────────────────────────────────────
        List<String> normalizedDays = validateAndNormalizeDays(request.getWeekDays(), cg);

        // ── Valida períodos ──────────────────────────────────────────────────
        List<Period> selectedPeriods = request.getPeriodIds().stream()
                .map(this::getPeriodOrThrow)
                .toList();

        validatePeriods(selectedPeriods, cg);

        // ── Cria a reserva recorrente ────────────────────────────────────────
        RecurringBooking rb = new RecurringBooking();
        rb.setSemester(semester);
        rb.setRoom(room);
        rb.setClassGroup(cg);
        rb.setCreatedBy(coordinator);
        rb.setSubject(request.getSubject());
        rb.setNotes(request.getNotes());
        rb.setWeekDays(normalizedDays);
        rb.setStatus(RecurringBooking.Status.ACTIVE);
        rb.setPeriods(new LinkedHashSet<>(selectedPeriods));

        RecurringBooking saved = recurringBookingRepository.save(rb);

        // ── Gera instâncias para cada data do semestre ───────────────────────
        int generated = generateInstances(saved, semester, normalizedDays, selectedPeriods);
        log.info("Reserva recorrente #{} criada: {} instâncias geradas.", saved.getId(), generated);

        // Recarrega com detalhes
        return toDTO(getOrThrow(saved.getId()));
    }


    //  CANCELAMENTO
    @Transactional
    public RecurringBookingDTO cancel(Integer id, String coordinatorUsername) {
        RecurringBooking rb = getOrThrow(id);

        if (rb.getStatus() == RecurringBooking.Status.CANCELLED) {
            throw new BusinessException("Reserva recorrente já está cancelada.");
        }

        rb.setStatus(RecurringBooking.Status.CANCELLED);

        // Cancela todas as instâncias futuras
        int cancelled = instanceRepository.cancelFutureInstances(
                id, LocalDate.now(), "Reserva recorrente cancelada pelo coordenador.");

        recurringBookingRepository.save(rb);
        log.info("Reserva recorrente #{} cancelada. {} instâncias futuras canceladas.", id, cancelled);

        return toDTO(getOrThrow(id));
    }

    //Cancela uma instância específica (ex: aula de um dia específico foi suspensa).
    @Transactional
    public RecurringBookingInstanceDTO cancelInstance(Integer recurringBookingId,
                                                      Integer instanceId,
                                                      String reason) {
        RecurringBookingInstance instance = instanceRepository.findById(instanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Instância não encontrada: " + instanceId));

        if (!instance.getRecurringBooking().getId().equals(recurringBookingId)) {
            throw new BusinessException("Instância não pertence à reserva recorrente informada.");
        }
        if (instance.getStatus() == RecurringBookingInstance.Status.CANCELLED) {
            throw new BusinessException("Instância já está cancelada.");
        }

        instance.setStatus(RecurringBookingInstance.Status.CANCELLED);
        instance.setSkipReason(reason != null && !reason.isBlank() ? reason : "Cancelada manualmente.");

        return instanceToDTO(instanceRepository.save(instance));
    }



    /**
     * Percorre todas as datas do semestre e cria uma instância para cada
     * ocorrência nos dias da semana selecionados, pulando feriados e datas
     * com conflito de reserva avulsa ou outra recorrente na mesma sala/período.
     */
    private int generateInstances(RecurringBooking rb,
                                  Semester semester,
                                  List<String> weekDays,
                                  List<Period> periods) {

        Set<LocalDate> holidays = loadHolidayDates();
        Set<DayOfWeek> targetDays = weekDays.stream()
                .map(DayOfWeek::valueOf)
                .collect(Collectors.toSet());

        List<Integer> periodIds = periods.stream().map(Period::getId).toList();

        LocalDate cursor  = semester.getStartDate();
        LocalDate endDate = semester.getEndDate();

        List<RecurringBookingInstance> instances = new ArrayList<>();
        int count = 0;

        while (!cursor.isAfter(endDate)) {
            if (targetDays.contains(cursor.getDayOfWeek())) {
                RecurringBookingInstance inst = new RecurringBookingInstance();
                inst.setRecurringBooking(rb);
                inst.setBookingDate(cursor);

                if (holidays.contains(cursor)) {
                    inst.setStatus(RecurringBookingInstance.Status.SKIPPED);
                    inst.setSkipReason("Feriado.");
                } else if (hasConflict(rb.getRoom().getId(), cursor, periodIds, null)) {
                    inst.setStatus(RecurringBookingInstance.Status.SKIPPED);
                    inst.setSkipReason("Conflito com reserva existente nesta data.");
                } else {
                    inst.setStatus(RecurringBookingInstance.Status.ACTIVE);
                    count++;
                }

                instances.add(inst);
            }
            cursor = cursor.plusDays(1);
        }

        instanceRepository.saveAll(instances);
        return count;
    }


    private List<String> validateAndNormalizeDays(List<String> rawDays, ClassGroup cg) {
        Set<String> validDays = Set.of(
                "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"
        );

        List<String> normalized = rawDays.stream()
                .map(String::toUpperCase)
                .distinct()
                .toList();

        for (String day : normalized) {
            if (!validDays.contains(day)) {
                throw new BusinessException("Dia da semana inválido: " + day
                        + ". Valores aceitos: " + validDays);
            }
        }

        boolean isSaturdayShift = cg.getShift() == ClassGroup.Shift.SATURDAY;

        if (isSaturdayShift) {
            // Turmas de sábado só podem ter SATURDAY
            if (normalized.size() != 1 || !normalized.contains("SATURDAY")) {
                throw new BusinessException(
                        "Turmas de turno Sábado só podem ter reservas recorrentes no dia SATURDAY.");
            }
        } else {
            // Turmas regulares não podem ter SATURDAY
            if (normalized.contains("SATURDAY")) {
                throw new BusinessException(
                        "Turmas de turno " + cg.getShift()
                                + " não podem incluir SATURDAY. Use uma turma de Sábado.");
            }
        }

        return normalized;
    }

    private void validatePeriods(List<Period> periods, ClassGroup cg) {
        boolean isSaturdayShift = cg.getShift() == ClassGroup.Shift.SATURDAY;

        for (Period p : periods) {
            if (p.getActive() != 1) {
                throw new BusinessException("Período '" + p.getName() + "' está inativo.");
            }

            boolean isSaturdayPeriod = isSaturdayPeriod(p);

            if (isSaturdayShift && !isSaturdayPeriod) {
                throw new BusinessException(
                        "Turmas de sábado devem usar períodos de sábado. "
                                + "Período inválido: " + p.getName());
            }
            if (!isSaturdayShift && isSaturdayPeriod) {
                throw new BusinessException(
                        "Turmas regulares não podem usar períodos de sábado. "
                                + "Período inválido: " + p.getName());
            }
        }
    }

    private boolean isSaturdayPeriod(Period p) {
        String name = p.getName() == null ? "" : p.getName().replaceAll("\\s+", "").toLowerCase();
        return name.contains("sabado") || name.contains("sábado");
    }


    /**
     * Verifica se há conflito de reservas (avulsas OU recorrentes) para
     * uma dada sala, data e lista de períodos.
     */
    private boolean hasConflict(Integer roomId, LocalDate date,
                                List<Integer> periodIds, Integer excludeRecurringId) {
        // 1. Conflito com reservas avulsas
        boolean avulsaConflict = bookingRepository.existsConflict(roomId, periodIds, date, null);
        if (avulsaConflict) return true;

        // 2. Conflito com outras reservas recorrentes
        return recurringBookingRepository.existsConflictOnDate(roomId, date, periodIds, excludeRecurringId);
    }


    private Set<LocalDate> loadHolidayDates() {
        return holidayRepository.findAllByOrderByHolidayDateAsc()
                .stream()
                .map(Holiday::getHolidayDate)
                .collect(Collectors.toSet());
    }

    private RecurringBooking getOrThrow(Integer id) {
        return recurringBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva recorrente não encontrada: " + id));
    }

    private Semester getSemesterOrThrow(Integer id) {
        return semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semestre não encontrado: " + id));
    }

    private Room getRoomOrThrow(Integer id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada: " + id));
    }

    private ClassGroup getClassGroupOrThrow(Integer id) {
        return classGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada: " + id));
    }

    private User getUserOrThrow(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + username));
    }

    private Period getPeriodOrThrow(Integer id) {
        return periodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Período não encontrado: " + id));
    }


    //  CONVERSÃO DTO

    public RecurringBookingDTO toDTO(RecurringBooking rb) {
        List<RecurringBookingDTO.PeriodSummary> periodSummaries = rb.getPeriods().stream()
                .sorted(Comparator.comparing(Period::getStartTime))
                .map(p -> new RecurringBookingDTO.PeriodSummary(
                        p.getId(), p.getName(), p.getStartTime(), p.getEndTime()))
                .toList();

        List<RecurringBookingInstance> instances = rb.getInstances();
        long active    = instances.stream().filter(i -> i.getStatus() == RecurringBookingInstance.Status.ACTIVE).count();
        long cancelled = instances.stream().filter(i -> i.getStatus() == RecurringBookingInstance.Status.CANCELLED).count();
        long skipped   = instances.stream().filter(i -> i.getStatus() == RecurringBookingInstance.Status.SKIPPED).count();

        ClassGroup cg = rb.getClassGroup();
        Course course = cg.getCourse();

        return new RecurringBookingDTO(
                rb.getId(),
                rb.getSemester().getId(),
                rb.getSemester().getName(),
                rb.getRoom().getId(),
                rb.getRoom().getName(),
                rb.getRoom().getLocation(),
                cg.getId(),
                cg.getLabel(),
                cg.getShift(),
                course.getId(),
                course.getName(),
                course.getAbbreviation(),
                rb.getCreatedBy().getId(),
                rb.getCreatedBy().getUsername(),
                periodSummaries,
                rb.getWeekDays(),
                rb.getSubject(),
                rb.getNotes(),
                rb.getStatus(),
                instances.size(),
                (int) active,
                (int) cancelled,
                (int) skipped,
                rb.getCreatedAt(),
                rb.getUpdatedAt()
        );
    }

    public RecurringBookingInstanceDTO instanceToDTO(RecurringBookingInstance inst) {
        return new RecurringBookingInstanceDTO(
                inst.getId(),
                inst.getRecurringBooking().getId(),
                inst.getBookingDate(),
                inst.getStatus(),
                inst.getSkipReason(),
                inst.getCreatedAt(),
                inst.getUpdatedAt()
        );
    }
}