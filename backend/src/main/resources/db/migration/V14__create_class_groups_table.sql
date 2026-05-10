-- V14__create_class_groups_table.sql
-- Turmas: compostas por curso + semestre_ordinal (1º, 2º, 3º...) + período (Manhã, Tarde, Noite, Sábado).
-- São geradas automaticamente por um evento de inicialização ou via stored procedure.
-- Semestre_ordinal = semestre do curso (1 a 6 para tecnólogos / 1 a 8 para bacharelados).

CREATE TABLE IF NOT EXISTS class_groups (
                                            class_group_id   INT UNSIGNED     NOT NULL AUTO_INCREMENT,
                                            course_id        INT UNSIGNED     NOT NULL,
                                            course_semester  TINYINT UNSIGNED NOT NULL COMMENT 'Semestre do curso: 1, 2, 3, ...',
                                            shift            ENUM('MORNING','AFTERNOON','EVENING','SATURDAY') NOT NULL,
    label            VARCHAR(100)     NOT NULL COMMENT 'Ex: 3º ADS Manhã',
    active           TINYINT UNSIGNED NOT NULL DEFAULT 1,
    created_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_group_id),
    UNIQUE KEY uq_class_group (course_id, course_semester, shift),
    CONSTRAINT fk_cg_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stored procedure para gerar turmas automaticamente para todos os cursos
DELIMITER $$

CREATE PROCEDURE generate_class_groups()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_course_id INT UNSIGNED;
    DECLARE v_abbreviation VARCHAR(20);
    DECLARE v_has_saturday TINYINT UNSIGNED;
    DECLARE v_max_semesters TINYINT UNSIGNED;
    DECLARE v_sem INT;

    DECLARE cur CURSOR FOR
SELECT course_id, abbreviation, has_saturday FROM courses WHERE active = 1;
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

OPEN cur;

read_loop: LOOP
        FETCH cur INTO v_course_id, v_abbreviation, v_has_saturday;
        IF done THEN
            LEAVE read_loop;
END IF;

        -- Tecnólogos têm 6 semestres (padrão Fatec)
        SET v_max_semesters = 6;
        SET v_sem = 1;

        WHILE v_sem <= v_max_semesters DO
            -- Período Manhã
            INSERT IGNORE INTO class_groups (course_id, course_semester, shift, label)
            VALUES (v_course_id, v_sem, 'MORNING',
                    CONCAT(v_sem, 'º ', v_abbreviation, ' Manhã'));

            -- Período Tarde
            INSERT IGNORE INTO class_groups (course_id, course_semester, shift, label)
            VALUES (v_course_id, v_sem, 'AFTERNOON',
                    CONCAT(v_sem, 'º ', v_abbreviation, ' Tarde'));

            -- Período Noite
            INSERT IGNORE INTO class_groups (course_id, course_semester, shift, label)
            VALUES (v_course_id, v_sem, 'EVENING',
                    CONCAT(v_sem, 'º ', v_abbreviation, ' Noite'));

            -- Período Sábado (apenas cursos com has_saturday = 1)
            IF v_has_saturday = 1 THEN
                INSERT IGNORE INTO class_groups (course_id, course_semester, shift, label)
                VALUES (v_course_id, v_sem, 'SATURDAY',
                        CONCAT(v_sem, 'º ', v_abbreviation, ' Sábado'));
END IF;

            SET v_sem = v_sem + 1;
END WHILE;

END LOOP;

CLOSE cur;
END$$

DELIMITER ;

-- Executa a procedure para popular as turmas
CALL generate_class_groups();