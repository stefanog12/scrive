require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

console.log("Chiave API:", process.env.OPENAI_API_KEY);

const audioDir = path.join(__dirname, 'audio');

async function transcribeFile(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('model', 'whisper-1'); // modello di OpenAI

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        timeout: 60000,
      }
    );

    console.log(`✅ ${path.basename(filePath)} trascritto:\n`, response.data.text, '\n');
    
    // Salva anche su file
    const outFile = path.join(__dirname, 'trascrizioni', path.basename(filePath) + '.txt');
    fs.writeFileSync(outFile, response.data.text);

  } catch (err) {
    console.error(`❌ Errore con ${filePath}:`, err.response?.data || err.message);
  }
}

async function processAllFiles() {
  const files = fs.readdirSync(audioDir).filter(file =>
    file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.m4a')
  );

  if (files.length === 0) {
    console.log('📁 Nessun file audio trovato in', audioDir);
    return;
  }

  // Crea la cartella per salvare le trascrizioni, se non esiste
  const outDir = path.join(__dirname, 'trascrizioni');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  for (const file of files) {
    const fullPath = path.join(audioDir, file);
    await transcribeFile(fullPath);
  }
}

processAllFiles();

