import json
import os
import openai

# Configurar la clave API de OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Cambia el nombre de la función a `handler`
def handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        user_message = body.get('message', '')

        history = [
            {"role": "system", "content": "Eres un asistente personal de compras del ecommerce mayyalimitless."},
            {"role": "user", "content": user_message}
        ]

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=history
        )

        assistant_message = response['choices'][0]['message']['content']
        
        return {
            "statusCode": 200,
            "body": json.dumps({"response": assistant_message}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }