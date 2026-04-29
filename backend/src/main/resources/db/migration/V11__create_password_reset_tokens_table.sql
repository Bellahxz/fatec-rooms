-- V11__create_password_reset_tokens_table.sql
-- Tokens de redefinição de senha enviados por e-mail.
-- Um token é gerado no passo 1 e consumido (used=1) no passo 2.

CREATE TABLE IF NOT EXISTS password_reset_tokens (
                                                     token_id   INT UNSIGNED     NOT NULL AUTO_INCREMENT,
                                                     user_id    INT UNSIGNED     NOT NULL,
                                                     token      VARCHAR(64)      NOT NULL,
    expires_at DATETIME         NOT NULL,
    used       TINYINT(1)       NOT NULL DEFAULT 0,
    created_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (token_id),
    UNIQUE KEY uq_password_reset_token (token),
    INDEX idx_prt_user (user_id),
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;