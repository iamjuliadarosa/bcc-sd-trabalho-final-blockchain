const mongoose = require('mongoose');

const EleicaoSchema = new mongoose.Schema({
  titulo: String,
  descricao: String,
  inicio: Date,
  fim: Date,
  status: { type: String, enum: ['ABERTA', 'ENCERRADA'], default: 'ABERTA' },
  criado_por: String,
  criado_em: { type: Date, default: Date.now },
  hash_blockchain: String
});

module.exports = mongoose.model('Eleicao', EleicaoSchema);