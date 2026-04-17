package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.model.SystemConfig;
import br.com.fatec.fatecrooms.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SystemConfigService {

    public static final String KEY_MIN_ADVANCE_DAYS = "booking.minAdvanceDays";

    private static final int DEFAULT_MIN_ADVANCE_DAYS = 7;

    private final SystemConfigRepository configRepository;

    // ─────────────────────────────────────────────
    //  Prazo mínimo de antecedência
    // ─────────────────────────────────────────────

    public int getMinAdvanceDays() {
        return configRepository.findById(KEY_MIN_ADVANCE_DAYS)
                .map(cfg -> parseIntSafe(cfg.getValue(), DEFAULT_MIN_ADVANCE_DAYS))
                .orElse(DEFAULT_MIN_ADVANCE_DAYS);
    }

    public void setMinAdvanceDays(int days) {
        if (days < 0) {
            throw new IllegalArgumentException("O prazo mínimo de antecedência não pode ser negativo.");
        }

        SystemConfig cfg = configRepository.findById(KEY_MIN_ADVANCE_DAYS)
                .orElseGet(() -> {
                    SystemConfig c = new SystemConfig();
                    c.setKey(KEY_MIN_ADVANCE_DAYS);
                    c.setDescription("Número mínimo de dias de antecedência para criação de reservas.");
                    return c;
                });

        cfg.setValue(String.valueOf(days));
        configRepository.save(cfg);
    }

    // ─────────────────────────────────────────────
    //  Helpers genéricos
    // ─────────────────────────────────────────────

    private int parseIntSafe(String value, int fallback) {
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return fallback;
        }
    }
}