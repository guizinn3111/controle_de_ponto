/* 
  BANCO DE DADOS LOCAL (localStorage)
 */

// Chave usada no localStorage
const DB_KEY = 'nv_registros';

// Carrega todos os registros
function dbGet() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
  } catch {
    return [];
  }
}

// Salva todos os registros
function dbSet(registros) {
  localStorage.setItem(DB_KEY, JSON.stringify(registros));
}

// Array em memória (fonte de verdade durante a sessão)
let REGISTROS = dbGet();

// Persiste e atualiza o header
function saveRegistros() {
  dbSet(REGISTROS);
  updateHeaderStats();
}

// Atualiza contador no header
function updateHeaderStats() {
  const el = document.getElementById('headerStats');
  if (el) el.textContent = `${REGISTROS.length} registros · 17 colaboradores`;
}