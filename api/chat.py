import json
import os
import openai  # Cambiado a importar todo el módulo

# Configurar la clave API de OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

def handler(event, context):
    try:
        body = json.loads(event['body'])
        user_message = body.get('message', '')

        # Procesar el mensaje del usuario
        history = [
            {"role": "system", "content": "Eres un asistente personal de compras del ecommerce mayyalimitless."},
            {"role": "user", "content": user_message}
        ]
        
        # Generar la respuesta con OpenAI (Corregido para usar openai.ChatCompletion)
        response = openai.ChatCompletion.create(
            model="gpt-4",  # Cambiado a gpt-4
            messages=history
        )

        assistant_message = response['choices'][0]['message']['content']
        
        # Retornar la respuesta al frontend
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
