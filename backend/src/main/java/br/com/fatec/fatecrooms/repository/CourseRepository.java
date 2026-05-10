package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Integer> {

    List<Course> findByActiveOrderByNameAsc(Byte active);

    Optional<Course> findByAbbreviationIgnoreCase(String abbreviation);

    boolean existsByAbbreviationIgnoreCase(String abbreviation);

    boolean existsByNameIgnoreCase(String name);
}