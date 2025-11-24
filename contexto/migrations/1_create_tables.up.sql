CREATE TABLE contexto_words (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    words JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contexto_words_date ON contexto_words(date);

