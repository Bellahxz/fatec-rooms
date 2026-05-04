package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.DTO.RoomReportDTO;
import br.com.fatec.fatecrooms.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * GET /api/reports/rooms
     * Retorna métricas de uso por sala — apenas coordenadores.
     */
    @GetMapping("/rooms")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<RoomReportDTO>> getRoomsReport() {
        return ResponseEntity.ok(reportService.getRoomsReport());
    }
}
