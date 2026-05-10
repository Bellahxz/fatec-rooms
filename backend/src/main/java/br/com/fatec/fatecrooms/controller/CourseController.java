package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.DTO.CourseDTO;
import br.com.fatec.fatecrooms.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    /**
     * GET /api/courses
     * Lista todos os cursos ativos — qualquer usuário autenticado.
     */
    @GetMapping
    public ResponseEntity<List<CourseDTO>> listActive() {
        return ResponseEntity.ok(courseService.listActive());
    }

    /**
     * GET /api/courses/all
     * Lista todos os cursos (ativos e inativos) — qualquer usuário autenticado.
     */
    @GetMapping("/all")
    public ResponseEntity<List<CourseDTO>> listAll() {
        return ResponseEntity.ok(courseService.listAll());
    }

    /**
     * GET /api/courses/{id}
     * Detalhe de um curso.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(courseService.findById(id));
    }
}