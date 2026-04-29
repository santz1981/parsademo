const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { parseEvent, parseTicks } = require('demoparser2');

const app = express();
app.use(cors()); // Permite que seu app chame a API

// Salva o arquivo .dem temporariamente para poder ler
const upload = multer({ dest: 'uploads/' });

// A sua senha (Parser API Key) inventada
const API_KEY = "minha-senha-super-secreta-base44";

app.post('/parse', upload.single('file'), (req, res) => {
  // 1. Verificar Autenticação (opcional mas recomendado)
  // const clientKey = req.headers['x-api-key'];
  // if (clientKey !== API_KEY) return res.status(401).json({ error: "Acesso Negado" });

  try {
    const demoPath = req.file.path;

    // 2. Usar o demoparser2 para extrair eventos
    // O demoparser2 lê Kills, mortes, final de round, etc.
    const killsEvent = parseEvent(demoPath, "player_death");
    
    // (AQUI vai a lógica para somar os kills de cada jogador a partir dos eventos)
    // Exemplo de saída formatada devolvendo pro seu App:
    const relatorio = {
      map: "de_mirage", // você também extrai do arquivo
      round_summary: {
        total_rounds: 24,
        team_started_as: "CT",
        // etc...
      },
      players: [
         { name: "Vini", team: "CT", kills: 22, deaths: 14, assists: 3, adr: 92 },
         { name: "Chelo", team: "CT", kills: 18, deaths: 15, assists: 5, adr: 85 }
         // ...
      ]
    };

    // Apaga o arquivo pesado logo depois de ler
    fs.unlinkSync(demoPath);

    // 3. Responde pro seu App
    res.json(relatorio);
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar a demo" });
  }
});

// Inicia o servidor
app.listen(8080, () => console.log('Parser on na porta 8080!'));