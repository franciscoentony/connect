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
  // - descricao: para que é a campanha e quem será ajudado. Pode ficar vazia
  //   no rascunho, mas é obrigatória para publicar (regra no model).
  // - termina_em: último dia para doar (opcional). Depois dessa data a
  //   campanha não recebe novas doações.
  pgm.sql(`
    ALTER TABLE campanha
      ADD COLUMN descricao  VARCHAR(2000),
      ADD COLUMN termina_em DATE;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE campanha
      DROP COLUMN descricao,
      DROP COLUMN termina_em;
  `);
};
