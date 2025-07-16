document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const perfil = localStorage.getItem('perfil');

  if (!token || !perfil) {
    window.location.href = '/login.html';
    return;
  }

  // Exibir painel adequado
  if (perfil === 'ADMIN') {
    document.getElementById('admin-panel').style.display = 'block';
  } else {
    document.getElementById('eleitor-panel').style.display = 'block';
  }

  // Carregar eleições
  carregarEleicoes();

  // Logout
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('perfil');
    window.location.href = '/login.html';
  });

  // Formulário de criação de eleição
  /*
  const form = document.getElementById('form-criar-eleicao');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titulo = form.titulo.value;
      const descricao = form.descricao.value;
      const inicio = form.inicio.value;
      const fim = form.fim.value;

      try {
        const res = await fetch('/eleicoes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token, titulo, descricao, inicio, fim })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        alert('Eleição criada!');
        form.reset();
        carregarEleicoes();
      } catch (err) {
        alert('Erro: ' + err.message);
      }
    });
  }
    */
});
document.addEventListener('DOMContentLoaded', () => {
  const perfil = localStorage.getItem('perfil');

  if (perfil === 'ADMIN') {
    document.getElementById('criar-eleicao-form').style.display = 'block';
  } else {
    document.getElementById('criar-eleicao-form').style.display = 'none';
  }

  carregarEleicoes();
});

// Buscar eleições e exibir
async function carregarEleicoes() {
  const token = localStorage.getItem('token');
  const perfil = localStorage.getItem('perfil');
  
  try {
    const res = await fetch('/eleicoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const eleicoes = await res.json();
    console.log('📊 Eleições recebidas:', eleicoes);

    const container = document.getElementById('lista-eleicoes');
    container.innerHTML = '';

    eleicoes.forEach(e => {
      const div = document.createElement('div');
      div.className = 'eleicao';
      div.innerHTML = `
        <strong>${e.titulo}</strong> — Status: ${e.status}
        ${perfil === 'ADMIN' ? `
          <button onclick="verResultado('${e.id}')">Ver Resultado</button>
        ` : `
          <form onsubmit="enviarVoto(event, '${e.id}')">
            ${e.opcoes.map(op => `
              <label>
                <input type="radio" name="opcao-${e.id}" value="${op}">
                ${op}
              </label>
            `).join('')}
            <button type="submit">Votar</button>
          </form>
        `}

      `;
      container.appendChild(div);
    });
  } catch (err) {
    alert('Erro ao carregar eleições: ' + err.message);
  }
}
async function enviarVoto(event, eleicaoId) {
  event.preventDefault();
  const token = localStorage.getItem('token');
  const input = document.querySelector(`input[name="opcao-${eleicaoId}"]:checked`);
  if (!input) return alert('Selecione uma opção para votar.');

  const opcao = input.value;

  try {
    const res = await fetch('/votar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, eleicaoId, opcao })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert(data.mensagem || 'Voto computado com sucesso!');
  } catch (err) {
    alert('Erro ao votar: ' + err.message);
  }
}
async function votar(eleicaoId) {
  const token = localStorage.getItem('token');
  const opcao = prompt("Digite sua opção de voto (Ex: Opção A)");

  if (!opcao) return;

  try {
    const res = await fetch('/votar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, eleicaoId, opcao })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert(data.mensagem || 'Voto registrado!');
  } catch (err) {
    alert('Erro: ' + err.message);
  }
}

async function verResultado(eleicaoId) {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`/resultado`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, eleicaoId })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert(`Resultado:\n${JSON.stringify(data.votos, null, 2)}\nHash: ${data.hashBlockchain}`);
  } catch (err) {
    alert('Erro: ' + err.message);
  }
}
let contadorOpcoes = 1;

function adicionarOpcao() {
  contadorOpcoes++;
  const container = document.getElementById('opcoes-container');
  const label = document.createElement('label');
  label.innerHTML = `Opção ${contadorOpcoes}: <input type="text" name="opcoes[]" required><br>`;
  container.appendChild(label);
}

document.getElementById('form-nova-eleicao').addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  const titulo = e.target.titulo.value;
  const descricao = e.target.descricao.value;
  const inicio = new Date(e.target.inicio.value).toISOString();
  const fim = new Date(e.target.fim.value).toISOString();

  const opcoes = [...e.target.querySelectorAll('input[name="opcoes[]"]')]
    .map(input => input.value.trim())
    .filter(v => v.length > 0);

  if (opcoes.length < 2) {
    alert('Adicione pelo menos 2 opções');
    return;
  }

  try {
    const res = await fetch('/criar-eleicao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, titulo, descricao, inicio, fim, opcoes })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao criar eleição');

    alert('Eleição criada com sucesso!');
    carregarEleicoes(); // recarrega a lista
    e.target.reset();
    contadorOpcoes = 1;
    document.getElementById('opcoes-container').innerHTML =
      `<label>Opção 1: <input type="text" name="opcoes[]" required></label><br>`;
  } catch (err) {
    alert('Erro: ' + err.message);
  }
});
