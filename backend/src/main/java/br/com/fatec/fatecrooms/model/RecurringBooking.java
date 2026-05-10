package br.com.fatec.fatecrooms.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "recurring_bookings")
public class RecurringBooking {

    public enum Status {
        ACTIVE, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recurring_booking_id", columnDefinition = "int UNSIGNED not null")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_group_id", nullable = false)
    private ClassGroup classGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "subject", nullable = false, length = 150)
    private String subject;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    /**
     * Dias da semana como lista JSON: ["MONDAY","WEDNESDAY"] ou ["SATURDAY"]
     * Valores possíveis: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "week_days", nullable = false, columnDefinition = "json")
    private List<String> weekDays = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status = Status.ACTIVE;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "recurring_booking_periods",
            joinColumns = @JoinColumn(name = "recurring_booking_id"),
            inverseJoinColumns = @JoinColumn(name = "period_id")
    )
    @OrderBy("startTime ASC")
    private Set<Period> periods = new LinkedHashSet<>();

    @OneToMany(mappedBy = "recurringBooking", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("bookingDate ASC")
    private List<RecurringBookingInstance> instances = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}