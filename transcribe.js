require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

console.log("Chiave API:", process.env.OPENAI_API_KEY);

async function transcribe() {
  const form = new FormData();
  form.append('file', fs.createReadStream('./audio.wav')); // cambia con il tuo file
  form.append('model', 'whisper-1');

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        timeout: 60000 // 60 secondi
      }
    );

    const testo = response.data.text;
    fs.writeFileSync('trascrizione.txt', testo);
    console.log('✅ Trascrizione salvata in trascrizione.txt');
  } catch (err) {
    console.error('❌ Errore nella trascrizione:', err.response?.data || err.message);
  }
}

transcribe();
