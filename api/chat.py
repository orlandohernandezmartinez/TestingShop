import json
import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        user_message = body.get('message', '')

        history = [
            {"role": "system", "content": "Eres un asistente personal de compras del ecommerce mayyalimitless."},
            {"role": "user", "content": user_message}
        ]

        # Llama a la función compatible con la versión reciente de openai
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
# Simulación del evento si ejecutas directamente
if __name__ == "__main__":
    # Simula un evento de ejemplo
    event = {
        "body": json.dumps({"message": "Hola, estoy buscando zapatos de running"})
    }
    response = handler(event, None)
    print(response)
