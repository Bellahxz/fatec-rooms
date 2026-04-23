-- Remove a FK primeiro
ALTER TABLE bookings DROP FOREIGN KEY fk_bookings_period;

-- Agora pode remover a coluna
ALTER TABLE bookings DROP COLUMN period_id;

-- Cria tabela de relação
CREATE TABLE booking_periods (
    booking_id INT UNSIGNED NOT NULL,
    period_id  INT UNSIGNED NOT NULL,
    PRIMARY KEY (booking_id, period_id),
    CONSTRAINT fk_bp_booking 
        FOREIGN KEY (booking_id) 
        REFERENCES bookings(booking_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_bp_period  
        FOREIGN KEY (period_id)  
        REFERENCES periods(period_id)  
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;