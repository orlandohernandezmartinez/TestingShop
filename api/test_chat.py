import os
from chat import handler

# Simular el evento y el contexto
event = {
    "body": '{"message": "Hola"}'
}
context = {}

# Establecer la clave de API manualmente si estás probando localmente
os.environ["OPENAI_API_KEY"] = "sk-proj-bfVwYxCL0-KH..."  # Sustituye por tu API Key real para probar

# Llamar a la función y mostrar el resultado
response = handler(event, context)
print(response)
