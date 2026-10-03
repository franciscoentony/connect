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
    CREATE TABLE donatario (
      id_donatario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      nome         VARCHAR(150) NOT NULL,
      contato      VARCHAR(150)
    );

    CREATE TABLE campanha_donatario (
      id_campanha  BIGINT NOT NULL REFERENCES campanha (id_campanha) ON DELETE CASCADE,
      id_donatario BIGINT NOT NULL REFERENCES donatario (id_donatario) ON DELETE CASCADE,
      PRIMARY KEY (id_campanha, id_donatario)
    );
    CREATE INDEX idx_campanha_donatario_id_donatario ON campanha_donatario (id_donatario);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE campanha_donatario;
    DROP TABLE donatario;
  `);
};
