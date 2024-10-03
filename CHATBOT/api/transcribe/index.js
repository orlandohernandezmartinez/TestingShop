import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // Usamos fetch en lugar de axios en este caso

export const config = {
  api: {
    bodyParser: false, // Importante para poder procesar el formulario con archivos
  },
};

export default async function handler(req, res) {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al procesar el archivo de audio' });
    }

    const file = files.file[0];
    const filePath = file.filepath;

    const apiKey = process.env.OPENAI_API_KEY; // Configurar tu API key de OpenAI en el archivo .env
    const model = 'whisper-1';

    try {
      const audioStream = fs.createReadStream(filePath);
      const formData = new FormData();
      formData.append('file', audioStream);
      formData.append('model', model);

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      const result = await response.json();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error en la API de OpenAI:', error);
      return res.status(500).json({ error: 'Error al procesar la solicitud de transcripción' });
    }
  });
}