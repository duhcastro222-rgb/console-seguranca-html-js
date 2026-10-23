/* AgroSentinela — dados simulados + classificação de severidade.
   A regra de classificação replica classificar_severidade() do Pronova.py,
   para a tela se comportar igual ao motor Python quando o fetch() entrar. */
(function () {
  "use strict";

  // ---- Mock: telemetria bruta do turno (viria de GET /api/eventos) ----
  var EVENTOS_BRUTOS = [
    { id: "EV-1001", origem: "DRONE-02",  tipo: "interferencia_sinal",    intensidade: 22, horario: "06:12" },
    { id: "EV-1002", origem: "SENSOR-14", tipo: "leitura_sensor_anomala", intensidade: 48, horario: "06:39" },
    { id: "EV-1003", origem: "DRONE-05",  tipo: "tentativa_spoofing",     intensidade: 41, horario: "07:01" },
    { id: "EV-1004", origem: "GATEWAY-01",tipo: "acesso_nao_autorizado",  intensidade: 55, horario: "07:20" },
    { id: "EV-1005", origem: "DRONE-02",  tipo: "falha_autenticacao",     intensidade: 73, horario: "07:44" },
    { id: "EV-1006", origem: "SENSOR-09", tipo: "interferencia_sinal",    intensidade: 88, horario: "08:03" },
    { id: "EV-1007", origem: "DRONE-11",  tipo: "tentativa_spoofing",     intensidade: 95, horario: "08:25" },
    { id: "EV-1008", origem: "SENSOR-14", tipo: "leitura_sensor_anomala", intensidade: 17, horario: "08:51" },
    { id: "EV-1009", origem: "GATEWAY-01",tipo: "acesso_nao_autorizado",  intensidade: 90, horario: "09:10" },
    { id: "EV-1010", origem: "DRONE-05",  tipo: "falha_autenticacao",     intensidade: 34, horario: "09:33" }
  ];

  var AGRAVAR = ["tentativa_spoofing", "acesso_nao_autorizado"];

  // Espelha a lógica de Pronova.py: faixas + agravamento automático.
  function classificarSeveridade(tipo, intensidade) {
    var sev;
    if (intensidade <= 29) sev = "baixa";
    else if (intensidade <= 59) sev = "media";
    else if (intensidade <= 84) sev = "alta";
    else sev = "critica";
    if (sev === "media" && AGRAVAR.indexOf(tipo) !== -1) sev = "alta";
    return sev;
  }

  var EVENTOS = EVENTOS_BRUTOS.map(function (e) {
    return {
      id: e.id, origem: e.origem, tipo: e.tipo, intensidade: e.intensidade,
      horario: e.horario, severidade: classificarSeveridade(e.tipo, e.intensidade)
    };
  });

  var corpo = document.getElementById("corpo-eventos");
  var inputBusca = document.getElementById("busca-evento");
  var selectSev = document.getElementById("filtro-severidade");

  function nomeTipo(tipo) {
    return tipo.replace(/_/g, " ");
  }

  function render() {
    var termo = inputBusca.value.trim().toLowerCase();
    var sev = selectSev.value;

    var filtrados = EVENTOS.filter(function (e) {
      var casaSev = (sev === "todas") || (e.severidade === sev);
      var alvo = (e.id + " " + e.origem + " " + e.tipo).toLowerCase();
      var casaBusca = termo === "" || alvo.indexOf(termo) !== -1;
      return casaSev && casaBusca;
    });

    if (filtrados.length === 0) {
      corpo.innerHTML = '<tr class="vazio"><td colspan="6">Nenhum evento com esses critérios neste turno.</td></tr>';
    } else {
      corpo.innerHTML = filtrados.map(function (e) {
        return "<tr>" +
          '<td class="dado">' + CS.escapar(e.id) + "</td>" +
          '<td class="dado">' + CS.escapar(e.origem) + "</td>" +
          "<td>" + CS.escapar(nomeTipo(e.tipo)) + "</td>" +
          '<td class="col-num">' + e.intensidade + "</td>" +
          "<td>" + CS.badgeSeveridade(e.severidade) + "</td>" +
          '<td class="dado">' + CS.escapar(e.horario) + "</td>" +
        "</tr>";
      }).join("");
    }

    atualizarEstatisticas();
  }

  function atualizarEstatisticas() {
    var cont = { baixa: 0, media: 0, alta: 0, critica: 0 };
    EVENTOS.forEach(function (e) { cont[e.severidade]++; });
    document.getElementById("stat-total").textContent = EVENTOS.length;
    document.getElementById("stat-baixa").textContent = cont.baixa;
    document.getElementById("stat-media").textContent = cont.media;
    document.getElementById("stat-alta").textContent = cont.alta;
    document.getElementById("stat-critica").textContent = cont.critica;
  }

  inputBusca.addEventListener("input", render);
  selectSev.addEventListener("change", render);
  render();
})();
