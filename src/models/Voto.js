const mongoose = require('mongoose');

const VotoSchema = new mongoose.Schema({
  usuario_id: String,
  eleicao_id: String,
  opcao: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Voto', VotoSchema);