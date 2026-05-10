package br.com.fatec.fatecrooms.controller;

import br.com.fatec.fatecrooms.DTO.ClassGroupDTO;
import br.com.fatec.fatecrooms.service.ClassGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/class-groups")
@RequiredArgsConstructor
public class ClassGroupController {

    private final ClassGroupService classGroupService;

    /**
     * GET /api/class-groups
     * Lista todas as turmas ativas — qualquer usuário autenticado.
     * Usado pelo coordenador para selecionar turma ao criar reserva recorrente.
     */
    @GetMapping
    public ResponseEntity<List<ClassGroupDTO>> listAllActive() {
        return ResponseEntity.ok(classGroupService.listAllActive());
    }

    /**
     * GET /api/class-groups/by-course/{courseId}
     * Lista turmas ativas de um curso específico.
     */
    @GetMapping("/by-course/{courseId}")
    public ResponseEntity<List<ClassGroupDTO>> listByCourse(@PathVariable Integer courseId) {
        return ResponseEntity.ok(classGroupService.listByCourse(courseId));
    }

    /**
     * GET /api/class-groups/{id}
     * Detalhe de uma turma.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ClassGroupDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(classGroupService.findById(id));
    }
}