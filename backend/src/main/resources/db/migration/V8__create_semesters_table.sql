-- V8__create_semesters_table.sql
-- Tabela de semestres acadêmicos.

CREATE TABLE IF NOT EXISTS semesters (
    semester_id   INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100)     NOT NULL,
    start_date    DATE             NOT NULL,
    end_date      DATE             NOT NULL,
    active        TINYINT UNSIGNED NOT NULL DEFAULT 1,
    created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (semester_id),
    CONSTRAINT chk_semester_dates CHECK (end_date > start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
