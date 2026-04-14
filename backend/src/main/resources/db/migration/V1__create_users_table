CREATE TABLE IF NOT EXISTS users (
    user_id       INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    department_id INT UNSIGNED    DEFAULT NULL,
    username      VARCHAR(100)    NOT NULL,
    firstname     VARCHAR(100)    DEFAULT NULL,
    lastname      VARCHAR(100)    DEFAULT NULL,
    email         VARCHAR(255)    DEFAULT NULL,
    password      VARCHAR(255)    DEFAULT NULL,
    authlevel     TINYINT UNSIGNED NOT NULL DEFAULT 0,
    displayname   VARCHAR(150)    DEFAULT NULL,
    ext           VARCHAR(20)     DEFAULT NULL,
    lastlogin     DATETIME        DEFAULT NULL,
    enabled       TINYINT UNSIGNED NOT NULL DEFAULT 0,
    created       DATETIME        DEFAULT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email    (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;