-- V13__create_courses_table.sql
-- Tabela de cursos oferecidos pela instituição.
-- As turmas (class_groups) serão geradas automaticamente a partir desta tabela.

CREATE TABLE IF NOT EXISTS courses (
                                       course_id    INT UNSIGNED     NOT NULL AUTO_INCREMENT,
                                       name         VARCHAR(150)     NOT NULL,
    abbreviation VARCHAR(20)      NOT NULL,
    has_saturday TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '1 = tem aula de sábado',
    active       TINYINT UNSIGNED NOT NULL DEFAULT 1,
    created_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (course_id),
    UNIQUE KEY uq_course_abbreviation (abbreviation)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cursos predefinidos (limitados e previsíveis)
INSERT INTO courses (name, abbreviation, has_saturday) VALUES
                                                           ('Análise e Desenvolvimento de Sistemas',      'ADS',     1),
                                                           ('Desenvolvimento de Software Multiplataforma','DSM',     1),
                                                           ('Administração',                              'ADM',     0),
                                                           ('Gestão de Recursos Humanos',                 'RH',     0),
                                                           ('Comércio Exterior',                          'COMEX',   0),
                                                           ('Gestão Empresarial',                         'GE',      0),
                                                           ('Logística',                                  'LOG',     0),
                                                           ('Manufatura Avançada',                        'MFA',     0),
                                                           ('Polímeros',                                  'POL',     0);