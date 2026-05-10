package br.com.fatec.fatecrooms.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "class_groups",
        uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "course_semester", "shift"}))
public class ClassGroup {

    public enum Shift {
        MORNING, AFTERNOON, EVENING, SATURDAY
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_group_id", columnDefinition = "int UNSIGNED not null")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "course_semester", nullable = false)
    private Byte courseSemester;

    @Enumerated(EnumType.STRING)
    @Column(name = "shift", nullable = false, length = 20)
    private Shift shift;

    @Column(name = "label", nullable = false, length = 100)
    private String label;

    @Column(name = "active", columnDefinition = "tinyint UNSIGNED not null")
    private Byte active = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}