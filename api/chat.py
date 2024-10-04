import json
import os
import openai

# Configurar la clave API de OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

def vercel_handler(event, context):
    try:
        # Asegúrate de manejar la solicitud JSON correctamente
        body = json.loads(event.get('body', '{}'))
        user_message = body.get('message', '')

        # Procesar el mensaje del usuario
        history = [
            {"role": "system", "content": "Eres un asistente personal de compras del ecommerce mayyalimitless."},
            {"role": "user", "content": user_message}
        ]
        
        # Generar la respuesta con OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=history
        )

        assistant_message = response['choices'][0]['message']['content']
        
        # Responder con la respuesta del asistente en el formato esperado
        return {
            "statusCode": 200,
            "body": json.dumps({"response": assistant_message}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }
    
    except Exception as e:
        # Manejar errores y devolver una respuesta clara
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }