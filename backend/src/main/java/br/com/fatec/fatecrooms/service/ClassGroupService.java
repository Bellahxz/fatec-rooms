package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.ClassGroupDTO;
import br.com.fatec.fatecrooms.exception.ResourceNotFoundException;
import br.com.fatec.fatecrooms.model.ClassGroup;
import br.com.fatec.fatecrooms.repository.ClassGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassGroupService {

    private final ClassGroupRepository classGroupRepository;

    public List<ClassGroupDTO> listAllActive() {
        return classGroupRepository.findAllActiveWithCourse()
                .stream().map(this::toDTO).toList();
    }

    public List<ClassGroupDTO> listByCourse(Integer courseId) {
        return classGroupRepository.findActiveByCourseId(courseId)
                .stream().map(this::toDTO).toList();
    }

    public ClassGroupDTO findById(Integer id) {
        ClassGroup cg = classGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada: " + id));
        return toDTO(cg);
    }

    public ClassGroupDTO toDTO(ClassGroup cg) {
        return new ClassGroupDTO(
                cg.getId(),
                cg.getCourse().getId(),
                cg.getCourse().getName(),
                cg.getCourse().getAbbreviation(),
                cg.getCourseSemester(),
                cg.getShift(),
                cg.getLabel(),
                cg.getActive() == 1
        );
    }
}