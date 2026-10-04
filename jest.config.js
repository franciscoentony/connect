export default {
  // O bcrypt (custo 12) deixa cadastro e login lentos; 5s não basta.
  testTimeout: 30000,
  // As suítes compartilham o mesmo servidor e o mesmo banco.
  maxWorkers: 1,
};
