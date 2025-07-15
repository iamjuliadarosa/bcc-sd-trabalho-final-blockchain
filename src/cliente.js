const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/../protos/eleicao.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const eleicoesProto = grpc.loadPackageDefinition(packageDefinition).eleicoes;

const client = new eleicoesProto.EleicaoService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Registrar usuário
function registrarUsuario(nome, email, senha, perfil) {
  return new Promise((resolve, reject) => {
    client.RegistrarUsuario({ nome, email, senha, perfil }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

// Login
function login(email, senha) {
  return new Promise((resolve, reject) => {
    client.Login({ email, senha }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

// Criar eleição (admin)
function criarEleicao(token, titulo, descricao, inicio, fim) {
  return new Promise((resolve, reject) => {
    client.CriarEleicao(
      { token, titulo, descricao, inicio, fim },
      (err, response) => {
        if (err) return reject(err);
        resolve(response);
      }
    );
  });
}

// Listar eleições
function listarEleicoes() {
  return new Promise((resolve, reject) => {
    client.ListarEleicoes({}, (err, response) => {
      if (err) return reject(err);
      resolve(response.eleicoes);
    });
  });
}

// Votar
function votar(token, eleicaoId, opcao) {
  return new Promise((resolve, reject) => {
    client.Votar({ token, eleicaoId, opcao }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

// Resultado (admin)
function resultado(token, eleicaoId) {
  return new Promise((resolve, reject) => {
    client.Resultado({ token, eleicaoId }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

// Exemplo de fluxo de uso
async function main() {
  try {
    // Registrar dois usuários: admin e eleitor
    //console.log('Registrando admin...');
    //await registrarUsuario('Admin User', 'admin@example.com', 'admin123', 'ADMIN');
    //console.log('Registrando eleitor...');
    //await registrarUsuario('Eleitor User', 'eleitor@example.com', 'eleitor123', 'ELEITOR');

    // Login admin
    console.log('Fazendo login admin...');
    const adminLogin = await login('admin@example.com', 'admin123');
    console.log('Admin token:', adminLogin.token);

    // Login eleitor
    console.log('Fazendo login eleitor...');
    const eleitorLogin = await login('eleitor@example.com', 'eleitor123');
    console.log('Eleitor token:', eleitorLogin.token);

    // Criar uma eleição (com token admin)
    console.log('Criando eleição...');
    const inicio = new Date(Date.now() + 1000 * 60).toISOString(); // começa em 1 minuto
    const fim = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // termina em 1 hora
    const eleicaoCriada = await criarEleicao(
      adminLogin.token,
      'Eleição 2025',
      'Descrição da eleição teste',
      inicio,
      fim
    );
    console.log('Eleição criada:', eleicaoCriada);

    // Listar eleições
    console.log('Listando eleições...');
    const eleicoes = await listarEleicoes();
    console.log('Eleições:', eleicoes);

    // Votar na eleição criada (com token eleitor)
    console.log('Votando...');
    const votoResp = await votar(eleitorLogin.token, eleicaoCriada.id, 'Opção A');
    console.log('Resposta voto:', votoResp);

    // Pegar resultado (com token admin)
    console.log('Buscando resultado...');
    const resultadoEleicao = await resultado(adminLogin.token, eleicaoCriada.id);
    console.log('Resultado:', resultadoEleicao);

  } catch (error) {
    console.error('Erro:', error.message || error);
  }
}

main();