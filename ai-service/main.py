from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import FileResponse, StreamingResponse
from deepface import DeepFace
import shutil
import os
import cv2
import numpy as np
import csv
from datetime import datetime
import pandas as pd
from io import BytesIO
from bson import ObjectId
from typing import List

from utils.db import students_col, photos_col
from utils.image_utils import load_image_from_source, compute_embedding, cosine_distance

app = FastAPI(title="MarkME - Face Attendance (Mongo-backed)")

TEMP_FILE = "temp_face.jpg"
ATTENDANCE_FILE = "attendance.csv"

# Configurable threshold (Facenet cosine distance). Higher = more lenient.
THRESHOLD = float(os.getenv("FACENET_THRESHOLD", "0.55"))
MIN_REFERENCES_WARNING = int(os.getenv("MIN_REFERENCES_WARNING", "1"))

# Simple in-memory cache for classroom embeddings: { classroom_id: [ {studentId,name,embedding}, ... ] }
reference_cache: dict[str, List[dict]] = {}
GLOBAL_KEY = "*ALL*"


def _parse_classroom_id(raw: str) -> str:
    if not raw:
        return raw
    trimmed = raw.strip()
    if trimmed.startswith('{') and trimmed.endswith('}'):
        try:
            import json
            obj = json.loads(trimmed)
            for key in ("$oid", "_id", "classroomId", "id"):
                if isinstance(obj, dict) and key in obj and isinstance(obj[key], str):
                    return obj[key]
        except Exception:
            return raw
    return raw


def _resolve_incoming_classroom_id(primary: str | None, alt: str | None, form_kv: dict[str, str]) -> str:
    candidates = []
    for v in (primary, alt):
        if v:
            candidates.append(v)
    for k, v in form_kv.items():
        lk = k.lower()
        if 'classroomid' in lk and v and v not in candidates:
            candidates.append(v)
    for c in candidates:
        parsed = _parse_classroom_id(c)
        if parsed:
            return parsed
    return ''


def _normalize_classroom_key(raw_id: str) -> tuple[str, ObjectId | None]:
    raw_id = _parse_classroom_id(raw_id)
    try:
        oid = ObjectId(raw_id)
        return str(oid), oid
    except Exception:
        return raw_id, None


def clear_classroom_cache(classroom_id: str):
    key, _ = _normalize_classroom_key(classroom_id)
    if key in reference_cache:
        try:
            del reference_cache[key]
        except Exception:
            pass


