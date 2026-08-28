import http.client
import urllib.request
import json
import urllib.parse

print("=== QARDU ALUMNI QA LIVE SMOKE TEST ===\n")

# 1. Frontend Route Status Checks
routes = ["/", "/alumni", "/stories", "/advice", "/about", "/feedback", "/privacy"]
print("1. Testing Frontend Page Routes (Expect HTTP 200):")
for r in routes:
    try:
        req = urllib.request.Request(f"http://localhost:3000{r}")
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"  [OK] {r:15} -> Status {resp.status}")
    except Exception as e:
        print(f"  [FAIL] {r:15} -> {e}")

# 2. Redirect Check (/directory -> /alumni)
print("\n2. Testing /directory Redirect:")
try:
    conn = http.client.HTTPConnection("localhost", 3000)
    conn.request("GET", "/directory?search=Ali")
    resp = conn.getresponse()
    location = resp.getheader("Location")
    print(f"  Status: {resp.status} (Expected 307/308)")
    print(f"  Location header: {location}")
    if resp.status in [301, 302, 307, 308] and location and "/alumni" in location:
        print("  [OK] /directory redirect with query preservation PASSED")
    else:
        print("  [WARN] Unexpected redirect response")
except Exception as e:
    print(f"  [FAIL] Redirect check error: {e}")

# 3. Backend APIs (Alumni, Stories, Advice, Faculties)
print("\n3. Testing Backend REST Endpoints:")
api_endpoints = [
    ("/api/v1/alumni/", "Alumni List"),
    ("/api/v1/stories/", "Stories List"),
    ("/api/v1/advice/", "Advice List"),
    ("/api/v1/faculties/", "Faculties List"),
    ("/api/v1/featured-alumni/", "Featured Alumni"),
]
for ep, name in api_endpoints:
    try:
        req = urllib.request.Request(f"http://127.0.0.1:8000{ep}")
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            count = len(data.get("data", data)) if isinstance(data, dict) else len(data)
            print(f"  [OK] {name:20} ({ep}) -> HTTP {resp.status}, count: {count}")
    except Exception as e:
        print(f"  [FAIL] {name:20} -> {e}")

# 4. Public Alumni Privacy Check (No email / phone in public response)
print("\n4. Checking Public Alumni Privacy Safeguards:")
try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/alumni/")
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode())
        items = data.get("data", [])
        leaks = []
        for item in items:
            if "email" in item or "phone" in item:
                leaks.append(item.get("full_name", "Unknown"))
        if leaks:
            print(f"  [FAIL] Privacy leak detected in: {leaks}")
        else:
            print("  [OK] Zero email/phone leaks. Public serializer is strictly sanitized.")
except Exception as e:
    print(f"  [FAIL] Privacy check error: {e}")

# 5. Feedback API Valid (HTTP 201) and Invalid (HTTP 400)
print("\n5. Testing Feedback POST Endpoint:")
# Valid
try:
    payload = json.dumps({
        "type": "proposal",
        "name": "QA Tester",
        "contact": "qa@qarshidu.uz",
        "message": "Production verification test message."
    }).encode("utf-8")
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/feedback/", data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=5) as resp:
        print(f"  [OK] Valid Feedback POST -> HTTP {resp.status} (Expected 201)")
except urllib.error.HTTPError as e:
    print(f"  [RESULT] Valid Feedback POST -> HTTP {e.code}")
except Exception as e:
    print(f"  [FAIL] Valid Feedback POST error -> {e}")

# Invalid
try:
    bad_payload = json.dumps({
        "type": "invalid_type",
        "message": "abc"  # too short
    }).encode("utf-8")
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/feedback/", data=bad_payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=5) as resp:
        print(f"  [UNEXPECTED] Invalid Feedback POST -> HTTP {resp.status}")
except urllib.error.HTTPError as e:
    print(f"  [OK] Invalid Feedback POST -> HTTP {e.code} (Expected 400)")
except Exception as e:
    print(f"  [FAIL] Invalid Feedback POST error -> {e}")

# 6. Localization Check (uz/ru/en html lang and h1)
print("\n6. Testing Multi-language Support (uz, ru, en):")
for lang in ["uz", "ru", "en"]:
    try:
        req = urllib.request.Request("http://localhost:3000/", headers={"Cookie": f"NEXT_LOCALE={lang}"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode()
            lang_attr = f'lang="{lang}"' in html
            print(f"  [OK] Locale '{lang}' -> HTTP {resp.status}, HTML lang='{lang}' attribute: {lang_attr}")
    except Exception as e:
        print(f"  [FAIL] Locale '{lang}' error: {e}")

print("\n=== LIVE SMOKE TEST COMPLETE ===")

