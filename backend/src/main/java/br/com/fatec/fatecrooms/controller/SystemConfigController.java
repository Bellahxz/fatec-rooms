package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService configService;

    @GetMapping("/booking/min-advance-days")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Map<String, Object>> getMinAdvanceDays() {
        int days = configService.getMinAdvanceDays();
        return ResponseEntity.ok(Map.of(
                "key", SystemConfigService.KEY_MIN_ADVANCE_DAYS,
                "days", days,
                "description", "Número mínimo de dias de antecedência para criação de reservas."
        ));
    }

    @PutMapping("/booking/min-advance-days")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Map<String, Object>> setMinAdvanceDays(@RequestBody Map<String, Integer> body) {
        Integer days = body.get("days");
        if (days == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Campo 'days' é obrigatório."));
        }
        configService.setMinAdvanceDays(days);
        return ResponseEntity.ok(Map.of(
                "message", "Prazo mínimo atualizado com sucesso.",
                "days", days
        ));
    }
}