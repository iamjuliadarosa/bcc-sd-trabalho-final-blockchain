document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Se já está logado, redireciona para o dashboard
    window.location.href = '/dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const senha = form.senha.value;

    try {
      const res = await fetch('/login', {  // Ajuste para endpoint correto do backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro no login');

      localStorage.setItem('token', data.token);
      localStorage.setItem('perfil', data.perfil);
      window.location.href = '/dashboard.html';

    } catch (err) {
      document.getElementById('mensagem').textContent = err.message;
    }
  });
});