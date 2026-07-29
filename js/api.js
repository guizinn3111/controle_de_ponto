/*
  API.JS — helper único para conversar com o backend PHP.
  Todas as chamadas passam por aqui.
*/

const API_BASE = 'php'; // pasta onde estão os arquivos .php no servidor

async function apiRequest(caminho, opcoes = {}) {
  const resp = await fetch(`${API_BASE}/${caminho}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...opcoes
  });

  let dados = null;
  try { dados = await resp.json(); } catch (e) { /* resposta vazia */ }

  if (!resp.ok) {
    const msg = (dados && dados.erro) ? dados.erro : 'Erro na comunicação com o servidor.';
    throw new Error(msg);
  }

  return dados;
}
