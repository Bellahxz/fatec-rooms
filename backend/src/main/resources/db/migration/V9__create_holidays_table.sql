-- V9__create_holidays_table.sql
-- Tabela de feriados e datas especiais cadastradas pelo coordenador.
-- Vinculadas a um semestre, mas com tipo que define a origem.

CREATE TABLE IF NOT EXISTS holidays (
    holiday_id    INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    semester_id   INT UNSIGNED     NOT NULL,
    name          VARCHAR(150)     NOT NULL,
    holiday_date  DATE             NOT NULL,
    type          ENUM('NATIONAL','CUSTOM') NOT NULL DEFAULT 'CUSTOM',
    description   VARCHAR(500)     DEFAULT NULL,
    created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (holiday_id),
    UNIQUE KEY uq_holiday_semester_date (semester_id, holiday_date),
    CONSTRAINT fk_holidays_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
