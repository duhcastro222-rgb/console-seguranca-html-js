/* Eventos de Login (CRUD) — dados simulados em memória.
   Espelha eventos_login_crud.py: IP guardado como hash, deteccao de anomalia
   quando falhas de um mesmo IP passam de LIMIAR_ALERTA (5). */
(function () {
  "use strict";

  var LIMIAR_ALERTA = 5;
  var proximoId = 1;

  // Hash "de mentira" só para a tela — no backend é SHA-256 real (hash_ip()).
  function hashIp(ip) {
    var h = 0;
    for (var i = 0; i < ip.length; i++) {
      h = (h * 31 + ip.charCodeAt(i)) >>> 0;
    }
    return ("00000000" + h.toString(16)).slice(-8);
  }

  function novoEvento(usuario, ip, status, tentativas, hora) {
    return {
      id: proximoId++, usuario: usuario, ipHash: hashIp(ip),
      status: status, tentativas: tentativas || 1,
      hora: hora || CS.horaAgora()
    };
  }

  // Seed inicial — inclui um IP com muitas falhas para acionar o alerta.
  var EVENTOS = [];
  var seed = [
    ["analista01", "10.0.0.5",  "sucesso",   1, "07:58:11"],
    ["analista02", "10.0.0.5",  "falha",     1, "08:02:40"],
    ["desconhecido", "203.0.113.9", "falha",  1, "08:05:01"],
    ["desconhecido", "203.0.113.9", "falha",  1, "08:05:12"],
    ["desconhecido", "203.0.113.9", "falha",  1, "08:05:20"],
    ["desconhecido", "203.0.113.9", "falha",  1, "08:05:31"],
    ["desconhecido", "203.0.113.9", "falha",  1, "08:05:44"],
    ["desconhecido", "203.0.113.9", "bloqueado", 1, "08:05:55"],
    ["analista01", "10.0.0.5",  "sucesso",   1, "08:20:03"]
  ];
  seed.forEach(function (s) { EVENTOS.push(novoEvento(s[0], s[1], s[2], s[3], s[4])); });

  var corpo = document.getElementById("corpo-eventos-login");
  var contador = document.getElementById("contador-eventos");
  var buscaUsuario = document.getElementById("busca-usuario");
  var filtroStatus = document.getElementById("filtro-status");
  var alertaAnomalia = document.getElementById("alerta-anomalia");
  var form = document.getElementById("form-evento");

  function render() {
    var termo = buscaUsuario.value.trim().toLowerCase();
    var status = filtroStatus.value;

    var filtrados = EVENTOS.filter(function (e) {
      var casaUsuario = termo === "" || e.usuario.toLowerCase().indexOf(termo) !== -1;
      var casaStatus = status === "todos" || e.status === status;
      return casaUsuario && casaStatus;
    });

    contador.textContent = EVENTOS.length;

    if (filtrados.length === 0) {
      corpo.innerHTML = '<tr class="vazio"><td colspan="7">Nenhum evento com esses critérios.</td></tr>';
    } else {
      corpo.innerHTML = filtrados.map(function (e) {
        return "<tr>" +
          '<td class="dado">#' + e.id + "</td>" +
          "<td>" + CS.escapar(e.usuario) + "</td>" +
          '<td class="dado">' + e.ipHash + "…</td>" +
          "<td>" + CS.badgeStatus(e.status) + "</td>" +
          '<td class="col-num">' + e.tentativas + "</td>" +
          '<td class="dado">' + CS.escapar(e.hora) + "</td>" +
          '<td><button type="button" class="btn btn--perigo btn--mini" data-del="' + e.id + '">Excluir</button></td>' +
        "</tr>";
      }).join("");
    }
    verificarAnomalia();
  }

  // Detecção simples: conta falhas por hash de IP e alerta se passar do limiar.
  function verificarAnomalia() {
    var falhasPorIp = {};
    EVENTOS.forEach(function (e) {
      if (e.status === "falha" || e.status === "bloqueado") {
        falhasPorIp[e.ipHash] = (falhasPorIp[e.ipHash] || 0) + 1;
      }
    });
    var suspeitos = Object.keys(falhasPorIp).filter(function (h) { return falhasPorIp[h] >= LIMIAR_ALERTA; });

    if (suspeitos.length === 0) {
      alertaAnomalia.classList.remove("visivel");
      return;
    }
    var partes = suspeitos.map(function (h) { return h + "… (" + falhasPorIp[h] + " falhas)"; });
    alertaAnomalia.classList.add("visivel");
    alertaAnomalia.innerHTML = "<strong>Possível ataque:</strong> IP " + partes.join(", ") +
      " ultrapassou o limiar de " + LIMIAR_ALERTA + " falhas.";
  }

  // CREATE
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var usuario = document.getElementById("evento-usuario").value.trim();
    var ip = document.getElementById("evento-ip").value.trim();
    var status = document.getElementById("evento-status").value;
    if (usuario === "" || ip === "") return;

    EVENTOS.unshift(novoEvento(usuario, ip, status, 1));
    form.reset();
    render();
  });

  // DELETE (delegação de evento)
  corpo.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-del]");
    if (!btn) return;
    var id = Number(btn.getAttribute("data-del"));
    EVENTOS = EVENTOS.filter(function (e) { return e.id !== id; });
    render();
  });

  buscaUsuario.addEventListener("input", render);
  filtroStatus.addEventListener("change", render);
  render();
})();
