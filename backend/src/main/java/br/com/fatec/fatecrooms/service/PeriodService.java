package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.PeriodDTO;
import br.com.fatec.fatecrooms.DTO.PeriodRequest;
import br.com.fatec.fatecrooms.model.Period;
import br.com.fatec.fatecrooms.repository.PeriodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PeriodService {

    private final PeriodRepository periodRepository;

    public List<PeriodDTO> listActive() {
        return periodRepository.findByActiveOrderByStartTime((byte) 1)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<PeriodDTO> listAll() {
        return periodRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public PeriodDTO findById(Integer id) {
        return toDTO(getOrThrow(id));
    }

    public PeriodDTO create(PeriodRequest request) {
        validateTimes(request);

        Period period = new Period();
        period.setName(request.getName());
        period.setStartTime(request.getStartTime());
        period.setEndTime(request.getEndTime());
        period.setActive(request.getActive() != null ? request.getActive() : (byte) 1);

        return toDTO(periodRepository.save(period));
    }

    public PeriodDTO update(Integer id, PeriodRequest request) {
        validateTimes(request);
        Period period = getOrThrow(id);

        period.setName(request.getName());
        period.setStartTime(request.getStartTime());
        period.setEndTime(request.getEndTime());
        if (request.getActive() != null) {
            period.setActive(request.getActive());
        }

        return toDTO(periodRepository.save(period));
    }

    public String toggleActive(Integer id) {
        Period period = getOrThrow(id);
        boolean nowActive = period.getActive() == 0;
        period.setActive((byte) (nowActive ? 1 : 0));
        periodRepository.save(period);
        return "Período '" + period.getName() + "' " + (nowActive ? "ativado" : "desativado") + ".";
    }

    public String delete(Integer id) {
        Period period = getOrThrow(id);
        periodRepository.delete(period);
        return "Período '" + period.getName() + "' removido.";
    }

    // ---- helpers ----

    private Period getOrThrow(Integer id) {
        return periodRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Período não encontrado."));
    }

    private void validateTimes(PeriodRequest request) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("O horário de início deve ser anterior ao de término.");
        }
    }

    public PeriodDTO toDTO(Period p) {
        return new PeriodDTO(p.getId(), p.getName(), p.getStartTime(), p.getEndTime(), p.getActive());
    }
}