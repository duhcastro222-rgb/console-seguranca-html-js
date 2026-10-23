/* Ativos & Vulnerabilidades — dataset simulado (quasecpBD).
   Ativos = MySQL (sql/criar_tabela_ativos.sql), vulns = MongoDB (vulnerabilidades.json).
   Quarentena: ativos com vuln aberta e score > 9.0 viram status_patch = critico. */
(function () {
  "use strict";

  var ATIVOS = [
    { nome: "srv-web-01",             tipo: "servidor",         setor: "TI",               ip: "10.0.10.11", patch: "pendente" },
    { nome: "srv-banco-dados-01",     tipo: "servidor",         setor: "TI",               ip: "10.0.10.12", patch: "em_dia" },
    { nome: "srv-arquivos-02",        tipo: "servidor",         setor: "TI",               ip: "10.0.10.13", patch: "em_dia" },
    { nome: "portal-clientes",        tipo: "servidor",         setor: "Comercial",        ip: "10.0.10.20", patch: "em_dia" },
    { nome: "notebook-financeiro-07", tipo: "estacao",          setor: "Financeiro",       ip: "10.0.20.7",  patch: "pendente" },
    { nome: "notebook-diretoria-01",  tipo: "estacao",          setor: "Diretoria",        ip: "10.0.20.1",  patch: "pendente" },
    { nome: "estacao_rh_04",          tipo: "estacao",          setor: "Recursos Humanos", ip: "10.0.20.44", patch: "em_dia" },
    { nome: "switch-core-02",         tipo: "dispositivo_rede", setor: "Infraestrutura",   ip: "10.0.0.2",   patch: "pendente" },
    { nome: "firewall-perimetro-01",  tipo: "dispositivo_rede", setor: "Infraestrutura",   ip: "10.0.0.1",   patch: "pendente" },
    { nome: "vpn-gateway-01",         tipo: "dispositivo_rede", setor: "Infraestrutura",   ip: "10.0.0.3",   patch: "pendente" }
  ];

  var VULNS = [
    { cve: "CVE-2024-3094",  ativo: "srv-web-01",             severidade: "critica", score: 9.8, status: "aberta",      desc: "Backdoor em biblioteca de compressão (liblzma) via pacote comprometido" },
    { cve: "CVE-2023-44487", ativo: "srv-web-01",             severidade: "alta",    score: 7.5, status: "em_correcao", desc: "HTTP/2 Rapid Reset — negação de serviço via multiplexação de streams" },
    { cve: null,             ativo: "portal-clientes",        severidade: "alta",    score: 8.2, status: "corrigida",   desc: "Injeção SQL no parâmetro de busca do endpoint de pedidos" },
    { cve: "CVE-2024-21762", ativo: "firewall-perimetro-01",  severidade: "critica", score: 9.6, status: "aberta",      desc: "Execução remota de código no FortiOS via requisição maliciosa" },
    { cve: null,             ativo: "switch-core-02",         severidade: "critica", score: 9.1, status: "aberta",      desc: "Credencial padrão de fábrica ativa no acesso administrativo" },
    { cve: "CVE-2024-1709",  ativo: "vpn-gateway-01",         severidade: "critica", score: 9.0, status: "aberta",      desc: "Bypass de autenticação no Ivanti Connect Secure" },
    { cve: null,             ativo: "srv-arquivos-02",        severidade: "alta",    score: 8.6, status: "corrigida",   desc: "Compartilhamento SMB exposto com permissões excessivas" },
    { cve: "CVE-2025-1097",  ativo: "notebook-financeiro-07", severidade: "media",   score: 5.4, status: "aberta",      desc: "Escalonamento local de privilégio via serviço desatualizado" },
    { cve: null,             ativo: "notebook-diretoria-01",  severidade: "media",   score: 4.9, status: "em_correcao", desc: "Software sem atualização há mais de 60 dias" },
    { cve: "CVE-2023-4863",  ativo: "estacao_rh_04",          severidade: "baixa",   score: 3.1, status: "corrigida",   desc: "Falha de leitura de imagem WebP já mitigada pelo navegador" },
    { cve: null,             ativo: "srv-banco-dados-01",     severidade: "alta",    score: 8.1, status: "aberta",      desc: "Porta de administração do banco acessível na rede interna" },
    { cve: "CVE-2024-0519",  ativo: "portal-clientes",        severidade: "media",   score: 6.2, status: "em_correcao", desc: "Acesso indevido a memória fora dos limites no motor de scripts" }
  ];

  var corpoAtivos = document.getElementById("corpo-ativos");
  var listaVulns = document.getElementById("lista-vulnerabilidades");
  var selSev = document.getElementById("filtro-severidade");
  var selStatus = document.getElementById("filtro-status-vuln");
  var selAtivo = document.getElementById("filtro-ativo");
  var msgQuarentena = document.getElementById("msg-quarentena");

  function labelPatch(p) {
    return { pendente: "Pendente", em_dia: "Em dia", critico: "Crítico" }[p] || p;
  }
  function badgePatch(p) {
    var cor = { pendente: "media", em_dia: "ok", critico: "critica" }[p] || "neutro";
    return '<span class="badge badge--' + cor + '">' + CS.escapar(labelPatch(p)) + "</span>";
  }

  function renderAtivos() {
    corpoAtivos.innerHTML = ATIVOS.map(function (a) {
      return "<tr>" +
        '<td class="dado">' + CS.escapar(a.nome) + "</td>" +
        "<td>" + CS.escapar(a.tipo.replace(/_/g, " ")) + "</td>" +
        "<td>" + CS.escapar(a.setor) + "</td>" +
        '<td class="dado">' + CS.escapar(a.ip) + "</td>" +
        "<td>" + badgePatch(a.patch) + "</td>" +
      "</tr>";
    }).join("");
  }

  function labelStatusVuln(s) {
    return { aberta: "Aberta", em_correcao: "Em correção", corrigida: "Corrigida" }[s] || s;
  }

  function renderVulns() {
    var sev = selSev.value, st = selStatus.value, at = selAtivo.value;
    var filtradas = VULNS.filter(function (v) {
      return (sev === "todas" || v.severidade === sev) &&
             (st === "todos" || v.status === st) &&
             (at === "todos" || v.ativo === at);
    });

    if (filtradas.length === 0) {
      listaVulns.innerHTML = '<p class="txt-muted">Nenhuma vulnerabilidade com esses filtros.</p>';
    } else {
      listaVulns.innerHTML = filtradas.map(function (v) {
        return '<article class="cartao-vuln cartao-vuln--' + v.severidade + '">' +
          '<div class="cartao-vuln__topo">' +
            '<span class="cartao-vuln__cve">' + CS.escapar(v.cve || "sem CVE") + "</span>" +
            CS.badgeSeveridade(v.severidade) +
          "</div>" +
          '<p class="cartao-vuln__desc">' + CS.escapar(v.desc) + "</p>" +
          '<div class="cartao-vuln__meta">' +
            "<span>" + CS.escapar(v.ativo) + "</span>" +
            "<span>CVSS " + v.score.toFixed(1) + "</span>" +
            "<span>" + labelStatusVuln(v.status) + "</span>" +
          "</div>" +
        "</article>";
      }).join("");
    }
    atualizarStats();
  }

  function atualizarStats() {
    document.getElementById("stat-ativos").textContent = ATIVOS.length;
    document.getElementById("stat-vulns").textContent = VULNS.length;
    document.getElementById("stat-abertas").textContent =
      VULNS.filter(function (v) { return v.status === "aberta"; }).length;
    document.getElementById("stat-quarentena").textContent =
      ATIVOS.filter(function (a) { return a.patch === "critico"; }).length;
  }

  // Popular o filtro de ativos.
  ATIVOS.forEach(function (a) {
    var opt = document.createElement("option");
    opt.value = a.nome; opt.textContent = a.nome;
    selAtivo.appendChild(opt);
  });

  // Quarentena automática: score > 9.0 (estritamente) e status aberta.
  document.getElementById("btn-quarentena").addEventListener("click", function () {
    var alvos = {};
    VULNS.forEach(function (v) {
      if (v.status === "aberta" && v.score > 9.0) alvos[v.ativo] = true;
    });
    var movidos = [];
    ATIVOS.forEach(function (a) {
      if (alvos[a.nome] && a.patch !== "critico") {
        a.patch = "critico";
        movidos.push(a.nome);
      }
    });

    msgQuarentena.classList.add("visivel");
    if (movidos.length === 0) {
      msgQuarentena.className = "mensagem visivel mensagem--info";
      msgQuarentena.textContent = "Nenhum ativo novo para isolar — os críticos já estão em quarentena.";
    } else {
      msgQuarentena.className = "mensagem visivel mensagem--alerta";
      msgQuarentena.innerHTML = "<strong>" + movidos.length + " ativo(s) isolado(s):</strong> " +
        movidos.join(", ") + " passaram para status crítico.";
    }
    renderAtivos();
    atualizarStats();
  });

  [selSev, selStatus, selAtivo].forEach(function (s) { s.addEventListener("change", renderVulns); });

  renderAtivos();
  renderVulns();
})();
