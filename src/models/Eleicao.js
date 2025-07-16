const mongoose = require('mongoose');

const EleicaoSchema = new mongoose.Schema({
  titulo: String,
  descricao: String,
  inicio: Date,
  fim: Date,
  criado_por: mongoose.Schema.Types.ObjectId,
  opcoes: [String],
  status: {
    type: String,
    enum: ['ABERTA', 'ENCERRADA'],
    default: 'ABERTA'
  },
  hash_blockchain: { type: String }, // hash de resultado, se já foi enviado para a blockchain
  eleicao_id_blockchain: { type: Number } // ID usado no contrato Ethereum
});

module.exports = mongoose.model('Eleicao', EleicaoSchema);