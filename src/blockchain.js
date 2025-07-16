const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const abi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eleicaoId",
				"type": "uint256"
			},
			{
				"internalType": "string[]",
				"name": "opcoes",
				"type": "string[]"
			}
		],
		"name": "consultarResultado",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eleicaoId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "opcao",
				"type": "string"
			}
		],
		"name": "votar",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "votosPorOpcao",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const contrato = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

async function registrarVotoNaBlockchain(eleicaoId, opcao) {
  const tx = await contrato.registrarVoto(eleicaoId, opcao);
  await tx.wait(); // aguarda confirmação
}

module.exports = { registrarVotoNaBlockchain };