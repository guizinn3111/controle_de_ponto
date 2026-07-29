# Sistema de Controle de Ponto — Nova Varonil

Sistema web de controle de ponto eletrônico desenvolvido para a Nova
Varonil, laboratório óptico no Rio de Janeiro em atividade desde 1964.
Permite que múltiplos colaboradores registrem entrada/saída de
dispositivos diferentes, com relatórios mensais, histórico por
colaborador, abonos de falta/atraso, lançamento de horas extras,
controle de férias e rescisões — tudo com permissões diferentes para
administrador e usuário comum.

Projeto migrado de uma versão inicial baseada em `localStorage`
(presa a um único navegador) para uma arquitetura cliente-servidor com
banco de dados relacional, permitindo uso simultâneo por vários
funcionários em dispositivos diferentes.

## ✨ Funcionalidades

- **Relatório mensal** por colaborador, com cálculo automático de
  horas trabalhadas, saldo (extra/falta) e impressão individual em
  folha de ponto
- **Importação em lote** das batidas exportadas do relógio de ponto,
  com reconhecimento automático de colaborador por nome ou apelido, e
  merge inteligente ao reimportar um dia já existente
- **Histórico** por colaborador, agrupado por ano/mês
- **Abono de faltas e atrasos**, com motivo obrigatório
- **Lançamento de horas extras**, com motivo
- **Cadastro de colaboradores**, jornada de trabalho (fixa ou
  semanal), cargo, férias e rescisão
- **Gerenciamento de usuários** (criar, trocar senha, excluir), com
  dois níveis de permissão: administrador e usuário comum
- **Exportação em CSV** do relatório mensal

## 🛠️ Tecnologias

- **Front-end:** HTML, CSS e JavaScript puro (sem frameworks)
- **Back-end:** PHP (API própria, sem framework) com PDO
- **Banco de dados:** MySQL / MariaDB
- **Autenticação:** sessão PHP + senhas com hash bcrypt

## 📁 Estrutura do projeto

```
├── index.html              # tela principal do sistema
├── usuarios.html            # gerenciamento de usuários (admin)
├── css/                     # estilos
├── js/                      # front-end (consome a API em php/)
│   └── api.js                # helper único de comunicação com o backend
├── php/                     # API REST em PHP
│   ├── config.example.php    # modelo de configuração do banco
│   ├── login.php / logout.php
│   ├── colaboradores.php e colaborador_*.php
│   ├── registros.php         # batidas de ponto
│   ├── abonos.php
│   ├── horas_extras.php
│   └── usuarios.php
└── sql/
    └── schema.sql            # cria as tabelas e já cadastra os colaboradores
```

## 🚀 Como rodar

### 1. Banco de dados
Crie um banco MySQL/MariaDB vazio e importe `sql/schema.sql` (por
`phpMyAdmin` ou linha de comando). Isso cria todas as tabelas e já
cadastra os colaboradores iniciais.

### 2. Configuração
Copie `php/config.example.php` para `php/config.php` e preencha com os
dados reais de conexão:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'seu_banco');
define('DB_USER', 'seu_usuario');
define('DB_PASS', 'sua_senha');
```

> `php/config.php` está no `.gitignore` — nunca é versionado com
> credenciais reais.

### 3. Servidor
Qualquer servidor com PHP 8+ e extensão PDO MySQL funciona. Para testar
localmente:

```bash
php -S localhost:8000
```

Depois acesse `http://localhost:8000`.

Em produção, basta subir todo o conteúdo (exceto a pasta `sql/`, que
só é usada na etapa 1) para a pasta pública do servidor.

## 🔐 Usuários padrão

O `schema.sql` já cria dois usuários:

| Usuário    | Senha           | Permissão     |
|------------|-----------------|---------------|
| admin      | 123             | Administrador |
| financeiro | financeiro2025  | Usuário comum |

**Troque essas senhas assim que possível** — pela tela
`usuarios.html` (logado como admin) ou direto no banco.

## 📄 Licença

Projeto de uso interno da Nova Varonil.
