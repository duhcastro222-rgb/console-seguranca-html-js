/* =========================================================================
   componentes.js — peças reaproveitadas por TODAS as telas
   - Injeta o mesmo cabeçalho + barra de navegação em cada página
   - Exponibiliza helpers (badges, escape, criação de linhas) no window
   Cada página só define <body data-app="slug" data-depth="0|1">.
   ========================================================================= */
(function () {
  "use strict";

  // Ordem dos painéis na navegação central. slug = nome da subpasta.
  var PAINEIS = [
    { slug: "index",                     rotulo: "Início",          casa: true },
    { slug: "agrosentinela",             rotulo: "AgroSentinela" },
    { slug: "login-tentativas",          rotulo: "Login" },
    { slug: "monitor-sockets",           rotulo: "Monitor Sockets" },
    { slug: "consulta-github-ips",       rotulo: "GitHub & IPs" },
    { slug: "eventos-login-crud",        rotulo: "Eventos (CRUD)" },
    { slug: "vulnerabilidades-quasecp",  rotulo: "Vulnerabilidades" }
  ];

  var appAtual = document.body.dataset.app || "index";
  var ehCasa = document.body.dataset.depth !== "1";
  var prefixo = ehCasa ? "" : "../";

  function href(p) {
    if (p.casa) return prefixo + "index.html";
    return prefixo + p.slug + "/index.html";
  }

  // ---------- Cabeçalho + navegação ----------
  function montarTopo() {
    var itens = PAINEIS.map(function (p) {
      var ativo = (p.slug === appAtual) ? ' aria-current="page"' : "";
      return '<a class="nav__item" href="' + href(p) + '"' + ativo + ">" + p.rotulo + "</a>";
    }).join("");

    var topo = document.createElement("header");
    topo.className = "topo";
    topo.innerHTML =
      '<div class="topo__barra">' +
        '<a class="marca" href="' + prefixo + 'index.html">' +
          '<span class="marca__glifo">CS</span>' +
          '<span>' +
            '<span class="marca__nome">Console de Segurança</span>' +
            '<span class="marca__sub">Coding for Security · RM 573427</span>' +
          "</span>" +
        "</a>" +
        '<span class="status-chip">' +
          '<span class="status-chip__pulso"></span>' +
          '<span>operacional</span>' +
          '<span aria-hidden="true">·</span>' +
          '<span id="relogio-topo" class="dado">--:--:--</span>' +
        "</span>" +
      "</div>" +
      '<nav class="nav" aria-label="Navegação entre painéis">' +
        '<div class="nav__lista">' + itens + "</div>" +
      "</nav>";

    document.body.insertBefore(topo, document.body.firstChild);
  }

  // ---------- Rodapé ----------
  function montarRodape() {
    var rodape = document.createElement("footer");
    rodape.className = "rodape";
    rodape.innerHTML =
      '<div class="rodape__inner">' +
        "<span>Protótipo de interface · dados simulados no navegador (mock)</span>" +
        '<span class="dado">pronto para plugar fetch()</span>' +
      "</div>";
    document.body.appendChild(rodape);
  }

  // ---------- Relógio ao vivo (único elemento em movimento constante) ----------
  function iniciarRelogio() {
    var el = document.getElementById("relogio-topo");
    if (!el) return;
    function tique() {
      var agora = new Date();
      el.textContent = agora.toLocaleTimeString("pt-BR");
    }
    tique();
    setInterval(tique, 1000);
  }

  // =======================================================================
  // Helpers compartilhados (window.CS)
  // =======================================================================
  function escapar(txt) {
    return String(txt == null ? "" : txt)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // badge de severidade: baixa | media | alta | critica
  function badgeSeveridade(nivel) {
    var mapa = { baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica" };
    var chave = String(nivel || "").toLowerCase();
    var rotulo = mapa[chave] || nivel;
    return '<span class="badge badge--' + escapar(chave) + '">' + escapar(rotulo) + "</span>";
  }

  // badge de status genérico com dicionário de cores
  var CORES_STATUS = {
    sucesso: "ok", aprovado: "ok", corrigida: "ok", em_dia: "ok",
    falha: "critica", bloqueado: "critica", aberta: "critica", critico: "critica",
    em_correcao: "media", em_analise: "media", pendente: "media",
    desconhecido: "neutro"
  };
  function badgeStatus(status) {
    var chave = String(status || "").toLowerCase();
    var cor = CORES_STATUS[chave] || "neutro";
    var rotulo = String(status || "").replace(/_/g, " ");
    return '<span class="badge badge--' + cor + '">' + escapar(rotulo) + "</span>";
  }

  // hora atual formatada (para linhas geradas dinamicamente)
  function horaAgora() {
    return new Date().toLocaleTimeString("pt-BR");
  }

  window.CS = {
    escapar: escapar,
    badgeSeveridade: badgeSeveridade,
    badgeStatus: badgeStatus,
    horaAgora: horaAgora
  };

  // ---------- Boot ----------
  montarTopo();
  montarRodape();
  iniciarRelogio();
})();
