import base64
import json
import os
import urllib.request

api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    print("No API key")
    exit(1)

file_path = r'C:\Users\ACER\.gemini\antigravity-ide\brain\76e8ab89-3716-4dd2-bcfd-70a67befcf08\job_search_results_loaded_1784822459533.png'
with open(file_path, 'rb') as f:
    img_data = f.read()

b64_img = base64.b64encode(img_data).decode('utf-8')
data = {
    'contents': [{
        'parts': [
            {'text': 'Describe the layout and design of this UI in extreme detail. What does the Job Search feature look like? What are the colors, layout, filters, search bar, and card design?'},
            {'inline_data': {'mime_type': 'image/png', 'data': b64_img}}
        ]
    }]
}

req = urllib.request.Request(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + api_key,
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

response = urllib.request.urlopen(req)
result = json.loads(response.read().decode('utf-8'))
print(result['candidates'][0]['content']['parts'][0]['text'])
