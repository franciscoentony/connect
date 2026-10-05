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
    ALTER TABLE donatario
      ADD COLUMN id_ong BIGINT NOT NULL REFERENCES ong (id_usuario),
      ADD COLUMN criado_em TIMESTAMPTZ NOT NULL DEFAULT now();
    CREATE INDEX idx_donatario_id_ong ON donatario (id_ong);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE donatario DROP COLUMN criado_em, DROP COLUMN id_ong;
  `);
};
