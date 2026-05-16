import base64
import requests
import os

DEEPSEEK_API_KEY = 'sk-50a223ffdd744cc693c0f71eec97846f'

def deepseek_ocr(image_bytes: bytes):
    try:
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")

        payload = {
            "model": "deepseek-vl-chat",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract bill items as JSON"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_b64}"
                            }
                        }
                    ]
                }
            ]
        }

        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(
            "https://api.deepseek.com/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=30
        )

        response.raise_for_status()

        # ✅ CORRECT JSON PARSING
        data = response.json()

        # Extract text safely
        content = data["choices"][0]["message"]["content"]

        # If DeepSeek returns JSON text → parse it
        if isinstance(content, str):
            import json
            return json.loads(content)

        return content

    except Exception as e:
        print("DeepSeek OCR failed:", e)
        return None