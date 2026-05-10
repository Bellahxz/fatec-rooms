package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Integer> {
    List<Course> findByActiveOrderByNameAsc(Byte active);
}