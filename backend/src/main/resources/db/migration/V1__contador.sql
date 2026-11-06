CREATE TABLE IF NOT EXISTS contador (
                                        id_contador BIGINT PRIMARY KEY,
                                        total BIGINT NOT NULL DEFAULT 0
);

INSERT INTO contador (id_contador, total)
VALUES (1, 0)
    ON CONFLICT (id_contador) DO NOTHING;