import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def handler(event, context):
    body = json.loads(event['body'])
    user_message = body.get('message', '')

    # Procesar el mensaje del usuario
    history = [
        {"role": "system", "content": "Eres un asistente personal de compras del ecommerce mayyalimitless."},
        {"role": "user", "content": user_message}
    ]
    
    # Generar la respuesta con OpenAI
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=history
    )

    assistant_message = response.choices[0].message['content']
    
    # Retornar la respuesta al frontend
    return {
        "statusCode": 200,
        "body": json.dumps({"response": assistant_message}),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
