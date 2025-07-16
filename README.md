# 🗳️ Projeto Final - Sistemas Distribuídos com Blockchain  
## Tema: Sistema de Eleições com gRPC, MongoDB e Hyperledger



### Estrutura do Projeto

```
.
├── protos/                # Arquivo eleicao.proto
├── src/
│   ├── grpc/              # Implementação dos serviços gRPC
│   ├── blockchain/        # Interação com Hyperledger
│   ├── controllers/       # Lógica de negócio (ex: votar, login)
│   ├── models/            # Esquemas Mongoose para MongoDB
│   ├── middleware/        # JWT auth, validações
│   └── utils/             # Hash, logging, etc.
├── docker-compose.yml
├── .env
└── index.js               # Inicialização do servidor gRPC

```
### Ambiente

Desenvolvido no Windows 11

Instalado via MSI:
- Ganache (https://archive.trufflesuite.com/ganache/)
- MongoDB (https://www.mongodb.com/try/download/community)

#### gRPC
``` bash
npm install @grpc/grpc-js @grpc/proto-loader
```

#### MongoDB
``` bash
npm install mongoose
```

#### Blockchain
``` bash
npm install fabric-network
```

#### JWT
``` bash
npm install jsonwebtoken bcrypt
```



``` bash
grpcurl -plaintext \
  -proto protos/eleicao.proto \
  -d "{ \"nome\": \"Julia\", \"email\": \"julia@example.com\", \"senha\": \"1234\", \"perfil\": \"ELEITOR\" }" \
  localhost:50051 eleicoes.EleicaoService/RegistrarUsuario
```



### Referências

https://archive.trufflesuite.com/docs/
