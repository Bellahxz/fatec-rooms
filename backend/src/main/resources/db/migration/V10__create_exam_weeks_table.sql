-- V10__create_exam_weeks_table.sql
-- Tabela de semanas de aplicação de provas (P1, P2, P3).
-- São sugestões de período para o professor aplicar provas.

CREATE TABLE IF NOT EXISTS exam_weeks (
    exam_week_id  INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    semester_id   INT UNSIGNED     NOT NULL,
    exam_type     ENUM('P1','P2','P3') NOT NULL,
    start_date    DATE             NOT NULL,
    end_date      DATE             NOT NULL,
    description   VARCHAR(500)     DEFAULT NULL,
    created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (exam_week_id),
    UNIQUE KEY uq_exam_week_semester_type (semester_id, exam_type),
    CONSTRAINT fk_exam_weeks_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
    CONSTRAINT chk_exam_week_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
