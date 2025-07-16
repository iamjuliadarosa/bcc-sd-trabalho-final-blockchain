const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_superseguro';

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario._id, perfil: usuario.perfil },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function verificarToken(token) {
  if (!token) throw new Error("Token ausente");
  //console.log('Recebido token:', token);
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { gerarToken, verificarToken };
