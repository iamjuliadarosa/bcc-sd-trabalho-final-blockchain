//Carrega .env
require('dotenv').config();
//libs
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
//classes
const { gerarToken } = require('./utils/auth');
const Usuario = require('./models/Usuario');
const Eleicao = require('./models/Eleicao');
const Voto = require('./models/Voto');
const { verificarToken } = require('./utils/auth');
const { JsonRpcProvider, Wallet, Contract } = require('ethers');
const { registrarResultadoNaBlockchain } = require('./blockchain');
// Conexão com Ganache e carteira
const provider = new JsonRpcProvider(process.env.RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

// ABI do contrato
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

// Endereço do contrato implantado
const contratoEndereco = process.env.CONTRACT_ADDRESS;

const contrato = new Contract(contratoEndereco, abi, wallet);

async function registrarVotoNaBlockchain(eleicaoId, opcao) {
  const tx = await contrato.votar(eleicaoId, opcao);
  await tx.wait(); // aguarda confirmação
}


const packageDefinition = protoLoader.loadSync('../protos/eleicao.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const eleicoesProto = grpc.loadPackageDefinition(packageDefinition).eleicoes;

// 🚀 Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/eleicoes', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB conectado")).catch(console.error);

function withAuth(fn) {
  return async (call, callback) => {
    try {
      const token = call.request.token;
      if (!token) {
        return callback({ code: grpc.status.UNAUTHENTICATED, message: 'Token não fornecido' });
      }

      const user = verificarToken(token);
      call.user = user;
      
      await fn(call, callback);
    } catch (err) {
      return callback({ code: grpc.status.UNAUTHENTICATED, message: 'Token inválido ou expirado' });
    }
  };
}

// 🧠 Implementações dos métodos gRPC
const EleicaoService = {
  // Registrar usuário
    RegistrarUsuario: async (call, callback) => {
        const { nome, email, senha, perfil } = call.request;

        try {
        const senha_hash = await bcrypt.hash(senha, 10);
        const usuario = new Usuario({ nome, email, senha_hash, perfil });
        await usuario.save();

        callback(null, { mensagem: "Usuário registrado com sucesso!" });
        } catch (err) {
        console.error(err);
        callback({
            code: grpc.status.ALREADY_EXISTS,
            message: "Email já está em uso ou erro no registro."
        });
        }
    },
    Login: async (call, callback) => {
        const { email, senha } = call.request;

        try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
            return callback({
            code: grpc.status.UNAUTHENTICATED,
            message: "Credenciais inválidas"
            });
        }

        const token = gerarToken(usuario);
        callback(null, { token, perfil: usuario.perfil });
        } catch (err) {
        console.error(err);
        callback({
            code: grpc.status.INTERNAL,
            message: "Erro interno no login"
        });
        }
    },
    CriarEleicao: withAuth(async (call, callback) => {
        const user = call.user;
        if (user.perfil !== 'ADMIN') {
            return callback({ code: grpc.status.PERMISSION_DENIED, message: 'Apenas admins podem criar eleições.' });
        }
        try {
            const { token, titulo, descricao, inicio, fim, opcoes } = call.request;

            const eleicao = await Eleicao.create({
            titulo,
            descricao,
            inicio: new Date(inicio),
            fim: new Date(fim),
            opcoes,
            criado_por: user.id
            });

            callback(null, {
            id: eleicao._id.toString(),
            titulo: eleicao.titulo,
            status: eleicao.status,
            opcoes: eleicao.opcoes
            });
        } catch (err) {
            console.error(err);
            callback({ code: grpc.status.INTERNAL, message: 'Erro ao criar eleição' });
        }
    }),
    ListarEleicoes: withAuth(async (call, callback) => {
        const user = call.user;
        try {
            const lista = await Eleicao.find({});
            const eleicoes = lista.map(e => ({
            id: e._id.toString(),
            titulo: e.titulo,
            status: e.status,
            opcoes: e.opcoes || []
            }));
            //console.log(eleicoes);
            callback(null, { eleicoes });
        } catch (err) {
            console.error(err);
            callback({ code: grpc.status.INTERNAL, message: 'Erro ao listar eleições' });
        }
    }),
    Votar: withAuth(async (call, callback) => {
        const user = call.user;
        try {
            const { token, eleicaoId, opcao } = call.request;

            const eleicao = await Eleicao.findById(eleicaoId);
            if (!eleicao || eleicao.status !== 'ABERTA') {
            return callback({ code: grpc.status.FAILED_PRECONDITION, message: 'Eleição não está aberta ou não existe' });
            }

            const votoExistente = await Voto.findOne({ usuario_id: user.id, eleicao_id: eleicaoId });
            if (votoExistente) {
            return callback({ code: grpc.status.ALREADY_EXISTS, message: 'Usuário já votou nessa eleição' });
            }
            // Gerar eleicaoIdBlockchain se ainda não existir
            let eleicaoIdBlockchain = eleicao.eleicao_id_blockchain;
            if (!eleicaoIdBlockchain) {
              eleicaoIdBlockchain = Math.floor(Date.now() / 1000); // Exemplo: timestamp como ID
              eleicao.eleicao_id_blockchain = eleicaoIdBlockchain;
              await eleicao.save();
            }
            await registrarVotoNaBlockchain(eleicaoIdBlockchain, opcao);

            await Voto.create({ usuario_id: user.id, eleicao_id: eleicaoId });

            callback(null, { mensagem: 'Voto registrado com sucesso' });
        } catch (err) {
            console.error(err);
            callback({ code: grpc.status.INTERNAL, message: 'Erro ao votar' });
        }
    }),
    Resultado: withAuth(async (call, callback) => {
        const user = call.user;
        if (user.perfil !== 'ADMIN') {
            return callback({ code: grpc.status.PERMISSION_DENIED, message: 'Apenas admins podem ver resultados' });
        }
        try {
          const { token, eleicaoId } = call.request;
          const eleicao = await Eleicao.findById(eleicaoId);
          if (!eleicao) {
          return callback({ code: grpc.status.NOT_FOUND, message: 'Eleição não encontrada' });
          }

          const opcoes = eleicao.opcoes;
          const eleicaoIdBlockchain = eleicao.eleicao_id_blockchain;

          // 1. Chamar o contrato para obter os votos
          const resultados = await contrato.consultarResultado(eleicaoIdBlockchain, opcoes);

          // 2. Montar o objeto { "A": 1, "B": 2, ... }
          const contagem = {};
          for (let i = 0; i < opcoes.length; i++) {
            contagem[opcoes[i]] = parseInt(resultados[i]);
          }

          // 3. Calcular o hash e salvar no Mongo
          const hashSimulado = require('crypto')
            .createHash('sha256')
            .update(JSON.stringify(contagem))
            .digest('hex');

          eleicao.hash_blockchain = hashSimulado;
          await eleicao.save();

          callback(null, {
            votos: contagem,
            hashBlockchain: hashSimulado
          });

        } catch (err) {
            console.error(err);
            callback({ code: grpc.status.INTERNAL, message: 'Erro ao apurar resultado' });
        }
    })
};

// 🏁 Inicializar o servidor gRPC
function main() {
  const server = new grpc.Server();
  server.addService(eleicoesProto.EleicaoService.service, EleicaoService);
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log("🛰️ Servidor gRPC rodando em localhost:50051");
    server.start();
  });
}

main();