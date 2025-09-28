# utils/db.py
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()  # loads .env into environment variables

# Prefer MONGO_URI but fall back to MONGO_URL (server uses MONGO_URL)
MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")
raw_db_name = os.getenv("MONGO_DBNAME")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI or MONGO_URL not set in environment (.env)")

_client = MongoClient(MONGO_URI)

# --- Dynamic DB selection logic ---
# If URI path did not include a db AND MONGO_DBNAME not set, attempt to auto-detect.
# We try (in order): explicit name, parsed name, common names ['MarkME', 'test'] and pick the first containing a 'students' collection with documents.

def _parse_name_from_uri(uri: str) -> str | None:
    try:
        after_scheme = uri.split("//", 1)[1]
        path_part = after_scheme.split("/", 1)[1] if "/" in after_scheme else ""
        if path_part:
            candidate = path_part.split("?")[0].strip()
            if candidate:
                return candidate
    except Exception:
        return None
    return None

parsed_name = _parse_name_from_uri(MONGO_URI)

candidates = []
if raw_db_name:
    candidates.append(raw_db_name)
if parsed_name and parsed_name not in candidates:
    candidates.append(parsed_name)
# add preferred project name then default mongo 'test'
for extra in ["MarkME", "test"]:
    if extra not in candidates:
        candidates.append(extra)

chosen = None
for name in candidates:
    try:
        coll = _client[name]["students"]
        # cheap count check (avoid full scan). estimated_document_count is fine.
        count = coll.estimated_document_count()
        if count > 0:
            chosen = name
            print(f"[AI-DB] Selected database '{name}' (students count={count}) from candidates {candidates}")
            break
    except Exception:
        pass

if not chosen:
    # fallback to first candidate even if empty
    chosen = candidates[0]
    print(f"[AI-DB] No students found in any candidate DBs {candidates}. Using '{chosen}'.")

DB_NAME = chosen
_db = _client[DB_NAME]

print(f"[AI-DB] Connected to Mongo URI={MONGO_URI} USING_DB={DB_NAME}")

# Expose collections your app uses
students_col = _db["students"]
photos_col = _db["photos"]
# add other collections as needed