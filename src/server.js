const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { gerarToken } = require('./utils/auth');
const Usuario = require('./models/Usuario');
const Eleicao = require('./models/Eleicao');
const Voto = require('./models/Voto');
const { verificarToken } = require('./utils/auth');

const packageDefinition = protoLoader.loadSync('protos/eleicao.proto', {
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
    CriarEleicao: async (call, callback) => {
        try {
            const { token, titulo, descricao, inicio, fim } = call.request;
            const user = verificarToken(token);
            if (user.perfil !== 'ADMIN') {
            return callback({ code: grpc.status.PERMISSION_DENIED, message: 'Apenas admins podem criar eleições.' });
            }

            const eleicao = await Eleicao.create({
            titulo,
            descricao,
            inicio: new Date(inicio),
            fim: new Date(fim),
            criado_por: user.id
            });

            callback(null, {
            id: eleicao._id.toString(),
            titulo: eleicao.titulo,
            status: eleicao.status
            });
        } catch (err) {
            console.error(err);
            callback({ code: grpc.status.INTERNAL, message: 'Erro ao criar eleição' });
        }
    },
    ListarEleicoes: async (call, callback) => {
        try {
            const lista = await Eleicao.find({});
            const eleicoes = lista.map(e => ({
            id: e._id.toString(),
            titulo: e.titulo,
            status: e.status
            }));
            callback(null, { eleicoes });
        } catch (err) {
            console.error(err);
            callback({ code: grpc.status.INTERNAL, message: 'Erro ao listar eleições' });
        }
    },
    Votar: async (call, callback) => {
        try {
            const { token, eleicaoId, opcao } = call.request;
            const user = verificarToken(token);

            const eleicao = await Eleicao.findById(eleicaoId);
            if (!eleicao || eleicao.status !== 'ABERTA') {
            return callback({ code: grpc.status.FAILED_PRECONDITION, message: 'Eleição não está aberta ou não existe' });
            }

            const votoExistente = await Voto.findOne({ usuario_id: user.id, eleicao_id: eleicaoId });
            if (votoExistente) {
            return callback({ code: grpc.status.ALREADY_EXISTS, message: 'Usuário já votou nessa eleição' });
            }

            await Voto.create({ usuario_id: user.id, eleicao_id: eleicaoId, opcao });

            callback(null, { mensagem: 'Voto registrado com sucesso' });
        } catch (err) {
            console.error(err);
            callback({ code: grpc.status.INTERNAL, message: 'Erro ao votar' });
        }
    },
    Resultado: async (call, callback) => {
        try {
            const { token, eleicaoId } = call.request;
            const user = verificarToken(token);
            if (user.perfil !== 'ADMIN') {
            return callback({ code: grpc.status.PERMISSION_DENIED, message: 'Apenas admins podem ver resultados' });
            }

            const eleicao = await Eleicao.findById(eleicaoId);
            if (!eleicao) {
            return callback({ code: grpc.status.NOT_FOUND, message: 'Eleição não encontrada' });
            }

            const votos = await Voto.find({ eleicao_id: eleicaoId });

            const contagem = {};
            for (const voto of votos) {
            contagem[voto.opcao] = (contagem[voto.opcao] || 0) + 1;
            }

            // Simulação de hash para futura integração com blockchain
            const hashSimulado = require('crypto')
            .createHash('sha256')
            .update(JSON.stringify(contagem))
            .digest('hex');

            // Registrar hash na eleição (para simular integração futura)
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
    }
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