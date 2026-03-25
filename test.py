import urllib.request
import urllib.error
import json

url = "https://sponsored-portal-production.up.railway.app/api/auth/register"
data = {"email": "test@example.com", "username": "testuser", "password": "password123", "role": "student"}
req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.getcode())
        print("Body:", response.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.reason)
    print("Error Body:", e.read().decode())
except urllib.error.URLError as e:
    print("URL Error:", e.reason)
except Exception as e:
    print("Error:", e)
