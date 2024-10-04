import json
import os
import openai  # Cambiado a importar todo el módulo

# Configurar la clave API de OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Cambiamos el handler para que sea compatible con Vercel
def handler(req, res):
    try:
        # Convertir el cuerpo de la solicitud en JSON
        body = json.loads(req.body)
        user_message = body.get('message', '')

        # Procesar el mensaje del usuario
        history = [
            {"role": "system", "content": "Eres un asistente personal de compras del ecommerce mayyalimitless."},
            {"role": "user", "content": user_message}
        ]
        
        # Generar la respuesta con OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=history
        )

        assistant_message = response['choices'][0]['message']['content']
        
        # Responder con la respuesta del asistente
        return res.status(200).json({"response": assistant_message})
    
    except Exception as e:
        # Enviar una respuesta de error en caso de excepción
        return res.status(500).json({"error": str(e)})
