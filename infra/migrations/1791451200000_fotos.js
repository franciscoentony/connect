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
  // As fotos ficam no próprio banco, numa coluna BYTEA (bytes do arquivo).
  // Assim funcionam igual no computador e na Vercel, sem serviço externo.
  //
  // Por que tabelas separadas, e não uma coluna "foto" em usuario/campanha?
  // Uma foto pesa até 2 MB. Separada, ela só é lida quando alguém pede a
  // imagem; as buscas comuns (listar campanhas, login...) continuam leves.
  pgm.sql(`
    CREATE TABLE foto_usuario (
      id_usuario    BIGINT PRIMARY KEY
                    REFERENCES usuario (id_usuario) ON DELETE CASCADE,
      conteudo      BYTEA NOT NULL,
      tipo          VARCHAR(20) NOT NULL,
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE foto_campanha (
      id_foto     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      id_campanha BIGINT NOT NULL
                  REFERENCES campanha (id_campanha) ON DELETE CASCADE,
      conteudo    BYTEA NOT NULL,
      tipo        VARCHAR(20) NOT NULL,
      criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX idx_foto_campanha_id_campanha ON foto_campanha (id_campanha);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE foto_campanha;
    DROP TABLE foto_usuario;
  `);
};
