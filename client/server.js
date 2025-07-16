const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const packageDef = protoLoader.loadSync('../protos/eleicao.proto');
const proto = grpc.loadPackageDefinition(packageDef).eleicoes;
const client = new proto.EleicaoService('localhost:50051', grpc.credentials.createInsecure());

app.get('/', (req, res) => {
  res.redirect('/login.html');
});
app.post('/login', (req, res) => {
  client.Login(req.body, (err, response) => {
    if (err) return res.status(401).json({ message: err.message });
    res.json(response);
  });
});

app.post('/criar-eleicao', (req, res) => {
  const { token, titulo, descricao, inicio, fim, opcoes } = req.body;

  client.CriarEleicao({ token, titulo, descricao, inicio, fim, opcoes }, (err, resposta) => {
    if (err) {
      console.error('Erro ao criar eleição (gRPC):', err);
      return res.status(500).json({ message: 'Erro ao criar eleição' });
    }
    res.json(resposta);
  });
});

app.post('/eleicoes', (req, res) => {
  try {
    client.ListarEleicoes(req.body, (err, resposta) => {
      if (err) {
        console.error('Erro no gRPC:', err);
        return res.status(500).json({ error: 'Erro ao buscar eleições' });
      }
      
        //console.log("Resposta do gRPC:");
        //console.log(JSON.stringify(resposta.eleicoes, null, 2));

      res.json(resposta.eleicoes);
    });
  } catch (err) {
    console.error('Erro geral:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});


app.post('/votar', (req, res) => {
  client.Votar(req.body, (err, response) => {
    if (err) return res.status(400).json({ message: err.message });
    res.json(response);
  });
});

app.post('/resultado', (req, res) => {
  client.Resultado({ token: req.body.token, eleicaoId: req.body.eleicaoId }, (err, resposta) => {
    if (err) {
      console.error('Erro no gRPC:', err);
      return res.status(500).json({ error: 'Erro ao buscar resultado' });
    }
    console.log('Resultado retornado:', resposta);
    res.json(resposta);
  });
});

app.listen(3000, () => console.log('🌐 Cliente web em http://localhost:3000'));