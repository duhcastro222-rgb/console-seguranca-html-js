/* Login — base de usuários simulada + validação de senha forte + auditoria.
   Espelha tarefa1.py: senha_forte() >= 8, registrar_tentativa(), extrair_ip(). */
(function () {
  "use strict";

  // Mock: viria de uma tabela de usuários (nunca com senha em texto puro na vida real).
  var USUARIOS = [
    { usuario: "admin", senha: "123456",             ip: "192.168.0.10" },
    { usuario: "leide", senha: "S3nh@Forte!2024",    ip: "192.168.0.15" },
    { usuario: "root",  senha: "senha",              ip: "10.0.0.5" },
    { usuario: "carla", senha: "P@ssw0rd_2024_XYZ",  ip: "192.168.0.22" }
  ];

  var form = document.getElementById("form-login");
  var inputUsuario = document.getElementById("campo-usuario");
  var inputSenha = document.getElementById("campo-senha");
  var barra = document.getElementById("medidor-barra");
  var textoForca = document.getElementById("medidor-senha");
  var mensagem = document.getElementById("mensagem-login");
  var corpo = document.getElementById("corpo-tentativas");
  var contador = document.getElementById("contador-tentativas");

  var totalTentativas = 0;

  function senhaForte(senha) {
    return senha.length >= 8;
  }

  // Feedback dinâmico de força (exibição condicional em tempo real).
  inputSenha.addEventListener("input", function () {
    var s = inputSenha.value;
    if (s.length === 0) {
      barra.style.width = "0";
      textoForca.textContent = "Digite a senha para avaliar a força.";
      textoForca.style.color = "";
      return;
    }
    var pontos = 0;
    if (s.length >= 8) pontos++;
    if (/[A-Z]/.test(s) && /[a-z]/.test(s)) pontos++;
    if (/\d/.test(s)) pontos++;
    if (/[^A-Za-z0-9]/.test(s)) pontos++;

    var cor, rotulo, largura;
    if (!senhaForte(s)) {
      cor = "var(--sev-critica)"; rotulo = "Fraca — menos de 8 caracteres"; largura = "25%";
    } else if (pontos <= 2) {
      cor = "var(--sev-alta)"; rotulo = "Razoável — melhore com números e símbolos"; largura = "55%";
    } else if (pontos === 3) {
      cor = "var(--sev-media)"; rotulo = "Boa"; largura = "80%";
    } else {
      cor = "var(--sev-baixa)"; rotulo = "Forte"; largura = "100%";
    }
    barra.style.width = largura;
    barra.style.background = cor;
    textoForca.textContent = rotulo;
    textoForca.style.color = cor;
  });

  function mostrarMensagem(tipo, texto) {
    mensagem.className = "mensagem visivel mensagem--" + tipo;
    mensagem.textContent = texto;
  }

  function registrarLinha(usuario, ip, aprovado) {
    var vazio = corpo.querySelector(".vazio");
    if (vazio) vazio.remove();
    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + CS.escapar(usuario || "—") + "</td>" +
      '<td class="dado">' + CS.escapar(ip) + "</td>" +
      "<td>" + CS.badgeStatus(aprovado ? "sucesso" : "falha") + "</td>" +
      '<td class="dado">' + CS.horaAgora() + "</td>";
    corpo.insertBefore(tr, corpo.firstChild);
    totalTentativas++;
    contador.textContent = totalTentativas;
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var usuario = inputUsuario.value.trim();
    var senha = inputSenha.value;

    if (usuario === "" || senha === "") {
      mostrarMensagem("erro", "Preencha usuário e senha para continuar.");
      return;
    }

    var achado = USUARIOS.filter(function (u) { return u.usuario === usuario; })[0];
    var ip = achado ? achado.ip : "desconhecido";
    var aprovado = !!achado && achado.senha === senha;

    if (aprovado) {
      mostrarMensagem("ok", "Login bem-sucedido para " + usuario + ".");
    } else if (!achado) {
      mostrarMensagem("erro", "Usuário " + usuario + " não encontrado.");
    } else {
      mostrarMensagem("erro", "Senha incorreta para " + usuario + ".");
    }

    registrarLinha(usuario, ip, aprovado);
    inputSenha.value = "";
    inputSenha.dispatchEvent(new Event("input"));
  });
})();
