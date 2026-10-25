import json
import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__, template_folder="templates")
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_FILE = os.path.join(DATA_DIR, "diary_store.json")

os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_DATA = {
    "journals": [
        {
            "id": "daily",
            "name": "Daily Diary",
            "description": "Everyday thoughts, quiet reflections, and evening musings.",
            "icon": "book-heart",
            "accentColor": "#A89F91",
            "createdAt": datetime.utcnow().isoformat() + "Z"
        },
        {
            "id": "trips",
            "name": "Trips & Wanderlust",
            "description": "Travel logs, train rides, distant sights, and trail notes.",
            "icon": "compass",
            "accentColor": "#8C9A8E",
            "createdAt": datetime.utcnow().isoformat() + "Z"
        },
        {
            "id": "gratitude",
            "name": "Quiet Gratitude",
            "description": "Small blessings, warm drinks, and gentle moments of joy.",
            "icon": "sun",
            "accentColor": "#B09E8C",
            "createdAt": datetime.utcnow().isoformat() + "Z"
        }
    ],
    "entries": []
}

def load_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading database: {e}")
    save_db(DEFAULT_DATA)
    return DEFAULT_DATA

def save_db(data):
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving database: {e}")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/journals", methods=["GET"])
def get_journals():
    db = load_db()
    return jsonify({"journals": db.get("journals", [])})

@app.route("/api/journals", methods=["POST"])
def create_journal():
    req = request.get_json() or {}
    name = (req.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Journal name is required"}), 400

    db = load_db()
    now_iso = datetime.utcnow().isoformat() + "Z"
    new_journal = {
        "id": f"journal-{int(datetime.utcnow().timestamp() * 1000)}",
        "name": name,
        "description": (req.get("description") or "").strip(),
        "icon": req.get("icon", "book-open"),
        "accentColor": req.get("accentColor", "#8C9A8E"),
        "createdAt": now_iso
    }
    db.setdefault("journals", []).append(new_journal)
    save_db(db)
    return jsonify({"journal": new_journal}), 201

@app.route("/api/journals/<journal_id>", methods=["DELETE"])
def delete_journal(journal_id):
    if journal_id == "daily":
        return jsonify({"error": "Default journal cannot be deleted"}), 400

    db = load_db()
    db["journals"] = [j for j in db.get("journals", []) if j.get("id") != journal_id]
    db["entries"] = [e for e in db.get("entries", []) if e.get("journalId") != journal_id]
    save_db(db)
    return jsonify({"success": True})

@app.route("/api/entries", methods=["GET"])
def get_entries():
    journal_id = request.args.get("journalId", "all")
    db = load_db()
    entries = db.get("entries", [])
    if journal_id != "all":
        entries = [e for e in entries if e.get("journalId") == journal_id]
    entries.sort(key=lambda x: x.get("date", ""), reverse=True)
    return jsonify({"entries": entries})

@app.route("/api/entries", methods=["POST"])
def save_entry():
    req = request.get_json() or {}
    entry_id = req.get("id")
    content = req.get("content", "")
    words = len(content.split()) if content else 0
    reading_time = max(1, round(words / 180))
    now_iso = datetime.utcnow().isoformat() + "Z"

    db = load_db()
    entries = db.setdefault("entries", [])

    if entry_id:
        for idx, item in enumerate(entries):
            if item.get("id") == entry_id:
                entries[idx].update(req)
                entries[idx]["wordCount"] = words
                entries[idx]["readingTimeMinutes"] = reading_time
                entries[idx]["updatedAt"] = now_iso
                save_db(db)
                return jsonify({"entry": entries[idx]})

    new_entry = {
        "id": f"entry-{int(datetime.utcnow().timestamp() * 1000)}",
        "journalId": req.get("journalId", "daily"),
        "title": req.get("title", "Untitled Entry").strip() or "Untitled Entry",
        "content": content,
        "date": req.get("date", now_iso),
        "location": req.get("location", ""),
        "weather": req.get("weather", ""),
        "userMoodTag": req.get("userMoodTag", "peaceful"),
        "fontChoice": req.get("fontChoice", "cormorant"),
        "paperStyle": req.get("paperStyle", "warm-parchment"),
        "wordCount": words,
        "readingTimeMinutes": reading_time,
        "tags": req.get("tags", []),
        "photos": req.get("photos", []),
        "createdAt": now_iso,
        "updatedAt": now_iso
    }
    entries.insert(0, new_entry)
    save_db(db)
    return jsonify({"entry": new_entry}), 201

@app.route("/api/entries/<entry_id>", methods=["DELETE"])
def delete_entry(entry_id):
    db = load_db()
    db["entries"] = [e for e in db.get("entries", []) if e.get("id") != entry_id]
    save_db(db)
    return jsonify({"success": True})

@app.route("/api/analyze-entry", methods=["POST"])
def analyze_entry():
    req = request.get_json() or {}
    content = req.get("content", "")
    entry_id = req.get("entryId")

    if not content.strip():
        return jsonify({"error": "Content is required"}), 400

    lower = content.lower()
    if any(w in lower for w in ["joy", "happy", "laugh", "smile", "love"]):
        primary_mood = "Warm Delight"
        category = "joyful"
        score = 8.9
    elif any(w in lower for w in ["tired", "anxious", "stress", "worry", "fear"]):
        primary_mood = "Gentle Healing"
        category = "reflective"
        score = 5.8
    elif any(w in lower for w in ["thank", "grateful", "blessed", "appreciate"]):
        primary_mood = "Grateful Peace"
        category = "grateful"
        score = 9.2
    else:
        primary_mood = "Serene Contentment"
        category = "peaceful"
        score = 8.2

    analysis = {
        "primaryMood": primary_mood,
        "moodCategory": category,
        "moodScore": score,
        "emotionalSpectrum": [
            {"emotion": "Tranquility", "percentage": 65},
            {"emotion": "Perspective", "percentage": 25},
            {"emotion": "Clarity", "percentage": 10}
        ],
        "keyThemes": ["mindfulness", "observation", "daily stillness"],
        "personalizedReflection": "Your words carry a grounded appreciation for moments of balance and thoughtful reflection.",
        "soothingAdvice": "Take three deep breaths before resting tonight, honoring the steady progress of today.",
        "reflectivePrompt": "What simple sensation brought you the deepest sense of ease today?",
        "analyzedAt": datetime.utcnow().isoformat() + "Z"
    }

    if entry_id:
        db = load_db()
        for item in db.get("entries", []):
            if item.get("id") == entry_id:
                item["moodAnalysis"] = analysis
                save_db(db)
                break

    return jsonify({"analysis": analysis})

@app.route("/api/overall-insights", methods=["GET"])
def overall_insights():
    return jsonify({
        "insight": {
            "headline": "Gentle Emotional Balance & Regular Reflection",
            "summary": "Your entries reflect mindful observation, consistent journaling habits, and an evolving inner calm.",
            "weeklyTrend": "upward",
            "dominantMood": "Peaceful Calm",
            "recommendedSelfCare": "Carve out 10 quiet minutes before twilight for reflective stillness.",
            "journalingPrompt": "Which small moment of beauty did you almost overlook today?",
            "updatedAt": datetime.utcnow().isoformat() + "Z"
        }
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"SereneNotes pure Python Flask app listening on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
