package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.CourseDTO;
import br.com.fatec.fatecrooms.exception.ResourceNotFoundException;
import br.com.fatec.fatecrooms.model.Course;
import br.com.fatec.fatecrooms.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public List<CourseDTO> listActive() {
        return courseRepository.findByActiveOrderByNameAsc((byte) 1)
                .stream().map(this::toDTO).toList();
    }

    public List<CourseDTO> listAll() {
        return courseRepository.findAll()
                .stream().map(this::toDTO).toList();
    }

    public CourseDTO findById(Integer id) {
        return toDTO(getOrThrow(id));
    }

    private Course getOrThrow(Integer id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado: " + id));
    }

    public CourseDTO toDTO(Course c) {
        return new CourseDTO(
                c.getId(),
                c.getName(),
                c.getAbbreviation(),
                c.getHasSaturday() == 1,
                c.getActive() == 1
        );
    }
}