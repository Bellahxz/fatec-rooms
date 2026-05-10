-- V15__create_recurring_bookings_table.sql
-- Reservas recorrentes semestrais: o coordenador define uma reserva que se repete
-- em dias específicos da semana durante um semestre.
-- Instâncias individuais são geradas na tabela recurring_booking_instances.

CREATE TABLE IF NOT EXISTS recurring_bookings (
                                                  recurring_booking_id INT UNSIGNED  NOT NULL AUTO_INCREMENT,
                                                  semester_id          INT UNSIGNED  NOT NULL,
                                                  room_id              INT UNSIGNED  NOT NULL,
                                                  class_group_id       INT UNSIGNED  NOT NULL,
                                                  created_by           INT UNSIGNED  NOT NULL COMMENT 'Coordenador que criou',
                                                  subject              VARCHAR(150)  NOT NULL,
    notes                TEXT          DEFAULT NULL,

    -- Dias da semana em que ocorre (JSON array: ["MONDAY","WEDNESDAY","FRIDAY"] ou ["SATURDAY"])
    -- Para cursos com sábado, sempre será ["SATURDAY"]
    week_days            JSON          NOT NULL,

    -- Status geral da reserva recorrente
    status               ENUM('ACTIVE','CANCELLED') NOT NULL DEFAULT 'ACTIVE',

    created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (recurring_booking_id),
    INDEX idx_rb_semester (semester_id),
    INDEX idx_rb_room      (room_id),
    INDEX idx_rb_class     (class_group_id),
    CONSTRAINT fk_rb_semester    FOREIGN KEY (semester_id)    REFERENCES semesters(semester_id)       ON DELETE RESTRICT,
    CONSTRAINT fk_rb_room        FOREIGN KEY (room_id)         REFERENCES rooms(room_id)               ON DELETE RESTRICT,
    CONSTRAINT fk_rb_class_group FOREIGN KEY (class_group_id)  REFERENCES class_groups(class_group_id) ON DELETE RESTRICT,
    CONSTRAINT fk_rb_created_by  FOREIGN KEY (created_by)      REFERENCES users(user_id)               ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de relacionamento: quais períodos estão associados à reserva recorrente
CREATE TABLE IF NOT EXISTS recurring_booking_periods (
                                                         recurring_booking_id INT UNSIGNED NOT NULL,
                                                         period_id            INT UNSIGNED NOT NULL,
                                                         PRIMARY KEY (recurring_booking_id, period_id),
    CONSTRAINT fk_rbp_booking FOREIGN KEY (recurring_booking_id)
    REFERENCES recurring_bookings(recurring_booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_rbp_period  FOREIGN KEY (period_id)
    REFERENCES periods(period_id)                       ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Instâncias individuais geradas a partir de uma reserva recorrente
-- (uma por data concreta durante o semestre)
CREATE TABLE IF NOT EXISTS recurring_booking_instances (
                                                           instance_id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
                                                           recurring_booking_id INT UNSIGNED  NOT NULL,
                                                           booking_date         DATE          NOT NULL,
                                                           status               ENUM('ACTIVE','CANCELLED','SKIPPED') NOT NULL DEFAULT 'ACTIVE'
    COMMENT 'SKIPPED = pulada por feriado ou conflito',
    skip_reason          VARCHAR(255)  DEFAULT NULL,
    created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (instance_id),
    UNIQUE KEY uq_instance_date (recurring_booking_id, booking_date),
    INDEX idx_rbi_date (booking_date),
    CONSTRAINT fk_rbi_recurring FOREIGN KEY (recurring_booking_id)
    REFERENCES recurring_bookings(recurring_booking_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;