-- GlamourOS Database Migrations Init
-- Initializing branch schema isolation structures

CREATE TABLE IF NOT EXISTS migration_logs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migration_logs (name) VALUES ('01_init');
