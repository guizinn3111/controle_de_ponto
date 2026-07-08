/* 
  DADOS: COLABORADORES, JORNADAS E APELIDOS
 */

const COLABORADORES = [
  {
    id: 1,
    nome: "ANGELA DE JESUS SILVA SOARES",
    cargo: "Auxiliar Administrativo Pleno · Comercial — Atendimento Comercial",
    apelidos: ["ANGELA","ANGELA SOARES","ANGELA JESUS"],
    tipo: "fixo",
    jornada: [{
      entrada:"07:30", saidaAlmoco:"12:30",
      voltaAlmoco:"13:30", saida:"17:15"
    }],
    rescisao: null
  },
  {
    id: 2,
    nome: "CAIO LUIZ GONÇALVES MANOEL",
    cargo: "Estagiário · Comercial — Administrativo de Automação",
    apelidos: ["CAIO","CAIO LUIZ","CAIO MANOEL"],
    tipo: "fixo",
    jornada: [{
      entrada:"09:00", saidaAlmoco:"12:30",
      voltaAlmoco:"13:00", saida:"15:30"
    }],
    rescisao:null
  },
  {
    id: 3,
    nome: "CARLOS GUILHERME BRASIL SANTOS",
    cargo: "Estagiário · Administrativo — Financeiro",
    apelidos: ["CARLOS GUILHERME","GUILHERME BRASIL"],
    tipo: "fixo",
    jornada: [{
      entrada:"07:45", saidaAlmoco:"11:45",
      voltaAlmoco: null, saida: null
    }],
    rescisao: null
  },
  {
    id: 4,
    nome: "CARMINE CAUA MONTEIRO CAPUTO",
    cargo: "Estagiário · Administrativo — Financeiro",
    apelidos: ["CARMINE","CAUA","CARMINE CAUA"],
    tipo: "fixo",
    jornada: [{
      entrada:"10:00", saidaAlmoco:"13:00",
      voltaAlmoco:"13:30", saida:"16:30"
    }]
  },
  {
    id: 5,
    nome: "DIEGO RIBEIRO DE ORNELLAS",
    cargo: "Auxiliar Administrativo Junior · Comercial — Atendimento Comercial",
    apelidos: ["DIEGO RIBEIRO","DIEGO ORNELLAS","D. ORNELLAS"],
    tipo: "fixo",
    jornada: [{
      entrada:"11:50", saidaAlmoco:"14:30",
      voltaAlmoco:"14:45", saida:"17:15"
    }]
  },
  {
    id: 6,
    nome: "DIEGO RODRIGUES CAVALCANTI",
    cargo: "Montador Óptico Sênior · Produção — Operacional Montagem",
    apelidos: ["DIEGO","DIEGO RODRIGUES","DIEGO CAVALCANTI","D. RODRIGUES"],
    tipo: "fixo",
    jornada: [{
      entrada:"07:00", saidaAlmoco:"13:00",
       voltaAlmoco:"14:00", saida:"17:00"
      }]
  },
  {
    id: 7,
    nome: "FLAVIO PINTO DA COSTA",
    cargo: "Montador Óptico Master · Produção — Operacional Montagem",
    apelidos: ["FLAVIO","FLAVIO PINTO","F. COSTA"],
    tipo: "semanal",
    jornada: [
      { dias:[1,2,3,4], entrada:"07:00", saidaAlmoco:"12:00", voltaAlmoco:"13:00", saida:"17:00" },
      { dias:[5],        entrada:"07:00", saidaAlmoco:"12:00", voltaAlmoco:"13:00", saida:"16:00" }
    ]
  },
  {
    id: 8,
    nome: "GABRIEL FERNANDES DOS SANTOS",
    cargo: "Técnico Óptico e Optometria · Produção — Operacional Surfaçagem",
    apelidos: ["GABRIEL","GABRIEL FERNANDES","GABRIEL SANTOS"],
    tipo: "semanal",
    jornada: [
      { dias:[1,2,3,4], entrada:"07:00", saidaAlmoco:"12:30", voltaAlmoco:"13:30", saida:"17:00" },
      { dias:[5],        entrada:"07:00", saidaAlmoco:"12:30", voltaAlmoco:"13:30", saida:"16:00" }
    ]
  },
  {
    id: 9,
    nome: "GUILHERME DO NASCIMENTO SOUZA DIAS",
    cargo: "Estagiário - administrativo- administrativo de automoção",
    apelidos: ["GUILHERME","GUILHERME DIAS","GUILHERME SOUZA"],
    tipo: "fixo",
    jornada: [{
      entrada:"10:00", saidaAlmoco:"13:00",
      voltaAlmoco:"13:30", saida:"16:30"
    }]
  },
  {
    id: 10,
    nome: "IGOR SILVA DE PAULA",
    cargo: "Auxiliar Administrativo Júnior",
    apelidos: ["IGOR","IGOR SILVA","IGOR PAULA"],
    tipo: "fixo",
    jornada: [{
      entrada:"07:30", saidaAlmoco:"13:00",
      voltaAlmoco:"14:00", saida:"17:15"
    }]
  },
  {
    id: 11,
    nome: "JOSE BENI GONCALVES",
    cargo: "Surfassagista Pleno · Produção — Operacional Surfaçagem",
    apelidos: ["JOSE BENI","BENI","J. BENI","JOSE BENI GONCALVES"],
    tipo: "semanal",
    jornada: [
      { dias:[1,2,3,4], entrada:"07:00", saidaAlmoco:"11:00", voltaAlmoco:"12:00", saida:"17:00" },
      { dias:[5],        entrada:"07:00", saidaAlmoco:"11:00", voltaAlmoco:"12:00", saida:"16:00" }
    ]
  },
  {
    id: 12,
    nome: "JOSE DE RIBAMAR PEREIRA DOS SANTOS",
    cargo: "Balconista · Comercial — Atendimento Comercial",
    apelidos: ["JOSE RIBAMAR","RIBAMAR","J. RIBAMAR"],
    tipo: "fixo",
    jornada: [{
      entrada:"07:30", saidaAlmoco:"13:00",
      voltaAlmoco:"14:00", saida:"17:15"
    }]
  },
  {
    id: 13,
    nome: "JOSE SERGIO MACEDO",
    cargo: "Surfassagista Master · Produção — Operacional Surfaçagem",
    apelidos: ["JOSE SERGIO","SERGIO MACEDO","J. SERGIO"],
    tipo: "semanal",
    jornada: [
      { dias:[1,2,3,4], entrada:"07:00", saidaAlmoco:"12:30", voltaAlmoco:"13:30", saida:"17:00" },
      { dias:[5],        entrada:"07:00", saidaAlmoco:"12:30", voltaAlmoco:"13:30", saida:"16:00" }
    ]
  },
  {
    id: 14,
    nome: "MARIA EDUARDA BRAGA DE CARVALHO",
    cargo: "Auxiliar Administrativo Junior · Comercial — Atendimento Comercial",
    apelidos: ["MARIA EDUARDA","EDUARDA","M. EDUARDA"],
    tipo: "fixo",
    jornada: [{
      entrada:"07:30", saidaAlmoco:"11:30",
      voltaAlmoco:"12:30", saida:"17:15"
    }]
  },
  {
    id: 15,
    nome: "PRISCILA MELHADO DE OLIVEIRA",
    cargo: "Auxiliar Administrativo Pleno · Comercial — Atendimento Comercial",
    apelidos: ["PRISCILA","PRISCILA MELHADO","P. OLIVEIRA"],
    tipo: "fixo",
    jornada: [{
      entrada:"07:30", saidaAlmoco:"12:00",
      voltaAlmoco:"13:00", saida:"17:15"
    }]
  },
  {
    id: 16,
    nome: "SERGIO DE AZEVEDO ARRUDA",
    cargo: "Surfassagista Pleno · Produção — Operacional Surfaçagem",
    apelidos: ["SERGIO", "SERGIO ARRUDA","S. ARRUDA","SERGIO AZEVEDO"],
    tipo: "semanal",
    jornada: [
      { dias:[1,2,3,4], entrada:"07:00", saidaAlmoco:"12:00", voltaAlmoco:"13:00", saida:"17:00" },
      { dias:[5],        entrada:"07:00", saidaAlmoco:"12:00", voltaAlmoco:"13:00", saida:"16:00" }
    ]
  },
  {
    id: 17,
    nome: "THAINARA GOUVEA DE JESUS FERREIRO",
    cargo: "Assistente ADM Financeiro · Administrativo — Financeiro",
    apelidos: ["THAINARA","THAINARA GOUVEA","T. FERREIRO"],
    tipo: "fixo",
    jornada: [{
      entrada:"07:30", saidaAlmoco:"11:30",
      voltaAlmoco:"12:30", saida:"17:15"
    }]
  }
];

