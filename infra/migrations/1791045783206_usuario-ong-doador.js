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
    CREATE TYPE tipo_usuario AS ENUM ('ong', 'doador');

    CREATE TABLE usuario (
      id_usuario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email      VARCHAR(255) NOT NULL UNIQUE,
      senha_hash VARCHAR(255) NOT NULL,
      tipo       tipo_usuario NOT NULL,
      criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (id_usuario, tipo)
    );

    CREATE TABLE ong (
      id_usuario BIGINT PRIMARY KEY,
      tipo       tipo_usuario NOT NULL DEFAULT 'ong' CHECK (tipo = 'ong'),
      nome       VARCHAR(150) NOT NULL,
      cnpj       CHAR(14) NOT NULL UNIQUE,
      FOREIGN KEY (id_usuario, tipo)
        REFERENCES usuario (id_usuario, tipo) ON DELETE CASCADE
    );

    CREATE TABLE doador (
      id_usuario BIGINT PRIMARY KEY,
      tipo       tipo_usuario NOT NULL DEFAULT 'doador' CHECK (tipo = 'doador'),
      nome       VARCHAR(150) NOT NULL,
      FOREIGN KEY (id_usuario, tipo)
        REFERENCES usuario (id_usuario, tipo) ON DELETE CASCADE
    );
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
      DROP TABLE doador;
      DROP TABLE ong;
      DROP TABLE usuario;
      DROP TABLE tipo_usuario;
    `);
};
