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
    CREATE TYPE status_campanha AS ENUM ('rascunho', 'ativa', 'encerrada', 'cancelada');

    CREATE TABLE campanha (
      id_campanha BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      id_ong      BIGINT NOT NULL REFERENCES ong (id_usuario),
      titulo      VARCHAR(150) NOT NULL,
      meta        NUMERIC(12,2) CHECK (meta > 0),
      status      status_campanha NOT NULL DEFAULT 'rascunho',
      criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX idx_campanha_id_ong ON campanha (id_ong);

    CREATE TABLE local_entrega (
      id_local    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      id_campanha BIGINT NOT NULL REFERENCES campanha (id_campanha) ON DELETE CASCADE,
      endereco    VARCHAR(255) NOT NULL,
      cidade      VARCHAR(100) NOT NULL
    );
    CREATE INDEX idx_local_entrega_id_campanha ON local_entrega (id_campanha);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE local_entrega;
    DROP TABLE campanha;
    DROP TYPE status_campanha;  
  `);
};