/* ── MODAL DE JORNADA ─────────────────────── */

function abrirModalJornada(colabId) {
  if (PERFIL_ATUAL !== 'admin') {
    alert('Apenas o administrador pode editar a jornada.');
    return;
  }

  const colab = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  document.getElementById('jornadaColabId').value      = colabId;
  document.getElementById('jornadaTitulo').textContent = 'Jornada — ' + colab.nome;

  const j = colab.jornada[0];

  document.getElementById('jornadaEntrada').value    = j.entrada    || '';
  document.getElementById('jornadaSaidaAlm').value   = j.saidaAlmoco|| '';
  document.getElementById('jornadaVoltaAlm').value   = j.voltaAlmoco|| '';
  document.getElementById('jornadaSaida').value      = j.saida      || '';

  /* se for semanal, exibe a segunda linha (sex) */
  const temSex = colab.tipo === 'semanal' && colab.jornada[1];
  const blocoSex = document.getElementById('jornadaBlocoSex');
  blocoSex.style.display = temSex ? 'block' : 'none';

  if (temSex) {
    const s = colab.jornada[1];
    document.getElementById('jornadaSexEntrada').value   = s.entrada    || '';
    document.getElementById('jornadaSexSaidaAlm').value  = s.saidaAlmoco|| '';
    document.getElementById('jornadaSexVoltaAlm').value  = s.voltaAlmoco|| '';
    document.getElementById('jornadaSexSaida').value     = s.saida      || '';
  }

  document.getElementById('jornadaModal').style.display = 'flex';
  document.getElementById('jornadaEntrada').focus();
}

