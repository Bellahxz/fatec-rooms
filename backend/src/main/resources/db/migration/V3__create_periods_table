CREATE TABLE IF NOT EXISTS periods (
    period_id   INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    name        VARCHAR(50)      NOT NULL,
    start_time  TIME             NOT NULL,
    end_time    TIME             NOT NULL,
    active      TINYINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Períodos bookable=1 (intervalos excluídos)
-- Seg–Sex (IDs 1–15)
INSERT INTO periods (name, start_time, end_time) VALUES
    ('Manhã',       '07:30:00', '08:20:00'),  -- 1
    ('Manhã',       '08:20:00', '09:10:00'),  -- 2
    ('Manhã',       '09:20:00', '10:10:00'),  -- 3
    ('Manhã',       '10:10:00', '11:00:00'),  -- 4
    ('Manhã',       '11:00:00', '11:50:00'),  -- 5
    ('Manhã/Tarde', '11:50:00', '12:40:00'),  -- 6
    ('Tarde',       '13:00:00', '13:50:00'),  -- 7
    ('Tarde',       '13:50:00', '14:40:00'),  -- 8
    ('Tarde',       '14:50:00', '15:40:00'),  -- 9
    ('Tarde',       '15:40:00', '16:30:00'),  -- 10
    ('Tarde',       '16:40:00', '17:30:00'),  -- 11
    ('Tarde',       '17:30:00', '18:20:00'),  -- 12
    ('Noite',       '19:20:00', '20:10:00'),  -- 13
    ('Noite',       '20:10:00', '21:00:00'),  -- 14
    ('Noite',       '21:10:00', '22:00:00'),  -- 15
    ('Noite',       '22:00:00', '22:50:00'),  -- 16
-- Sábado (IDs 17–23)
    ('Sábado',      '08:00:00', '08:50:00'),  -- 17
    ('Sábado',      '08:50:00', '09:40:00'),  -- 18
    ('Sábado',      '09:50:00', '10:40:00'),  -- 19
    ('Sábado',      '10:40:00', '11:30:00'),  -- 20
    ('Sábado',      '11:30:00', '12:20:00'),  -- 21
    ('Sábado',      '12:20:00', '13:10:00'),  -- 22
    ('Sábado',      '13:10:00', '14:00:00'),  -- 23
    ('Sábado',      '14:00:00', '14:50:00');  -- 24