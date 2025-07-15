const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha_hash: String,
  perfil: { type: String, enum: ['ELEITOR', 'ADMIN'] },
  criado_em: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
