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
    ALTER TABLE doacao ADD COLUMN descricao VARCHAR(255);

    ALTER TABLE doacao ADD CONSTRAINT doacao_item_exige_descricao CHECK (
      tipo <> 'item'
      OR (descricao IS NOT NULL AND valor IS NULL AND id_metodo IS NULL)
    );

    INSERT INTO metodo_pagamento (nome, tipo) VALUES
      ('Pix', 'instantaneo'),
      ('Cartão de crédito', 'cartao'),
      ('Boleto', 'boleto');
  `);

};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    DELETE FROM metodo_pagamento WHERE nome IN ('Pix', 'Cartão de crédito', 'Boleto');
    ALTER TABLE doacao DROP CONSTRAINT doacao_item_exige_descricao;
    ALTER TABLE doacao DROP COLUMN descricao;
  `);
};
