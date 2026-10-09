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
  // Informações públicas da ONG, mostradas na página /ongs/{id}.
  // Todas são opcionais (NULL = a ONG ainda não preencheu).
  // - contato: telefone ou e-mail que a ONG QUER deixar público
  //   (o e-mail de login nunca aparece na página pública).
  pgm.sql(`
    ALTER TABLE ong
      ADD COLUMN descricao VARCHAR(500),
      ADD COLUMN site      VARCHAR(255),
      ADD COLUMN contato   VARCHAR(150);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE ong
      DROP COLUMN descricao,
      DROP COLUMN site,
      DROP COLUMN contato;
  `);
};
