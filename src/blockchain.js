require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const Eleicao = require('./models/Eleicao');

const abi = [
  "function registrarResultado(uint256 eleicaoId, string memory hashResultado) public",
  "function consultarRegistro(uint256 eleicaoId) public view returns (string memory, uint256)"
];

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contrato = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// Função que envia resultado para o contrato
async function registrarResultadoNaBlockchain(eleicaoId, hashResultado) {
  const tx = await contrato.registrarResultado(eleicaoId, hashResultado);
  await tx.wait(); // aguarda a confirmação do bloco
  console.log("✅ Registro na blockchain confirmado.");
}

module.exports = {
  registrarResultadoNaBlockchain
};