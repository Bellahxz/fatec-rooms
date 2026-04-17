-- V7__create_system_config_table.sql
-- Tabela de configurações globais do sistema, editáveis pelo coordenador.

CREATE TABLE IF NOT EXISTS system_config (
                                             config_key   VARCHAR(100) NOT NULL,
    config_value VARCHAR(255) NOT NULL,
    description  VARCHAR(500) DEFAULT NULL,
    PRIMARY KEY (config_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Valor padrão: prazo mínimo de 7 dias de antecedência para criar reservas.
-- O coordenador pode alterar este valor via API (PUT /api/config/booking/min-advance-days).
INSERT INTO system_config (config_key, config_value, description) VALUES
    ('booking.minAdvanceDays', '7',
     'Número mínimo de dias de antecedência exigido para criação de reservas.');