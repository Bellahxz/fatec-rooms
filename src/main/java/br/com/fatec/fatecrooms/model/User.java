package br.com.fatec.fatecrooms.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", columnDefinition = "int UNSIGNED not null")
    private Integer id;

    @Column(name = "department_id", columnDefinition = "int UNSIGNED")
    private Integer departmentId;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "firstname")
    private String firstname;

    @Column(name = "lastname")
    private String lastname;

    @Column(name = "email")
    private String email;

    @Column(name = "password")
    private String password;

    @Column(name = "authlevel", columnDefinition = "tinyint UNSIGNED not null")
    private Byte authlevel;

    @Column(name = "displayname")
    private String displayname;

    @Column(name = "ext")
    private String ext;

    @Column(name = "lastlogin")
    private LocalDateTime lastlogin;

    @ColumnDefault("'0'")
    @Column(name = "enabled", columnDefinition = "tinyint UNSIGNED not null")
    private Byte enabled;

    @Column(name = "created")
    private LocalDateTime created;


}