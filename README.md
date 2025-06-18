# 🗳️ Projeto Final - Sistemas Distribuídos com Blockchain  
## Tema: Sistema de Eleições com gRPC, MongoDB e Hyperledger

---

## ✅ Escopo Geral

### 🧱 1. MongoDB - Modelagem e Persistência (Banco Distribuído)

#### 📁 Estrutura e Conexão
- [ ] Configurar cluster MongoDB com replicação (ou Mongo Atlas)
- [ ] Criar conexão MongoDB no servidor Python
- [ ] Testar tolerância a falhas e balanceamento com replicação/sharding

#### 🧾 Modelos e Operações CRUD
- [ ] Definir modelos com Pydantic (Usuário, Eleição, Voto)
- [ ] Implementar criação de usuário
- [ ] Implementar login com hash da senha (bcrypt)
- [ ] Implementar criação de eleição
- [ ] Implementar listagem de eleições (status, datas)
- [ ] Implementar votação
- [ ] Implementar apuração de votos
- [ ] Implementar armazenamento de hash da blockchain em eleição

---

### 🛰️ 2. gRPC - API para Comunicação Distribuída

#### 🧪 Definições e Geração
- [ ] Definir arquivo `.proto` com mensagens e serviços
- [ ] Gerar código Python com `grpc_tools`
- [ ] Documentar contrato de API `.proto`

#### ⚙️ Implementação de Serviços
- [ ] Servidor gRPC base funcionando (`server.py`)
- [ ] Implementar `RegistrarUsuario`
- [ ] Implementar `Login` com JWT
- [ ] Middleware para verificar token no metadata
- [ ] Implementar `CriarEleicao`
- [ ] Implementar `ListarEleicoes`
- [ ] Implementar `Votar`
- [ ] Implementar `Resultado` com contagem e verificação na blockchain

---

### 🔗 3. Blockchain - Registro Público e Imutável

#### 🌐 Escolha e Setup
- [x] Escolher blockchain (Hyperledger Fabric)
- [ ] Instalar e configurar ambiente Hyperledger (usando Docker)
- [ ] Criar uma rede mínima (peer, orderer, CA)

#### 🧠 Chaincode
- [ ] Especificar dados a registrar (ID da eleição, timestamp, hash dos votos)
- [ ] Desenvolver chaincode (smart contract) para registrar apuração
- [ ] Testar deploy do chaincode com `peer chaincode invoke`
- [ ] Expor serviço para registrar hash da eleição na blockchain via gRPC

#### 🔍 Verificação
- [ ] Adicionar consulta à blockchain para recuperar registros
- [ ] Verificação de integridade entre MongoDB e Blockchain

---

### 💻 4. Interface Web - Interação com o Sistema

#### 🖥️ Front-end
- [ ] Criar tela de login e cadastro
- [ ] Tela de dashboard com eleições abertas
- [ ] Tela de votação com opções
- [ ] Tela de criação de eleição (admin)
- [ ] Tela de resultados (admin)

#### 🌉 Integração com gRPC
- [ ] Configurar cliente gRPC no front-end (via gateway ou proxy REST)
  - Alternativa: back-end expõe REST como façade para o gRPC
- [ ] Testar comunicação com servidor gRPC (login, votos, etc.)

---

### 📦 5. Infraestrutura e Execução

- [ ] Criar `docker-compose.yml` para orquestrar MongoDB, servidor gRPC, interface e Hyperledger
- [ ] Implementar logs e rastreamento distribuído básico
- [ ] Testes de falha em replicação do Mongo
- [ ] Testes de concorrência na votação
- [ ] Teste completo: usuário → voto → registro na blockchain

---

## 📋 Tarefas por Prioridade

### 🔹 Fase 1: Funcionalidade básica local
- [ ] Modelagem
- [ ] gRPC `.proto`
- [ ] Registro/login de usuários
- [ ] Criação e listagem de eleições
- [ ] Votação

### 🔹 Fase 2: Distribuição
- [ ] Mongo replicado ou shard
- [ ] Blockchain local com Hyperledger
- [ ] Registro de apuração na blockchain

### 🔹 Fase 3: Interface e apresentação
- [ ] Front-end
- [ ] Integração completa
- [ ] Testes e vídeo/demo
