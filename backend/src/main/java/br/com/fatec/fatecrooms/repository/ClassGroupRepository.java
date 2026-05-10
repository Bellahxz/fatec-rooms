package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.ClassGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClassGroupRepository extends JpaRepository<ClassGroup, Integer> {

    List<ClassGroup> findByActiveOrderByCourseSemesterAscShiftAsc(Byte active);

    @Query("""
        SELECT cg FROM ClassGroup cg
        JOIN FETCH cg.course
        WHERE cg.course.id = :courseId
          AND cg.active = 1
        ORDER BY cg.courseSemester ASC, cg.shift ASC
        """)
    List<ClassGroup> findActiveByCourseId(@Param("courseId") Integer courseId);

    @Query("""
        SELECT cg FROM ClassGroup cg
        JOIN FETCH cg.course
        WHERE cg.active = 1
        ORDER BY cg.course.name ASC, cg.courseSemester ASC, cg.shift ASC
        """)
    List<ClassGroup> findAllActiveWithCourse();
}