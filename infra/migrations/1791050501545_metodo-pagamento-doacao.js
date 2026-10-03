/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.sql(`
    CREATE TYPE tipo_doacao AS ENUM ('dinheiro', 'item');
    CREATE TYPE status_doacao AS ENUM ('pendente', 'confirmada', 'cancelada');

    CREATE TABLE metodo_pagamento (
      id_metodo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      nome      VARCHAR(80) NOT NULL UNIQUE,
      tipo      VARCHAR(40) NOT NULL
    );

    CREATE TABLE doacao (
      id_doacao   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      id_doador   BIGINT NOT NULL REFERENCES doador (id_usuario),
      id_campanha BIGINT NOT NULL REFERENCES campanha (id_campanha),
      id_metodo   BIGINT REFERENCES metodo_pagamento (id_metodo),
      tipo        tipo_doacao NOT NULL,
      valor       NUMERIC(12,2),
      data        TIMESTAMPTZ NOT NULL DEFAULT now(),
      status      status_doacao NOT NULL DEFAULT 'pendente',
      CONSTRAINT doacao_dinheiro_exige_valor_e_metodo CHECK (
        tipo <> 'dinheiro'
        OR (valor IS NOT NULL AND valor > 0 AND id_metodo IS NOT NULL)
      )
    );
    CREATE INDEX idx_doacao_id_doador ON doacao (id_doador);
    CREATE INDEX idx_doacao_id_campanha ON doacao (id_campanha);
  `)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE doacao;
    DROP TABLE metodo_pagamento;
    DROP TYPE status_doacao;
    DROP TYPE tipo_doacao;
  `);
};
