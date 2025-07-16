
# Sistema de Eleições Distribuídas com Blockchain

Este projeto implementa um sistema de eleições digitais distribuídas, que combina um backend gRPC em Node.js, um frontend web simples, um banco de dados MongoDB e registro dos resultados na blockchain Ethereum para garantir integridade e auditabilidade.

## Funcionalidades Principais

- **Cadastro e login** de usuários com perfis **ADMIN** e **ELEITOR**.
- **Admin:**
  - Criar eleições com título, descrição, período e opções de voto.
  - Visualizar eleições abertas e encerradas.
  - Fechar eleições.
  - Consultar resultados oficiais registrados na blockchain.
- **Eleitor:**
  - Listar eleições abertas.
  - Votar em uma das opções disponíveis.
- Registro de votos e resultados no banco MongoDB.
- Registro de hash dos resultados finais na blockchain Ethereum para garantir integridade.
- Proteção do backend com autenticação JWT.
- Comunicação entre frontend e backend via REST e gRPC.

## Tecnologias Utilizadas

- Node.js
- Express (API REST para frontend)
- gRPC com protobuf para comunicação backend
- MongoDB para persistência dos dados
- Ethereum (Ganache para desenvolvimento local)
- Ethers.js para interação com blockchain
- JWT para autenticação
- HTML/CSS/JavaScript para frontend básico

## Estrutura do Projeto

```
├── client/
│ ├── public/ # Arquivos públicos para o frontend
│ │ ├── js/
│ │ │ ├── dashboard.js # Lógica JS do painel do usuário/admin
│ │ │ └── login.js # Lógica JS para autenticação (login)
│ │ ├── dashboard.html # Página HTML para dashboard
│ │ └── login.html # Página HTML de login
│ └── server.js # Servidor Express que serve frontend e intermedia chamadas gRPC
│
├── protos/
│ └── eleicao.proto # Definição da API gRPC (contrato de comunicação)
│
├── src/
│ ├── contracts/
│ │ └── EleicaoRegistry.sol # Smart contract em Solidity para registro de resultados
│ │
│ ├── models/
│ │ ├── Eleicao.js # Modelo Mongoose da eleição
│ │ ├── Usuario.js # Modelo Mongoose do usuário
│ │ └── Voto.js # Modelo Mongoose do voto
│ │
│ ├── utils/
│ │ └── auth.js # Funções de geração e verificação de token JWT
│ │
│ ├── blockchain.js # Funções auxiliares para interagir com o contrato Ethereum
│ ├── cliente.js # Cliente de testes para chamadas gRPC
│ ├── deploy.js # Script de deploy do contrato Ethereum
│ └── server.js # Servidor gRPC principal
│
├── LICENSE # Licença do projeto (MIT)
└── README.md # Este documento
```

## Pré-requisitos

- Node.js v18+ instalado
- MongoDB rodando localmente (`mongodb://localhost:27017/eleicoes`)
- Ganache ou outra rede Ethereum local para testes
- `npm` para instalar dependências

## Como rodar o projeto

1. Clone o repositório:  
  `git clone <url-do-repo>`  
  `cd bcc-sd-trabalho-final-blockchain`

2. Instale as dependências:  
  `npm install`

3. Configure as variáveis de ambiente no arquivo `.env`:  
```
RPC_URL=http://localhost:7545  
PRIVATE_KEY=<sua-chave-privada-ganche>  
CONTRACT_ADDRESS=<endereco-do-contrato-ethereum>  
JWT_SECRET=<segredo-para-jwt>
```

4. Inicie o MongoDB localmente.

5. Compile e faça deploy do contrato Ethereum localmente (usando Hardhat ou Truffle ou src/deploy.js).

6. Inicie o servidor gRPC e API REST:  
  `node src/server.js`

7. Inicie o servidor do cliente web (se for separado):  
  `node src/client/server.js`

8. Acesse o frontend:  
  http://localhost:3000/login.html


## Como usar

- Faça login com usuário ADMIN ou ELEITOR.
- Admin pode criar eleições e fechar eleições.
- Eleitor pode visualizar eleições e votar.
- Resultados são registrados na blockchain para auditoria.

## Importante

- Votos individuais são armazenados apenas no banco MongoDB para preservar sigilo.
- O hash dos resultados finais é registrado na blockchain para garantir imutabilidade e transparência.
- Proteção das rotas via token JWT para evitar acesso não autorizado.

## Próximos passos / melhorias

- Implementar interface mais completa para administração.
- Melhorar feedbacks e mensagens na UI.
- Implementar auditoria e verificação dos dados diretamente na blockchain.
- Suporte para múltiplos tipos de eleição e votações complexas.
- Deploy em ambiente real.


## Contato

Julia da Rosa – julia.rosa.ifc.riodosul@gmail.com

BCC Sistemas Distribuídos – 2025


## Licença

MIT License