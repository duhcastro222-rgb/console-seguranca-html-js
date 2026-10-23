# Console de Segurança — Interfaces Web

Um console web que reúne, em um só lugar, as telas das seis aplicações de segurança desenvolvidas no semestre. Feito em **HTML, CSS e JavaScript puro**, sem framework e sem build: basta abrir o `index.html` no navegador.

## Painéis

| Painel | O que faz |
| --- | --- |
| `agrosentinela/` | Telemetria e eventos do turno |
| `login-tentativas/` | Login com validação de senha forte e auditoria de tentativas |
| `monitor-sockets/` | Visualização dos alertas recebidos via sockets TCP/UDP |
| `consulta-github-ips/` | Consulta de usuários do GitHub e reputação de IPs |
| `eventos-login-crud/` | CRUD de eventos de login |
| `vulnerabilidades-quasecp/` | Painel de ativos e vulnerabilidades |

`assets/` guarda o CSS e os componentes JavaScript compartilhados por todas as telas.

## Como executar

Abra `index.html` no navegador, ou sirva a pasta localmente:

```bash
python -m http.server 8000
```

e acesse <http://127.0.0.1:8000>.

> Os usuários, senhas e IPs usados nas telas são dados fictícios de laboratório.
