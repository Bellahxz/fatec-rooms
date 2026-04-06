package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.DTO.UserSummaryDTO;
import br.com.fatec.fatecrooms.service.UserAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserAdminService userAdminService;

    @GetMapping("/pending")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<UserSummaryDTO>> listPending() {
        return ResponseEntity.ok(userAdminService.listPendingRegistrations());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<String> approve(@PathVariable Integer id, @RequestBody Map<String, Byte> body) {
        Byte authlevel = body.get("authlevel");
        return ResponseEntity.ok(userAdminService.approveRegistration(id, authlevel));
    }

    @DeleteMapping("/{id}/reject")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<String> reject(@PathVariable Integer id) {
        return ResponseEntity.ok(userAdminService.rejectRegistration(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<UserSummaryDTO>> listAll() {
        return ResponseEntity.ok(userAdminService.listAllUsers());
    }

    @PatchMapping("/{id}/disable")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<String> disable(@PathVariable Integer id) {
        return ResponseEntity.ok(userAdminService.disableUser(id));
    }
}