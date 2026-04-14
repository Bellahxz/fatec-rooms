package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.DTO.RoomDTO;
import br.com.fatec.fatecrooms.DTO.RoomRequest;
import br.com.fatec.fatecrooms.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<List<RoomDTO>> listBookable() {
        return ResponseEntity.ok(roomService.listBookable());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<RoomDTO>> listAll() {
        return ResponseEntity.ok(roomService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<RoomDTO> create(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<RoomDTO> update(@PathVariable Integer id,
                                          @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.delete(id));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<RoomDTO> toggleBookable(@PathVariable Integer id) {
        RoomDTO room = roomService.findById(id);
        RoomRequest req = new RoomRequest();
        req.setName(room.getName());
        req.setLocation(room.getLocation());
        req.setNotes(room.getNotes());
        req.setBookable(room.getBookable() == 1 ? (byte) 0 : (byte) 1);
        return ResponseEntity.ok(roomService.update(id, req));
    }
}