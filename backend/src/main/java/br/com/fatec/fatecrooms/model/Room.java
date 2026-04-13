package br.com.fatec.fatecrooms.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id", columnDefinition = "int UNSIGNED not null")
    private Integer id;

    @Column(name = "user_id", columnDefinition = "int UNSIGNED")
    private Integer userId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "location")
    private String location;

    @Column(name = "bookable", columnDefinition = "tinyint UNSIGNED not null")
    private Byte bookable;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;
}