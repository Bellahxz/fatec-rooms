package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.DTO.CourseDTO;
import br.com.fatec.fatecrooms.DTO.CourseRequest;
import br.com.fatec.fatecrooms.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseDTO>> listActive() {
        return ResponseEntity.ok(courseService.listActive());
    }

    @GetMapping("/all")
    public ResponseEntity<List<CourseDTO>> listAll() {
        return ResponseEntity.ok(courseService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(courseService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<CourseDTO> create(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<CourseDTO> update(@PathVariable Integer id,
                                            @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Integer id) {
        return ResponseEntity.ok(Map.of("message", courseService.delete(id)));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<CourseDTO> toggleActive(@PathVariable Integer id) {
        return ResponseEntity.ok(courseService.toggleActive(id));
    }
}