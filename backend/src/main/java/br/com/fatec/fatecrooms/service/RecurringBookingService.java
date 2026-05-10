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

    private final RecurringBookingRepository         recurringBookingRepository;
    private final RecurringBookingInstanceRepository instanceRepository;
    private final SemesterRepository                 semesterRepository;
    private final RoomRepository                     roomRepository;
    private final ClassGroupRepository               classGroupRepository;
    private final UserRepository                     userRepository;
    private final PeriodRepository                   periodRepository;
    private final HolidayRepository                  holidayRepository;
    private final BookingRepository                  bookingRepository;

    // ── Consultas ─────────────────────────────────────────────────────────────

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

    public List<RecurringBookingInstanceDTO> listInstances(Integer id) {
        getOrThrow(id);
        return instanceRepository
                .findByRecurringBookingIdOrderByBookingDateAsc(id)
                .stream().map(this::instanceToDTO).toList();
    }

    // ── Criação ───────────────────────────────────────────────────────────────

    @Transactional
    public RecurringBookingDTO create(String coordinatorUsername, RecurringBookingRequest request) {
        User      coordinator = getUserOrThrow(coordinatorUsername);
        Semester  semester    = getSemesterOrThrow(request.getSemesterId());
        Room      room        = getRoomOrThrow(request.getRoomId());
        ClassGroup cg         = getClassGroupOrThrow(request.getClassGroupId());

        if (room.getBookable() != 1)
            throw new BusinessException("Sala não está disponível para reservas.");

        List<String> normalizedDays = validateAndNormalizeDays(request.getWeekDays(), cg);

        List<Period> periods = request.getPeriodIds().stream()
                .map(this::getPeriodOrThrow).toList();

        validatePeriods(periods);

        validateNoRecurringOverlap(
                request.getRoomId(),
                request.getSemesterId(),
                request.getClassGroupId(),
                normalizedDays,
                periods.stream().map(Period::getId).toList(),
                null
        );

        RecurringBooking rb = new RecurringBooking();
        rb.setSemester(semester);
        rb.setRoom(room);
        rb.setClassGroup(cg);
        rb.setCreatedBy(coordinator);
        rb.setSubject(request.getSubject());
        rb.setNotes(request.getNotes());
        rb.setWeekDays(normalizedDays);
        rb.setStatus(RecurringBooking.Status.ACTIVE);
        rb.setPeriods(new LinkedHashSet<>(periods));

        RecurringBooking saved = recurringBookingRepository.save(rb);
        int generated = generateInstances(saved, semester, normalizedDays, periods);
        log.info("Reserva recorrente #{} criada: {} instâncias ativas.", saved.getId(), generated);

        return toDTO(getOrThrow(saved.getId()));
    }

    // ── Cancelamento ──────────────────────────────────────────────────────────

    @Transactional
    public RecurringBookingDTO cancel(Integer id, String coordinatorUsername) {
        RecurringBooking rb = getOrThrow(id);
        if (rb.getStatus() == RecurringBooking.Status.CANCELLED)
            throw new BusinessException("Reserva recorrente já está cancelada.");

        rb.setStatus(RecurringBooking.Status.CANCELLED);
        int cancelled = instanceRepository.cancelFutureInstances(
                id, LocalDate.now(), "Reserva recorrente cancelada pelo coordenador.");
        recurringBookingRepository.save(rb);
        log.info("Reserva recorrente #{} cancelada. {} instâncias canceladas.", id, cancelled);
        return toDTO(getOrThrow(id));
    }

    @Transactional
    public RecurringBookingInstanceDTO cancelInstance(Integer recurringBookingId,
                                                      Integer instanceId,
                                                      String reason) {
        RecurringBookingInstance inst = instanceRepository.findById(instanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Instância não encontrada: " + instanceId));

        if (!inst.getRecurringBooking().getId().equals(recurringBookingId))
            throw new BusinessException("Instância não pertence à reserva recorrente informada.");
        if (inst.getStatus() == RecurringBookingInstance.Status.CANCELLED)
            throw new BusinessException("Instância já está cancelada.");

        inst.setStatus(RecurringBookingInstance.Status.CANCELLED);
        inst.setSkipReason(reason != null && !reason.isBlank() ? reason : "Cancelada manualmente.");
        return instanceToDTO(instanceRepository.save(inst));
    }

    // ── Geração de instâncias ─────────────────────────────────────────────────

    private int generateInstances(RecurringBooking rb, Semester semester,
                                  List<String> weekDays, List<Period> periods) {
        Set<LocalDate>  holidays   = loadHolidayDates();
        Set<DayOfWeek>  targetDays = weekDays.stream()
                .map(DayOfWeek::valueOf).collect(Collectors.toSet());
        List<Integer>   periodIds  = periods.stream().map(Period::getId).toList();

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

    // ── Validações ────────────────────────────────────────────────────────────

    /**
     * SATURDAY é permitido apenas se a turma tiver has_saturday = 1.
     * Turmas com has_saturday = 1 têm aula nos dias úteis E sábado —
     * não existe turma exclusivamente de sábado.
     */
    private List<String> validateAndNormalizeDays(List<String> rawDays, ClassGroup cg) {
        Set<String> valid = Set.of("MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY");

        List<String> normalized = rawDays.stream()
                .map(String::toUpperCase).distinct().toList();

        for (String day : normalized) {
            if (!valid.contains(day))
                throw new BusinessException("Dia da semana inválido: " + day);
        }

        boolean hasSaturday = cg.getHasSaturday() == 1;

        if (normalized.contains("SATURDAY") && !hasSaturday)
            throw new BusinessException(
                    "Esta turma não possui aulas de sábado. Remova SATURDAY da seleção.");

        // Deve ter pelo menos um dia útil (turmas não são só de sábado)
        boolean hasWeekday = normalized.stream()
                .anyMatch(d -> !d.equals("SATURDAY"));
        if (!hasWeekday)
            throw new BusinessException(
                    "Selecione ao menos um dia útil (Seg–Sex). Sábado é um dia adicional.");

        return normalized;
    }

    private void validatePeriods(List<Period> periods) {
        for (Period p : periods) {
            if (p.getActive() != 1)
                throw new BusinessException("Período '" + p.getName() + "' está inativo.");
        }
    }

    private void validateNoRecurringOverlap(Integer roomId, Integer semesterId,
                                            Integer classGroupId, List<String> weekDays,
                                            List<Integer> periodIds, Integer excludeId) {
        List<RecurringBooking> existing = recurringBookingRepository
                .findBySemesterWithDetails(semesterId);

        for (RecurringBooking rb : existing) {
            if (rb.getStatus() == RecurringBooking.Status.CANCELLED) continue;
            if (rb.getId().equals(excludeId)) continue;
            if (!rb.getRoom().getId().equals(roomId)) continue;

            // Verifica sobreposição de dias da semana
            boolean dayOverlap = rb.getWeekDays().stream()
                    .anyMatch(weekDays::contains);
            if (!dayOverlap) continue;

            // Verifica sobreposição de períodos
            List<Integer> existingPeriodIds = rb.getPeriods().stream()
                    .map(Period::getId).toList();
            boolean periodOverlap = existingPeriodIds.stream()
                    .anyMatch(periodIds::contains);
            if (!periodOverlap) continue;

            throw new BusinessException(
                    "Já existe uma reserva recorrente ativa nesta sala com dias e períodos conflitantes. " +
                            "Reserva recorrente #" + rb.getId() + " — " + rb.getSubject());
        }
    }

    private boolean hasConflict(Integer roomId, LocalDate date,
                                List<Integer> periodIds, Integer excludeId) {
        if (bookingRepository.existsConflict(roomId, periodIds, date, null)) return true;
        return recurringBookingRepository.existsConflictOnDate(roomId, date, periodIds, excludeId);
    }

    private Set<LocalDate> loadHolidayDates() {
        return holidayRepository.findAllByOrderByHolidayDateAsc()
                .stream().map(Holiday::getHolidayDate).collect(Collectors.toSet());
    }

    // ── Helpers de busca ──────────────────────────────────────────────────────

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

    // ── Conversão DTO ─────────────────────────────────────────────────────────

    public RecurringBookingDTO toDTO(RecurringBooking rb) {
        List<RecurringBookingDTO.PeriodSummary> periodSummaries = rb.getPeriods().stream()
                .sorted(Comparator.comparing(Period::getStartTime))
                .map(p -> new RecurringBookingDTO.PeriodSummary(
                        p.getId(), p.getName(), p.getStartTime(), p.getEndTime()))
                .toList();

        List<RecurringBookingInstance> insts = rb.getInstances();
        long active    = insts.stream().filter(i -> i.getStatus() == RecurringBookingInstance.Status.ACTIVE).count();
        long cancelled = insts.stream().filter(i -> i.getStatus() == RecurringBookingInstance.Status.CANCELLED).count();
        long skipped   = insts.stream().filter(i -> i.getStatus() == RecurringBookingInstance.Status.SKIPPED).count();

        ClassGroup cg     = rb.getClassGroup();
        Course     course = cg.getCourse();

        return new RecurringBookingDTO(
                rb.getId(),
                rb.getSemester().getId(), rb.getSemester().getName(),
                rb.getRoom().getId(), rb.getRoom().getName(), rb.getRoom().getLocation(),
                cg.getId(), cg.getLabel(), cg.getShift(), cg.getHasSaturday() == 1,
                course.getId(), course.getName(), course.getAbbreviation(),
                rb.getCreatedBy().getId(), rb.getCreatedBy().getUsername(),
                periodSummaries, rb.getWeekDays(),
                rb.getSubject(), rb.getNotes(), rb.getStatus(),
                insts.size(), (int) active, (int) cancelled, (int) skipped,
                rb.getCreatedAt(), rb.getUpdatedAt()
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