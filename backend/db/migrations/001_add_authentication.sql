CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE conversation
    ADD COLUMN owner_user_id BIGINT UNSIGNED NULL,
    ADD INDEX idx_conversation_owner_created (owner_user_id, created_at, id),
    ADD CONSTRAINT fk_conversation_owner FOREIGN KEY (owner_user_id)
        REFERENCES users(id) ON DELETE CASCADE;
