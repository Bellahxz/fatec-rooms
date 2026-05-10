package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.CourseDTO;
import br.com.fatec.fatecrooms.DTO.CourseRequest;
import br.com.fatec.fatecrooms.exception.BusinessException;
import br.com.fatec.fatecrooms.exception.ResourceNotFoundException;
import br.com.fatec.fatecrooms.model.ClassGroup;
import br.com.fatec.fatecrooms.model.Course;
import br.com.fatec.fatecrooms.repository.ClassGroupRepository;
import br.com.fatec.fatecrooms.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository     courseRepository;
    private final ClassGroupRepository classGroupRepository;

    public List<CourseDTO> listActive() {
        return courseRepository.findByActiveOrderByNameAsc((byte) 1)
                .stream().map(this::toDTO).toList();
    }

    public List<CourseDTO> listAll() {
        return courseRepository.findAll().stream().map(this::toDTO).toList();
    }

    public CourseDTO findById(Integer id) {
        return toDTO(getOrThrow(id));
    }

    @Transactional
    public CourseDTO create(CourseRequest request) {
        String name         = request.getName().trim();
        String abbreviation = request.getAbbreviation().trim().toUpperCase();

        if (courseRepository.existsByNameIgnoreCase(name))
            throw new BusinessException("Já existe um curso com o nome '" + name + "'.");
        if (courseRepository.existsByAbbreviationIgnoreCase(abbreviation))
            throw new BusinessException("Já existe um curso com a abreviação '" + abbreviation + "'.");

        Course course = new Course();
        course.setName(name);
        course.setAbbreviation(abbreviation);
        course.setHasSaturday(request.isHasSaturday() ? (byte) 1 : (byte) 0);
        course.setActive((byte) 1);

        Course saved = courseRepository.save(course);
        generateClassGroups(saved);
        return toDTO(saved);
    }

    @Transactional
    public CourseDTO update(Integer id, CourseRequest request) {
        Course course = getOrThrow(id);

        String name         = request.getName().trim();
        String abbreviation = request.getAbbreviation().trim().toUpperCase();

        if (!course.getName().equalsIgnoreCase(name)
                && courseRepository.existsByNameIgnoreCase(name))
            throw new BusinessException("Já existe um curso com o nome '" + name + "'.");
        if (!course.getAbbreviation().equalsIgnoreCase(abbreviation)
                && courseRepository.existsByAbbreviationIgnoreCase(abbreviation))
            throw new BusinessException("Já existe um curso com a abreviação '" + abbreviation + "'.");

        boolean saturdayChanged = (course.getHasSaturday() == 1) != request.isHasSaturday();
        boolean abbreviationChanged = !course.getAbbreviation().equalsIgnoreCase(abbreviation);

        course.setName(name);
        course.setAbbreviation(abbreviation);
        course.setHasSaturday(request.isHasSaturday() ? (byte) 1 : (byte) 0);
        Course saved = courseRepository.save(course);

        List<ClassGroup> groups = classGroupRepository.findByCourseId(id);
        if (saturdayChanged || abbreviationChanged) {
            byte newHasSat = request.isHasSaturday() ? (byte) 1 : (byte) 0;
            groups.forEach(cg -> {
                if (saturdayChanged) cg.setHasSaturday(newHasSat);
                cg.setLabel(buildLabel(saved.getAbbreviation(), cg.getCourseSemester(), cg.getShift()));
                classGroupRepository.save(cg);
            });
        }

        return toDTO(saved);
    }

    @Transactional
    public String delete(Integer id) {
        Course course = getOrThrow(id);
        courseRepository.delete(course);
        return "Curso '" + course.getName() + "' removido com sucesso.";
    }

    @Transactional
    public CourseDTO toggleActive(Integer id) {
        Course course = getOrThrow(id);
        course.setActive(course.getActive() == 1 ? (byte) 0 : (byte) 1);
        return toDTO(courseRepository.save(course));
    }

    private void generateClassGroups(Course course) {
        byte hasSat = course.getHasSaturday();
        for (byte sem = 1; sem <= 6; sem++) {
            for (ClassGroup.Shift shift : ClassGroup.Shift.values()) {
                ClassGroup cg = new ClassGroup();
                cg.setCourse(course);
                cg.setCourseSemester(sem);
                cg.setShift(shift);
                cg.setHasSaturday(hasSat);
                cg.setLabel(buildLabel(course.getAbbreviation(), sem, shift));
                cg.setActive((byte) 1);
                classGroupRepository.save(cg);
            }
        }
    }

    private String buildLabel(String abbreviation, byte semester, ClassGroup.Shift shift) {
        String shiftPt = switch (shift) {
            case MORNING   -> "Manhã";
            case AFTERNOON -> "Tarde";
            case EVENING   -> "Noite";
        };
        return semester + "º " + abbreviation + " " + shiftPt;
    }

    private Course getOrThrow(Integer id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado: " + id));
    }

    public CourseDTO toDTO(Course c) {
        return new CourseDTO(
                c.getId(), c.getName(), c.getAbbreviation(),
                c.getHasSaturday() == 1, c.getActive() == 1,
                c.getCreatedAt(), c.getUpdatedAt()
        );
    }
}