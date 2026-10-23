/* GitHub & IPs — respostas de API simuladas.
   GitHub: dados de usuarios_github.json. IPs: regra de risco de verificador_ips.py
   (proxy -> ALTO, hosting -> MEDIO, senão BAIXO; status fail -> INVALIDO). */
(function () {
  "use strict";

  // ---- Mock GitHub (formato já parecido com a resposta da API) ----
  var USUARIOS_GH = {
    torvalds:   { nome: "Linus Torvalds",   local: "Portland, OR",            repos: 12,  seguidores: 317701 },
    gvanrossum: { nome: "Guido van Rossum",  local: "San Francisco Bay Area",  repos: 28,  seguidores: 26849 },
    octocat:    { nome: "The Octocat",       local: "San Francisco",           repos: 8,   seguidores: 23759 },
    gaearon:    { nome: "dan",               local: "— não informado —",       repos: 299, seguidores: 91452 }
  };

  var form = document.getElementById("form-consulta-github");
  var inputGh = document.getElementById("campo-github");
  var msgGh = document.getElementById("mensagem-github");
  var cartao = document.getElementById("cartao-usuario");

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var login = inputGh.value.trim().toLowerCase();
    if (login === "") {
      msgGh.className = "mensagem visivel mensagem--erro";
      msgGh.textContent = "Digite um usuário do GitHub.";
      cartao.classList.add("esconder");
      return;
    }
    var dados = USUARIOS_GH[login];
    if (!dados) {
      msgGh.className = "mensagem visivel mensagem--alerta";
      msgGh.textContent = "Usuário “" + login + "” não encontrado (404). Tente torvalds, gvanrossum, octocat ou gaearon.";
      cartao.classList.add("esconder");
      return;
    }
    msgGh.className = "mensagem";
    document.getElementById("gh-nome").textContent = dados.nome;
    document.getElementById("gh-login").textContent = "@" + login;
    document.getElementById("gh-repos").textContent = dados.repos;
    document.getElementById("gh-seguidores").textContent = dados.seguidores.toLocaleString("pt-BR");
    document.getElementById("gh-local").textContent = dados.local;
    cartao.classList.remove("esconder");
  });

  // ---- Mock reputação de IPs ----
  var IPS = [
    { ip: "8.8.8.8",         pais: "Estados Unidos", provedor: "Google LLC",        risco: "BAIXO",    motivo: "IP comum de provedor" },
    { ip: "1.1.1.1",         pais: "Austrália",      provedor: "Cloudflare",        risco: "MEDIO",    motivo: "IP de datacenter" },
    { ip: "185.220.101.1",   pais: "Alemanha",       provedor: "Tor Exit Node",     risco: "ALTO",     motivo: "IP de proxy, VPN ou Tor" },
    { ip: "45.33.32.156",    pais: "Estados Unidos", provedor: "Linode",            risco: "MEDIO",    motivo: "IP de datacenter" },
    { ip: "104.16.132.229",  pais: "Estados Unidos", provedor: "Cloudflare",        risco: "MEDIO",    motivo: "IP de datacenter" },
    { ip: "192.168.0.10",    pais: "—",              provedor: "—",                 risco: "INVALIDO", motivo: "IP reservado / privado" },
    { ip: "999.999.999.999", pais: "—",              provedor: "—",                 risco: "INVALIDO", motivo: "endereço malformado" }
  ];

  var RISCO_BADGE = { ALTO: "critica", MEDIO: "media", BAIXO: "baixa", INVALIDO: "neutro" };

  var corpoIps = document.getElementById("corpo-ips");
  var filtroRisco = document.getElementById("filtro-risco");

  function renderIps() {
    var nivel = filtroRisco.value;
    var filtrados = IPS.filter(function (i) { return nivel === "todos" || i.risco === nivel; });

    if (filtrados.length === 0) {
      corpoIps.innerHTML = '<tr class="vazio"><td colspan="5">Nenhum IP nesse nível de risco.</td></tr>';
      return;
    }
    corpoIps.innerHTML = filtrados.map(function (i) {
      var cor = RISCO_BADGE[i.risco] || "neutro";
      var rotulo = i.risco.charAt(0) + i.risco.slice(1).toLowerCase();
      return "<tr>" +
        '<td class="dado">' + CS.escapar(i.ip) + "</td>" +
        "<td>" + CS.escapar(i.pais) + "</td>" +
        "<td>" + CS.escapar(i.provedor) + "</td>" +
        '<td><span class="badge badge--' + cor + '">' + CS.escapar(rotulo) + "</span></td>" +
        '<td class="txt-muted">' + CS.escapar(i.motivo) + "</td>" +
      "</tr>";
    }).join("");
  }

  filtroRisco.addEventListener("change", renderIps);
  renderIps();
})();
