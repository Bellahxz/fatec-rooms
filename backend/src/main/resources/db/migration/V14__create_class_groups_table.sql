-- V14__create_class_groups_table.sql
-- Turmas: curso + semestre_ordinal (1º–6º) + período (Manhã/Tarde/Noite).
-- Cursos com has_saturday = 1 ganham uma flag extra; o sábado é um dia adicional
-- de aula, não um turno exclusivo. Todas as turmas têm aula nos dias úteis.
-- A coluna has_saturday na turma indica se ela também tem aula aos sábados.

CREATE TABLE IF NOT EXISTS class_groups (
                                            class_group_id  INT UNSIGNED     NOT NULL AUTO_INCREMENT,
                                            course_id       INT UNSIGNED     NOT NULL,
                                            course_semester TINYINT UNSIGNED NOT NULL COMMENT 'Semestre do curso: 1 a 6',
                                            shift           ENUM('MORNING','AFTERNOON','EVENING') NOT NULL,
    has_saturday    TINYINT UNSIGNED NOT NULL DEFAULT 0
    COMMENT 'Herda do curso: 1 = também tem aula de sábado',
    label           VARCHAR(100)     NOT NULL COMMENT 'Ex: 3º ADS Manhã',
    active          TINYINT UNSIGNED NOT NULL DEFAULT 1,
    created_at      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_group_id),
    UNIQUE KEY uq_class_group (course_id, course_semester, shift),
    CONSTRAINT fk_cg_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Gera turmas para todos os cursos: 6 semestres × 3 turnos
-- Cursos com has_saturday = 1 recebem has_saturday = 1 em todas as suas turmas

INSERT INTO class_groups (course_id, course_semester, shift, has_saturday, label)
SELECT
    c.course_id,
    s.sem,
    t.shift,
    c.has_saturday,
    CONCAT(s.sem, 'º ', c.abbreviation, ' ',
           CASE t.shift
               WHEN 'MORNING'   THEN 'Manhã'
               WHEN 'AFTERNOON' THEN 'Tarde'
               WHEN 'EVENING'   THEN 'Noite'
               END
    ) AS label
FROM courses c
         CROSS JOIN (
    SELECT 1 AS sem UNION SELECT 2 UNION SELECT 3
    UNION SELECT 4  UNION SELECT 5  UNION SELECT 6
) s
         CROSS JOIN (
    SELECT 'MORNING'   AS shift UNION
    SELECT 'AFTERNOON' UNION
    SELECT 'EVENING'
) t
WHERE c.active = 1
ORDER BY c.course_id, s.sem, t.shift;