def mark_attendance_csv(name: str):
    today = datetime.now().strftime("%Y-%m-%d")
    time_now = datetime.now().strftime("%H:%M:%S")

    if not os.path.exists(ATTENDANCE_FILE):
        with open(ATTENDANCE_FILE, mode="w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["Name", "Date", "Time"])

    with open(ATTENDANCE_FILE, mode="r", newline="") as f:
        reader = list(csv.reader(f))

    for row in reader:
        if len(row) >= 2 and row[0] == name and row[1] == today:
            return

    with open(ATTENDANCE_FILE, mode="a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([name, today, time_now])


def get_classroom_references(classroom_id: str):
    """Fetch / build embeddings for students in a classroom."""
    cache_key, oid = _normalize_classroom_key(classroom_id)

    if cache_key in reference_cache:
        cached = reference_cache[cache_key]
        if cached:
            return cached
        else:
            try:
                del reference_cache[cache_key]
            except Exception:
                pass

    skipped_no_image = 0
    skipped_no_embedding = 0
    built = []

    # Updated query to handle existing schema (classroomId or classroomId._id)
    base_query = {"isActive": True}
    if oid:
        base_query["$or"] = [{"classroomId": oid}, {"classroomId._id": oid}]
    else:
        base_query["$or"] = [{"classroomId": classroom_id}, {"classroomId._id": classroom_id}]

    try:
        students_cursor = list(students_col.find(base_query))
    except Exception as e:
        print("get_classroom_references error primary query:", e)
        students_cursor = []

    if not students_cursor:
        try:
            students_cursor = list(students_col.find({"$or": base_query["$or"]}))
            print(f"[AI] Fallback student query used; found={len(students_cursor)}")
        except Exception as e:
            print("get_classroom_references fallback error:", e)
            students_cursor = []

    for stu in students_cursor:
        student_id = str(stu.get("_id"))
        name = (stu.get("name") or "Unknown").strip()
        photo_id = stu.get("photoId")
        path = None
        url = None
        if photo_id:
            try:
                photo_doc = photos_col.find_one({"_id": ObjectId(photo_id)})
                if photo_doc:
                    path = photo_doc.get("path")
                    url = photo_doc.get("url")
            except Exception:
                pass
        else:
            print(f"[AI] Student {student_id} missing photoId")
        img = load_image_from_source(path, url)
        if img is None:
            skipped_no_image += 1
            print(f"[AI] Photo load failed student={student_id} name={name}")
            continue
        emb = compute_embedding(img)
        if emb is None:
            skipped_no_embedding += 1
            print(f"[AI] Embedding failed student={student_id} name={name}")
            continue
        built.append({"studentId": student_id, "name": name, "embedding": emb})
        print(f"[AI] Embedded student={student_id} name={name}")

    if built:
        reference_cache[cache_key] = built
    else:
        if cache_key in reference_cache:
            try:
                del reference_cache[cache_key]
            except Exception:
                pass
        print(f"[AI] WARNING: No references built (students_found={len(students_cursor)} skipped_no_image={skipped_no_image} skipped_no_embedding={skipped_no_embedding})")

    print(f"[AI] Built references classroom={cache_key} total={len(built)} skipped_no_image={skipped_no_image} skipped_no_embedding={skipped_no_embedding}")
    if len(built) < MIN_REFERENCES_WARNING:
        print(f"[AI] DIAG: Low reference count for classroom={cache_key}. Potential causes: (1) student documents missing photoId, (2) photos collection missing matching _id, (3) image load failure (see earlier [AI-IMG] logs), (4) embedding model failure.")
    return built


def get_all_references():
    """Build embeddings for ALL active students when classroomId is omitted."""
    if GLOBAL_KEY in reference_cache and reference_cache[GLOBAL_KEY]:
        return reference_cache[GLOBAL_KEY]

    skipped_no_image = 0
    skipped_no_embedding = 0
    built = []

    try:
        students_cursor = list(students_col.find({"isActive": True}))
    except Exception as e:
        print("get_all_references primary query error:", e)
        students_cursor = []

    if not students_cursor:
        try:
            students_cursor = list(students_col.find({}))
            print(f"[AI] Global fallback student query used; found={len(students_cursor)}")
        except Exception as e:
            print("get_all_references fallback error:", e)
            students_cursor = []

    for stu in students_cursor:
        student_id = str(stu.get("_id"))
        name = (stu.get("name") or "Unknown").strip()
        photo_id = stu.get("photoId")
        path = None
        url = None
        if photo_id:
            try:
                photo_doc = photos_col.find_one({"_id": ObjectId(photo_id)})
                if photo_doc:
                    path = photo_doc.get("path")
                    url = photo_doc.get("url")
            except Exception:
                pass
        img = load_image_from_source(path, url)
        if img is None:
            skipped_no_image += 1
            continue
        emb = compute_embedding(img)
        if emb is None:
            skipped_no_embedding += 1
            continue
        built.append({"studentId": student_id, "name": name, "embedding": emb})

    if built:
        reference_cache[GLOBAL_KEY] = built
    else:
        if GLOBAL_KEY in reference_cache:
            try:
                del reference_cache[GLOBAL_KEY]
            except Exception:
                pass
        print(f"[AI] GLOBAL WARNING: No references built (students_found={len(students_cursor)} skipped_no_image={skipped_no_image} skipped_no_embedding={skipped_no_embedding})")

    print(f"[AI] Built GLOBAL references total={len(built)} skipped_no_image={skipped_no_image} skipped_no_embedding={skipped_no_embedding}")
    if len(built) < MIN_REFERENCES_WARNING:
        print("[AI] DIAG: Global reference count low. Check that student photoId fields exist and photos have valid base64 or path.")
    return built


@app.get("/download/attendance.csv")
async def download_attendance_csv():
    if not os.path.exists(ATTENDANCE_FILE):
        with open(ATTENDANCE_FILE, mode="w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["Name", "Date", "Time"])
    return FileResponse(ATTENDANCE_FILE, media_type="text/csv", filename="attendance.csv")


@app.get("/download/attendance.xlsx")
async def download_attendance_excel():
    if os.path.exists(ATTENDANCE_FILE):
        df = pd.read_csv(ATTENDANCE_FILE)
    else:
        df = pd.DataFrame(columns=["Name", "Date", "Time"])

    output_buffer = BytesIO()
    with pd.ExcelWriter(output_buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Attendance")
    output_buffer.seek(0)
    return StreamingResponse(
        output_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=attendance.xlsx"},
    )


@app.post("/refresh-classroom-cache/{classroom_id}")
async def refresh_cache(classroom_id: str):
    clear_classroom_cache(classroom_id)
    refs = get_classroom_references(classroom_id)
    return {"status": "ok", "reference_count": len(refs)}


@app.post("/mark-attendance/")
async def mark_attendance(request: Request, file: UploadFile = File(...), refresh: str | None = Form(None)):
    form = await request.form()
    form_dict = {k: v for k, v in form.items() if isinstance(v, str)}
    classroomId = _resolve_incoming_classroom_id(form_dict.get("classroomId"), form_dict.get("classroomIdObject"), form_dict)

    try:
        with open(TEMP_FILE, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        img = cv2.imread(TEMP_FILE)
        if img is None:
            return {"status": "error", "message": "Uploaded file is not a valid image"}

        faces = DeepFace.extract_faces(img_path=TEMP_FILE, detector_backend="mtcnn", enforce_detection=False)

        if refresh and str(refresh).lower() == 'true':
            if classroomId:
                clear_classroom_cache(classroomId)
            else:
                if GLOBAL_KEY in reference_cache:
                    try:
                        del reference_cache[GLOBAL_KEY]
                    except Exception:
                        pass

        if classroomId:
            references = get_classroom_references(classroomId)
            cache_key, _ = _normalize_classroom_key(classroomId)
            scope_label = f"classroom {cache_key}"

            if not references:
                print(f"[AI] classroom {cache_key} returned 0 references — falling back to GLOBAL references")
                references = get_all_references()
                scope_label = "GLOBAL (fallback)"
        else:
            references = get_all_references()
            scope_label = "GLOBAL"

        print(f"[AI] {scope_label} references loaded: {len(references)} students, faces found: {len(faces)} threshold={THRESHOLD}")
        if not references:
            return {"status": "error", "message": "No student references found", "recognized_students": [], "reference_count": 0, "scope": scope_label, "diagnostic": "No students with usable photos/embeddings. Verify photoId & photos docs."}

        recognized_students = []
        debug_distances = []

        for idx, face in enumerate(faces):
            face_img = (np.array(face["face"]) * 255).astype("uint8")
            face_emb = compute_embedding(face_img)
            if face_emb is None:
                recognized_students.append("Unknown")
                continue
            best_name = "Unknown"
            best_dist = float("inf")
            for ref in references:
                dist = cosine_distance(face_emb, ref["embedding"])
                debug_distances.append({"face": idx, "candidate": ref["name"], "dist": float(dist)})
                if dist < best_dist:
                    best_dist = dist
                    best_name = ref["name"]
            if best_dist < THRESHOLD:
                recognized_students.append(best_name)
                mark_attendance_csv(best_name)
            else:
                recognized_students.append("Unknown")
                print(f"[AI] face {idx} unknown best={best_name} dist={best_dist:.4f} >= threshold")
            print(f"[AI] face {idx} best_match={best_name} best_dist={best_dist:.4f}")

        print(f"[AI] recognized: {recognized_students}")
        return {"status": "success", "recognized_students": recognized_students, "debug": debug_distances, "threshold": THRESHOLD, "reference_count": len(references), "scope": scope_label}
    except Exception as e:
        return {"status": "error", "message": str(e), "recognized_students": [], "reference_count": 0, "scope": "GLOBAL"}


@app.get("/debug/classroom/{classroom_id}")
async def debug_classroom(classroom_id: str):
    clear_classroom_cache(classroom_id)
    refs = get_classroom_references(classroom_id)
    key, _ = _normalize_classroom_key(classroom_id)
    return {
        "classroomId": key,
        "reference_count": len(refs),
        "students_sample": [r["name"] for r in refs[:10]],
    }
