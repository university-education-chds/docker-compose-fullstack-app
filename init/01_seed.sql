CREATE TABLE IF NOT EXISTS items (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO items (name, done) VALUES
    ('Проснуться', TRUE),
    ('Почистить зубы', FALSE),
    ('#КОНЦЕПТ', FALSE);