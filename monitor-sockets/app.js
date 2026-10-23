/* Monitor de Sockets — alertas TCP e heartbeats UDP simulados.
   Espelha servidor_tcp.py (recebe alertas, grava log) e servidor_udp.py. */
(function () {
  "use strict";

  // Estado em memória (viria de um WebSocket / polling do servidor).
  var ALERTAS = [
    { hora: "08:41:02", texto: "Portscan detectado em 10.0.0.1", severidade: "alta" },
    { hora: "08:39:55", texto: "Falha de autenticacao repetida no gateway", severidade: "media" },
    { hora: "08:37:10", texto: "Tentativa de spoofing de GPS no DRONE-05", severidade: "critica" },
    { hora: "08:35:48", texto: "Trafego incomum na porta 443", severidade: "baixa" }
  ];

  var HEARTBEATS = [
    { hora: "08:42:00", sensor: "SENSOR-01" },
    { hora: "08:41:58", sensor: "SENSOR-03" },
    { hora: "08:41:50", sensor: "SENSOR-01" }
  ];

  // Bancos de simulação para os botões.
  var ALERTAS_POSSIVEIS = [
    { texto: "Portscan detectado em 10.0.20.7",              severidade: "alta" },
    { texto: "Acesso nao autorizado ao painel administrativo", severidade: "critica" },
    { texto: "Certificado TLS expirado no servico interno",  severidade: "media" },
    { texto: "Ping incomum vindo de faixa externa",          severidade: "baixa" },
    { texto: "Multiplas falhas de login no SSH",             severidade: "alta" },
    { texto: "Exfiltracao suspeita de dados detectada",      severidade: "critica" }
  ];
  var SENSORES = ["SENSOR-01", "SENSOR-02", "SENSOR-03", "SENSOR-09", "SENSOR-14"];

  var corpoAlertas = document.getElementById("corpo-alertas");
  var corpoHeartbeats = document.getElementById("corpo-heartbeats");
  var contadorAlertas = document.getElementById("contador-alertas");
  var filtroTexto = document.getElementById("filtro-alerta");
  var filtroCritico = document.getElementById("filtro-critico");

  function renderAlertas() {
    var termo = filtroTexto.value.trim().toLowerCase();
    var soCriticos = filtroCritico.value === "criticos";

    var filtrados = ALERTAS.filter(function (a) {
      var casaTexto = termo === "" || a.texto.toLowerCase().indexOf(termo) !== -1;
      var casaCrit = !soCriticos || a.severidade === "critica" || a.severidade === "alta";
      return casaTexto && casaCrit;
    });

    contadorAlertas.textContent = ALERTAS.length;

    if (filtrados.length === 0) {
      corpoAlertas.innerHTML = '<tr class="vazio"><td colspan="3">Nenhum alerta com esse filtro.</td></tr>';
      return;
    }
    corpoAlertas.innerHTML = filtrados.map(function (a) {
      return "<tr>" +
        '<td class="dado">' + CS.escapar(a.hora) + "</td>" +
        "<td>" + CS.escapar(a.texto) + "</td>" +
        "<td>" + CS.badgeSeveridade(a.severidade) + "</td>" +
      "</tr>";
    }).join("");
  }

  function renderHeartbeats() {
    var recentes = HEARTBEATS.slice(0, 8);
    corpoHeartbeats.innerHTML = recentes.map(function (h) {
      return "<tr>" +
        '<td class="dado">' + CS.escapar(h.hora) + "</td>" +
        '<td class="dado">' + CS.escapar(h.sensor) + "</td>" +
        '<td><span class="badge badge--ok">vivo</span></td>' +
      "</tr>";
    }).join("");
  }

  document.getElementById("btn-simular-alerta").addEventListener("click", function () {
    var base = ALERTAS_POSSIVEIS[Math.floor(Math.random() * ALERTAS_POSSIVEIS.length)];
    ALERTAS.unshift({ hora: CS.horaAgora(), texto: base.texto, severidade: base.severidade });
    renderAlertas();
  });

  document.getElementById("btn-simular-heartbeat").addEventListener("click", function () {
    var sensor = SENSORES[Math.floor(Math.random() * SENSORES.length)];
    HEARTBEATS.unshift({ hora: CS.horaAgora(), sensor: sensor });
    renderHeartbeats();
  });

  filtroTexto.addEventListener("input", renderAlertas);
  filtroCritico.addEventListener("change", renderAlertas);

  renderAlertas();
  renderHeartbeats();
})();