function salvarJornada() {
  const colabId = parseInt(document.getElementById('jornadaColabId').value, 10);
  const colab   = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  const entrada   = document.getElementById('jornadaEntrada').value.trim();
  const saidaAlm  = document.getElementById('jornadaSaidaAlm').value.trim();
  const voltaAlm  = document.getElementById('jornadaVoltaAlm').value.trim();
  const saida     = document.getElementById('jornadaSaida').value.trim();

  if (!entrada || !saida) {
    alert('Preencha pelo menos Entrada e Saída.');
    return;
  }

  if (colab.tipo === 'fixo') {
    colab.jornada = [{
      entrada:     entrada,
      saidaAlmoco: saidaAlm  || null,
      voltaAlmoco: voltaAlm  || null,
      saida:       saida
    }];
  } else {
    /* semanal: seg–qui + sex separados */
    const sexEntrada  = document.getElementById('jornadaSexEntrada').value.trim();
    const sexSaidaAlm = document.getElementById('jornadaSexSaidaAlm').value.trim();
    const sexVoltaAlm = document.getElementById('jornadaSexVoltaAlm').value.trim();
    const sexSaida    = document.getElementById('jornadaSexSaida').value.trim();

    colab.jornada = [
      {
        dias:        [1,2,3,4],
        entrada:     entrada,
        saidaAlmoco: saidaAlm  || null,
        voltaAlmoco: voltaAlm  || null,
        saida:       saida
      },
      {
        dias:        [5],
        entrada:     sexEntrada  || entrada,
        saidaAlmoco: sexSaidaAlm || saidaAlm  || null,
        voltaAlmoco: sexVoltaAlm || voltaAlm  || null,
        saida:       sexSaida    || saida
      }
    ];
  }

  saveJornadas();
  fecharModalJornada();
  renderColaboradores();
}

function fecharModalJornada() {
  document.getElementById('jornadaModal').style.display = 'none';
}

function saveJornadas() {
  const map = {};
  COLABORADORES.forEach(c => { map[c.id] = { tipo: c.tipo, jornada: c.jornada }; });
  localStorage.setItem('jornadas_nv', JSON.stringify(map));
}

function loadJornadas() {
  try {
    const map = JSON.parse(localStorage.getItem('jornadas_nv') || '{}');
    COLABORADORES.forEach(c => {
      if (map[c.id]) {
        c.tipo    = map[c.id].tipo;
        c.jornada = map[c.id].jornada;
      }
    });
  } catch(e) {}
}

/* Fecha modal ao clicar fora — adicione ao listener já existente */
window.addEventListener('click', function(e) {
  const mr = document.getElementById('rescisaoModal');
  if (mr && e.target === mr) fecharModalRescisao();

  const mf = document.getElementById('feriasModal');
  if (mf && e.target === mf) fecharModalFerias();

  const mj = document.getElementById('jornadaModal');
  if (mj && e.target === mj) fecharModalJornada();
});

loadJornadas();