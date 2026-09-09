#!/usr/bin/env python3
"""HelixHog — self-hosted product analytics (PostHog-style) for the HelixOS site."""

from __future__ import annotations

import hashlib
import json
import os
import sqlite3
import threading
import time
import uuid as uuidlib
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, unquote, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
SITE = ROOT.parent
STATIC = ROOT / "static"
DATA = Path(os.environ.get("DATA_DIR") or os.environ.get("HELIXHOG_DATA") or str(ROOT / "data"))
DB_PATH = DATA / "helixhog.db"
HOST = os.environ.get("HELIXHOG_HOST", "0.0.0.0")
PORT = int(os.environ.get("HELIXHOG_PORT", os.environ.get("PORT", "8765")))
TOKEN = os.environ.get("HELIXHOG_TOKEN", "phc_helix_dental")
PUBLIC_URL = os.environ.get("HELIXHOG_PUBLIC_URL", "").rstrip("/")
META_PIXEL_ID = os.environ.get("META_PIXEL_ID", "920426713962047")
META_CAPI_TOKEN = os.environ.get("META_CAPI_TOKEN", "").strip()
META_TEST_EVENT_CODE = os.environ.get("META_TEST_EVENT_CODE", "").strip()
META_GRAPH_VERSION = os.environ.get("META_GRAPH_VERSION", "v21.0").strip() or "v21.0"

MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml",
}

BLOCKED = {".git", ".cursor", "helixhog/data", "node_modules", ".venv"}

_lock = threading.Lock()
_db: sqlite3.Connection | None = None


def db() -> sqlite3.Connection:
    global _db
    if _db is None:
        DATA.mkdir(parents=True, exist_ok=True)
        _db = sqlite3.connect(DB_PATH, check_same_thread=False)
        _db.row_factory = sqlite3.Row
        _db.execute("PRAGMA journal_mode=WAL")
        _db.execute("PRAGMA synchronous=NORMAL")
        _db.executescript(
            """
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT,
                ts INTEGER NOT NULL,
                event TEXT NOT NULL,
                distinct_id TEXT NOT NULL,
                session_id TEXT,
                pathname TEXT,
                utm_source TEXT,
                host TEXT,
                properties TEXT NOT NULL DEFAULT '{}'
            );
            CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
            CREATE INDEX IF NOT EXISTS idx_events_event ON events(event);
            CREATE INDEX IF NOT EXISTS idx_events_person ON events(distinct_id);
            CREATE INDEX IF NOT EXISTS idx_events_path ON events(pathname);
            CREATE TABLE IF NOT EXISTS quiz_sessions (
                session_id TEXT PRIMARY KEY,
                distinct_id TEXT,
                status TEXT,
                last_question INTEGER DEFAULT 0,
                answers TEXT NOT NULL DEFAULT '{}',
                first_name TEXT,
                email TEXT,
                phone TEXT,
                company TEXT,
                guide_id TEXT,
                utm_source TEXT,
                utm_medium TEXT,
                utm_campaign TEXT,
                utm_content TEXT,
                referrer TEXT,
                pathname TEXT,
                email_submitted INTEGER DEFAULT 0,
                cta_book INTEGER DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_quiz_updated ON quiz_sessions(updated_at);
            CREATE INDEX IF NOT EXISTS idx_quiz_email ON quiz_sessions(email);
            """
        )
        quiz_cols = {r[1] for r in _db.execute("PRAGMA table_info(quiz_sessions)")}
        if "phone" not in quiz_cols:
            _db.execute("ALTER TABLE quiz_sessions ADD COLUMN phone TEXT")
        if "company" not in quiz_cols:
            _db.execute("ALTER TABLE quiz_sessions ADD COLUMN company TEXT")
        if "funnel" not in quiz_cols:
            _db.execute("ALTER TABLE quiz_sessions ADD COLUMN funnel TEXT")
        event_cols = {r[1] for r in _db.execute("PRAGMA table_info(events)")}
        if "host" not in event_cols:
            _db.execute("ALTER TABLE events ADD COLUMN host TEXT")
        _db.execute("CREATE INDEX IF NOT EXISTS idx_events_host ON events(host)")
        _db.commit()
    return _db


def now_ms() -> int:
    return int(time.time() * 1000)


def range_ms(raw: str | None) -> int:
    table = {"24h": 24, "7d": 24 * 7, "30d": 24 * 30, "90d": 24 * 90}
    hours = table.get((raw or "7d").lower(), 24 * 7)
    return now_ms() - hours * 3600 * 1000


def parse_props(raw: str | dict | None) -> dict:
    if isinstance(raw, dict):
        return raw
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def insert_event(item: dict) -> None:
    props = parse_props(item.get("properties"))
    event = (item.get("event") or "$pageview").strip()[:200]
    distinct = str(item.get("distinct_id") or props.get("distinct_id") or "anonymous")[:200]
    session = str(props.get("$session_id") or item.get("session_id") or "")[:200]
    pathname = str(props.get("$pathname") or props.get("pathname") or "")[:500]
    utm = str(props.get("utm_source") or props.get("$utm_source") or "")[:200]
    ts = item.get("timestamp")
    if isinstance(ts, (int, float)):
        ts_ms = int(ts if ts > 1e12 else ts * 1000)
    elif isinstance(ts, str) and ts:
        try:
            ts_ms = int(datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp() * 1000)
        except ValueError:
            ts_ms = now_ms()
    else:
        ts_ms = now_ms()
    uuid = str(item.get("uuid") or props.get("$insert_id") or f"{distinct}-{ts_ms}-{event}")[:120]
    host = str(props.get("$host") or props.get("host") or "")[:200]
    with _lock:
        conn = db()
        conn.execute(
            """INSERT INTO events (uuid, ts, event, distinct_id, session_id, pathname, utm_source, host, properties)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (uuid, ts_ms, event, distinct, session, pathname, utm, host, json.dumps(props, ensure_ascii=False)),
        )
        conn.commit()


def ingest_payload(payload: dict) -> int:
    batch = payload.get("batch")
    if isinstance(batch, list):
        n = 0
        for item in batch:
            if isinstance(item, dict):
                insert_event(item)
                n += 1
        return n
    if payload.get("event"):
        insert_event(payload)
        return 1
    return 0


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _hash_email(value: str | None) -> str | None:
    raw = (value or "").strip().lower()
    return _sha256(raw) if raw else None


def _hash_phone(value: str | None) -> str | None:
    digits = "".join(c for c in (value or "") if c.isdigit())
    return _sha256(digits) if digits else None


def _hash_name(value: str | None) -> str | None:
    raw = (value or "").strip().lower()
    return _sha256(raw) if raw else None


def cookie_from_header(cookie_header: str, name: str) -> str:
    if not cookie_header:
        return ""
    for part in cookie_header.split(";"):
        if "=" not in part:
            continue
        key, val = part.strip().split("=", 1)
        if key == name:
            return val.strip()
    return ""


def request_client_ip(headers, fallback: str = "") -> str:
    for key in ("Fly-Client-IP", "CF-Connecting-IP", "X-Real-IP"):
        raw = (headers.get(key) or "").strip()
        if raw:
            return raw.split(",")[0].strip()
    xff = (headers.get("X-Forwarded-For") or "").strip()
    if xff:
        return xff.split(",")[0].strip()
    return fallback


def capi_configured() -> bool:
    return bool(META_CAPI_TOKEN and META_PIXEL_ID)


def build_capi_user_data(payload: dict, headers, fallback_ip: str = "") -> dict:
    cookies = headers.get("Cookie") or ""
    fbp = str(payload.get("fbp") or cookie_from_header(cookies, "_fbp") or "").strip()
    fbc = str(payload.get("fbc") or cookie_from_header(cookies, "_fbc") or "").strip()
    ua = str(payload.get("client_user_agent") or headers.get("User-Agent") or "").strip()
    ip = str(payload.get("client_ip_address") or request_client_ip(headers, fallback_ip)).strip()
    user: dict = {}
    if ip:
        user["client_ip_address"] = ip
    if ua:
        user["client_user_agent"] = ua[:1024]
    if fbp:
        user["fbp"] = fbp[:200]
    if fbc:
        user["fbc"] = fbc[:500]
    em = _hash_email(payload.get("email"))
    ph = _hash_phone(payload.get("phone"))
    fn = _hash_name(payload.get("first_name") or payload.get("fn"))
    ln = _hash_name(payload.get("last_name") or payload.get("ln"))
    if em:
        user["em"] = [em]
    if ph:
        user["ph"] = [ph]
    if fn:
        user["fn"] = [fn]
    if ln:
        user["ln"] = [ln]
    return user


def allowed_capi_source(event_source_url: str, request_host: str, event_name: str = "PageView") -> bool:
    parsed = urlparse(event_source_url or "")
    if parsed.scheme not in {"http", "https"}:
        return False
    src = (parsed.hostname or "").lower()
    req = (request_host or "").split(":")[0].lower()
    if src not in {req, "localhost", "127.0.0.1"}:
        return False
    path = parsed.path or "/"
    if path == "/hog" or path.startswith("/hog/") or path.startswith("/hog.js"):
        return False
    if event_name == "Lead":
        return "/thank-you" in path
    return event_name == "PageView"


def post_capi_event(event: dict, test_event_code: str = "") -> dict:
    if not capi_configured():
        return {"ok": False, "error": "not_configured"}
    body: dict = {"data": [event], "access_token": META_CAPI_TOKEN}
    code = (test_event_code or META_TEST_EVENT_CODE).strip()
    if code:
        body["test_event_code"] = code
    url = f"https://graph.facebook.com/{META_GRAPH_VERSION}/{META_PIXEL_ID}/events"
    raw = json.dumps(body).encode("utf-8")
    req = Request(url, data=raw, method="POST", headers={"Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=8) as resp:
            parsed = json.loads(resp.read().decode("utf-8", errors="replace") or "{}")
        return {"ok": True, "meta": parsed}
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        print(f"[helixhog] Meta CAPI HTTP {exc.code}: {detail}", flush=True)
        return {"ok": False, "error": f"http_{exc.code}"}
    except (URLError, TimeoutError, json.JSONDecodeError) as exc:
        print(f"[helixhog] Meta CAPI failed: {exc}", flush=True)
        return {"ok": False, "error": "upstream"}


def queue_capi_event(event: dict) -> None:
    threading.Thread(target=post_capi_event, args=(event,), daemon=True).start()


def capi_event(payload: dict, headers, request_host: str, fallback_ip: str = "", default_name: str = "PageView") -> tuple[dict, int]:
    if not capi_configured():
        return {"ok": False, "configured": False, "error": "not_configured"}, 503
    name = str(payload.get("event_name") or default_name).strip()
    if name not in {"PageView", "Lead"}:
        return {"ok": False, "configured": True, "error": "bad_event"}, 400
    source = str(payload.get("event_source_url") or headers.get("Referer") or "").strip()[:2048]
    if not allowed_capi_source(source, request_host, name):
        proto = "https" if (headers.get("X-Forwarded-Proto") or "http") == "https" else "http"
        fallback_path = "/thank-you/" if name == "Lead" else "/"
        source = f"{proto}://{request_host}{fallback_path}"
        if not allowed_capi_source(source, request_host, name):
            return {"ok": False, "configured": True, "error": "bad_source"}, 400
    event_id = str(payload.get("event_id") or uuidlib.uuid4()).strip()[:120]
    event = {
        "event_name": name,
        "event_time": int(time.time()),
        "event_id": event_id,
        "event_source_url": source,
        "action_source": "website",
        "user_data": build_capi_user_data(payload, headers, fallback_ip),
    }
    queue_capi_event(event)
    return {"ok": True, "configured": True, "queued": True, "event_id": event_id, "event_name": name}, 200


def capi_lead_event(payload: dict, headers, request_host: str, fallback_ip: str = "") -> tuple[dict, int]:
    payload = dict(payload or {})
    payload["event_name"] = "Lead"
    return capi_event(payload, headers, request_host, fallback_ip, default_name="Lead")


def rows_since(since: int, event: str | None = None) -> list[sqlite3.Row]:
    conn = db()
    if event:
        return list(conn.execute("SELECT * FROM events WHERE ts >= ? AND event = ? ORDER BY ts ASC", (since, event)))
    return list(conn.execute("SELECT * FROM events WHERE ts >= ? ORDER BY ts ASC", (since,)))


def overview(since: int) -> dict:
    conn = db()
    rows = list(conn.execute("SELECT event, distinct_id, session_id, pathname, utm_source, host, properties FROM events WHERE ts >= ?", (since,)))
    persons = set()
    sessions = set()
    pageviews = 0
    leads = 0
    autoclicks = 0
    scrolls = 0
    forms = 0
    errors = 0
    pages: dict[str, int] = {}
    sources: dict[str, int] = {}
    sites: dict[str, dict] = {}
    for r in rows:
        persons.add(r["distinct_id"])
        if r["session_id"]:
            sessions.add(r["session_id"])
        props = parse_props(r["properties"])
        host = r["host"] or props.get("$host") or "unknown"
        site = sites.setdefault(host, {"host": host, "pageviews": 0, "visitors": set(), "clicks": 0, "leads": 0})
        site["visitors"].add(r["distinct_id"])
        if r["event"] == "$pageview":
            pageviews += 1
            site["pageviews"] += 1
            key = r["pathname"] or "/"
            pages[key] = pages.get(key, 0) + 1
            src = r["utm_source"] or props.get("$referring_domain") or ("direct" if not props.get("$referrer") else props.get("$referring_domain") or "referral")
            if not src:
                src = "direct"
            sources[src] = sources.get(src, 0) + 1
        if r["event"] in ("lead", "$lead"):
            leads += 1
            site["leads"] += 1
        if r["event"] in ("$autocapture", "click"):
            autoclicks += 1
            site["clicks"] += 1
        if r["event"] == "$scroll":
            scrolls += 1
        if r["event"] == "$submit":
            forms += 1
        if r["event"] == "$exception":
            errors += 1
    visitors = len(persons)
    site_rows = []
    for s in sites.values():
        site_rows.append(
            {
                "host": s["host"],
                "pageviews": s["pageviews"],
                "visitors": len(s["visitors"]),
                "clicks": s["clicks"],
                "leads": s["leads"],
            }
        )
    site_rows.sort(key=lambda x: -x["pageviews"])
    return {
        "visitors": visitors,
        "sessions": len(sessions) or visitors,
        "pageviews": pageviews,
        "leads": leads,
        "clicks": autoclicks,
        "scrolls": scrolls,
        "forms": forms,
        "errors": errors,
        "conversion_rate": round((leads / visitors) * 100, 1) if visitors else 0,
        "pages": sorted(({"path": k, "views": v} for k, v in pages.items()), key=lambda x: -x["views"])[:20],
        "sources": sorted(({"source": k, "visitors": v} for k, v in sources.items()), key=lambda x: -x["visitors"])[:20],
        "sites": site_rows[:40],
    }


def trends(since: int, event: str, interval: str) -> dict:
    step = 3600000 if interval == "hour" else 86400000
    buckets: dict[int, int] = {}
    for (ts,) in db().execute("SELECT ts FROM events WHERE ts >= ? AND event = ?", (since, event)):
        b = (ts // step) * step
        buckets[b] = buckets.get(b, 0) + 1
    start = (since // step) * step
    end = (now_ms() // step) * step
    labels = []
    values = []
    t = start
    while t <= end:
        labels.append(datetime.fromtimestamp(t / 1000, tz=timezone.utc).strftime("%m/%d %H:%M" if interval == "hour" else "%b %d"))
        values.append(buckets.get(t, 0))
        t += step
    return {"labels": labels, "values": values, "event": event, "total": sum(values)}


def funnel(since: int, steps: list[str]) -> dict:
    by_person: dict[str, list[tuple[int, str]]] = {}
    q = f"SELECT distinct_id, ts, event FROM events WHERE ts >= ? AND event IN ({','.join('?' * len(steps))}) ORDER BY ts ASC"
    for did, ts, event in db().execute(q, [since, *steps]):
        by_person.setdefault(did, []).append((ts, event))
    counts = [0] * len(steps)
    for evs in by_person.values():
        reached = -1
        for ts, event in evs:
            nxt = reached + 1
            if nxt < len(steps) and event == steps[nxt]:
                reached = nxt
                if reached == len(steps) - 1:
                    break
        for i in range(reached + 1):
            counts[i] += 1
    result = []
    for i, name in enumerate(steps):
        prev = counts[i - 1] if i else counts[0]
        conv = round((counts[i] / prev) * 100, 1) if prev else 0
        result.append({"event": name, "count": counts[i], "conversion": conv if i else 100})
    return {"steps": result}


def heatmap(since: int, pathname: str) -> dict:
    points = []
    for row in db().execute(
        "SELECT properties, pathname FROM events WHERE ts >= ? AND event IN ('$autocapture','click')",
        (since,),
    ):
        if pathname and (row["pathname"] or "/") != pathname:
            continue
        props = parse_props(row["properties"])
        try:
            x = float(props.get("$x_percent", props.get("x_percent")))
            y = float(props.get("$y_percent", props.get("y_percent")))
        except (TypeError, ValueError):
            continue

        def num(*keys):
            for k in keys:
                try:
                    return float(props.get(k))
                except (TypeError, ValueError):
                    pass
            return None

        points.append(
            {
                "x": x,
                "y": y,
                "px": num("$x", "x"),
                "py": num("$y", "y"),
                "vw": num("$viewport_width"),
                "selector": props.get("$elements") or "",
                "href": props.get("href") or "",
                "text": props.get("$el_text") or props.get("el_text") or "",
            }
        )
    paths = [
        r[0]
        for r in db().execute(
            "SELECT pathname, COUNT(*) c FROM events WHERE ts >= ? AND event IN ('$autocapture','click') AND pathname != '' GROUP BY pathname ORDER BY c DESC",
            (since,),
        )
    ]
    return {"points": points[:4000], "paths": paths}


def event_list(since: int, limit: int, offset: int, event: str | None) -> dict:
    conn = db()
    if event:
        total = conn.execute("SELECT COUNT(*) FROM events WHERE ts >= ? AND event = ?", (since, event)).fetchone()[0]
        rows = conn.execute(
            "SELECT ts, event, distinct_id, session_id, pathname, utm_source, host, properties FROM events WHERE ts >= ? AND event = ? ORDER BY ts DESC LIMIT ? OFFSET ?",
            (since, event, limit, offset),
        )
    else:
        total = conn.execute("SELECT COUNT(*) FROM events WHERE ts >= ?", (since,)).fetchone()[0]
        rows = conn.execute(
            "SELECT ts, event, distinct_id, session_id, pathname, utm_source, host, properties FROM events WHERE ts >= ? ORDER BY ts DESC LIMIT ? OFFSET ?",
            (since, limit, offset),
        )
    items = []
    for r in rows:
        items.append(
            {
                "ts": r["ts"],
                "event": r["event"],
                "distinct_id": r["distinct_id"],
                "session_id": r["session_id"],
                "pathname": r["pathname"],
                "utm_source": r["utm_source"],
                "host": r["host"] or "",
                "properties": parse_props(r["properties"]),
            }
        )
    events = [r[0] for r in conn.execute("SELECT event, COUNT(*) c FROM events WHERE ts >= ? GROUP BY event ORDER BY c DESC", (since,))]
    return {"items": items, "total": total, "events": events}


def persons(since: int) -> dict:
    conn = db()
    rows = list(conn.execute("SELECT * FROM events WHERE ts >= ? ORDER BY ts ASC", (since,)))
    bag: dict[str, dict] = {}
    for r in rows:
        p = bag.setdefault(
            r["distinct_id"],
            {
                "distinct_id": r["distinct_id"],
                "first_seen": r["ts"],
                "last_seen": r["ts"],
                "events": 0,
                "pageviews": 0,
                "leads": 0,
                "source": r["utm_source"] or "",
                "path": r["pathname"] or "",
                "host": r["host"] or "",
            },
        )
        p["last_seen"] = r["ts"]
        p["events"] += 1
        if r["host"] and not p.get("host"):
            p["host"] = r["host"]
        if r["event"] == "$pageview":
            p["pageviews"] += 1
            if not p["path"]:
                p["path"] = r["pathname"] or ""
        if r["event"] in ("lead", "$lead"):
            p["leads"] += 1
        if not p["source"] and r["utm_source"]:
            p["source"] = r["utm_source"]
        if not p["source"]:
            props = parse_props(r["properties"])
            p["source"] = props.get("$referring_domain") or p["source"]
    quiz_by_person: dict[str, list] = {}
    for row in conn.execute(
        "SELECT * FROM quiz_sessions WHERE updated_at >= ? AND distinct_id != '' ORDER BY updated_at DESC",
        (since,),
    ):
        payload = session_payload(row)
        quiz_by_person.setdefault(row["distinct_id"], []).append(payload)

    for pid, p in bag.items():
        subs = quiz_by_person.get(pid, [])
        if subs:
            p["quiz_sessions"] = subs
            latest = subs[0]
            p["quiz_email"] = latest.get("email") or ""
            p["quiz_name"] = latest.get("first_name") or ""
            p["quiz_company"] = latest.get("company") or ""
            p["quiz_funnel"] = latest.get("funnel_label") or ""
            p["quiz_answers"] = latest.get("answers_detail") or []

    out = sorted(bag.values(), key=lambda x: -x["last_seen"])[:200]
    return {"items": out}


def event_names(since: int) -> list[str]:
    return [r[0] for r in db().execute("SELECT event, COUNT(*) c FROM events WHERE ts >= ? GROUP BY event ORDER BY c DESC", (since,))]


QUIZ_QUESTIONS: list[tuple[str, str]] = [
    ("workflow_pain", "What's the biggest workflow bottleneck in your practice right now?"),
    ("staff_dependency", "How dependent is your admin operation on specific people?"),
    ("pms_software", "What practice management software do you currently use?"),
    ("pms_integration", "How important is it that automation writes directly into your PMS?"),
    ("dev_team_interest", "Would you be interested in hiring a development team to handle the technical side for you?"),
]
QUIZ_QUESTION_IDS = [q[0] for q in QUIZ_QUESTIONS]
FUNNEL_LABELS = {
    "workflow-assessment": "Assessment (/quiz/)",
    "workflow-guide-quiz": "Guide funnel (/quiz/guide/)",
    "ai-optimization-quiz": "Legacy quiz",
}


def session_funnel(row: sqlite3.Row | dict) -> str:
    raw = ""
    if isinstance(row, dict):
        raw = str(row.get("funnel") or "")
        pathname = str(row.get("pathname") or "")
    else:
        raw = str(row["funnel"] or "") if "funnel" in row.keys() else ""
        pathname = str(row["pathname"] or "")
    if raw:
        return raw
    if "/quiz/guide" in pathname:
        return "workflow-guide-quiz"
    if "/quiz" in pathname:
        return "workflow-assessment"
    return "unknown"


def format_answer_rows(answers: dict) -> list[dict]:
    rows = []
    for qid, title in QUIZ_QUESTIONS:
        ans = answers.get(qid)
        if isinstance(ans, dict) and (ans.get("id") or ans.get("label")):
            rows.append(
                {
                    "question_id": qid,
                    "question": title,
                    "answer_id": str(ans.get("id") or ""),
                    "answer": str(ans.get("label") or ans.get("id") or ""),
                }
            )
    return rows


def session_payload(row: sqlite3.Row) -> dict:
    answers = parse_props(row["answers"])
    answer_rows = format_answer_rows(answers)
    funnel = session_funnel(row)
    return {
        "session_id": row["session_id"],
        "distinct_id": row["distinct_id"] or "",
        "funnel": funnel,
        "funnel_label": FUNNEL_LABELS.get(funnel, funnel),
        "pathname": row["pathname"] or "",
        "status": row["status"] or "",
        "first_name": row["first_name"] or "",
        "email": row["email"] or "",
        "phone": row["phone"] or "",
        "company": row["company"] or "",
        "guide_id": row["guide_id"] or "",
        "utm_source": row["utm_source"] or "direct",
        "utm_medium": row["utm_medium"] or "",
        "utm_campaign": row["utm_campaign"] or "",
        "referrer": row["referrer"] or "",
        "email_submitted": bool(row["email_submitted"]),
        "cta_book": bool(row["cta_book"]),
        "answers": answers,
        "answers_detail": answer_rows,
        "questions_answered": len(answer_rows),
        "questions_total": len(QUIZ_QUESTIONS),
        "updated_at": row["updated_at"],
        "created_at": row["created_at"],
    }


def quiz_stats_for_sessions(sessions: list[sqlite3.Row], conn: sqlite3.Connection, since: int) -> dict:
    q_ids = QUIZ_QUESTION_IDS
    reached = {qid: 0 for qid in q_ids}
    dist: dict[str, dict[str, int]] = {qid: {} for qid in q_ids}
    viewed = started = completed = emails = guides = books = 0
    by_source: dict[str, int] = {}
    submissions: list[dict] = []

    for s in sessions:
        viewed += 1
        answers = parse_props(s["answers"])
        has_answers = any(isinstance(answers.get(qid), dict) and answers[qid].get("id") for qid in q_ids)
        if s["status"] not in ("intro",) or has_answers:
            started += 1
        for qid in q_ids:
            ans = answers.get(qid)
            if isinstance(ans, dict) and ans.get("id"):
                reached[qid] += 1
                key = str(ans.get("label") or ans.get("id"))
                dist[qid][key] = dist[qid].get(key, 0) + 1
        if s["status"] in ("capture", "done") or len(format_answer_rows(answers)) >= len(q_ids):
            completed += 1
        if s["email_submitted"] or s["email"]:
            emails += 1
        if s["guide_id"] or s["status"] == "done":
            guides += 1
        if s["cta_book"]:
            books += 1
        src = s["utm_source"] or "direct"
        by_source[src] = by_source.get(src, 0) + 1
        if has_answers or s["email"] or s["status"] in ("capture", "done"):
            submissions.append(session_payload(s))

    event_steps = ["quiz_view", "quiz_start", "quiz_complete", "quiz_email_submit", "quiz_guide_view", "quiz_cta_click"]
    event_funnel = funnel(since, event_steps)

    q_viewed: dict[int, int] = {}
    for row in conn.execute(
        "SELECT properties, distinct_id FROM events WHERE ts >= ? AND event = 'quiz_question_viewed'",
        (since,),
    ):
        props = parse_props(row["properties"])
        try:
            idx = int(props.get("question_index") or 0)
        except (TypeError, ValueError):
            idx = 0
        if idx:
            q_viewed[idx] = q_viewed.get(idx, 0) + 1

    question_funnel = []
    prev = viewed or started or 1
    for i, (qid, title) in enumerate(QUIZ_QUESTIONS, start=1):
        count = reached[qid] or q_viewed.get(i, 0)
        conv = round((count / prev) * 100, 1) if prev else 0
        question_funnel.append({"id": qid, "title": title, "index": i, "count": count, "conversion": conv})
        prev = count or prev

    distributions = []
    for qid, title in QUIZ_QUESTIONS:
        items = sorted(({"label": k, "count": v} for k, v in dist[qid].items()), key=lambda x: -x["count"])
        distributions.append({"question_id": qid, "question_title": title, "answers": items})

    submissions.sort(key=lambda x: x["updated_at"], reverse=True)

    return {
        "sessions": viewed,
        "started": started,
        "completed": completed,
        "emails": emails,
        "guides": guides,
        "book_clicks": books,
        "start_rate": round((started / viewed) * 100, 1) if viewed else 0,
        "complete_rate": round((completed / started) * 100, 1) if started else 0,
        "email_rate": round((emails / completed) * 100, 1) if completed else 0,
        "question_funnel": question_funnel,
        "event_funnel": event_funnel,
        "distributions": distributions,
        "sources": sorted(({"source": k, "count": v} for k, v in by_source.items()), key=lambda x: -x["count"]),
        "submissions": submissions[:200],
        "leads": [s for s in submissions if s["email"]][:100],
    }


def upsert_quiz(payload: dict) -> dict:
    sid = str(payload.get("session_id") or "").strip()[:120]
    if not sid:
        return {"ok": False, "error": "session_id required"}
    answers = payload.get("answers") if isinstance(payload.get("answers"), dict) else {}
    ts = now_ms()
    email = str(payload.get("email") or "")[:200]
    phone = str(payload.get("phone") or "")[:40]
    company = str(payload.get("company") or payload.get("company_name") or "")[:160]
    name = str(payload.get("first_name") or payload.get("name") or "")[:120]
    funnel_name = str(payload.get("funnel") or "")[:80]
    conn = db()
    with _lock:
        row = conn.execute("SELECT * FROM quiz_sessions WHERE session_id = ?", (sid,)).fetchone()
        email_submitted = 1 if payload.get("email_submitted") or email else (row["email_submitted"] if row else 0)
        cta_book = 1 if payload.get("cta_book") else (row["cta_book"] if row else 0)
        if row:
            conn.execute(
                """UPDATE quiz_sessions SET
                    distinct_id=?, status=?, last_question=?, answers=?, first_name=?, email=?,
                    phone=?, company=?, funnel=?,
                    guide_id=?, utm_source=?, utm_medium=?, utm_campaign=?, utm_content=?,
                    referrer=?, pathname=?, email_submitted=?, cta_book=?, updated_at=?
                   WHERE session_id=?""",
                (
                    str(payload.get("distinct_id") or row["distinct_id"] or "")[:200],
                    str(payload.get("status") or row["status"] or "")[:40],
                    int(payload.get("last_question") or 0),
                    json.dumps(answers, ensure_ascii=False),
                    name or (row["first_name"] or ""),
                    email or (row["email"] or ""),
                    phone or (row["phone"] or ""),
                    company or (row["company"] or ""),
                    funnel_name or (row["funnel"] if "funnel" in row.keys() else "") or "",
                    str(payload.get("guide_id") or row["guide_id"] or "")[:80],
                    str(payload.get("utm_source") or row["utm_source"] or "")[:200],
                    str(payload.get("utm_medium") or row["utm_medium"] or "")[:200],
                    str(payload.get("utm_campaign") or row["utm_campaign"] or "")[:200],
                    str(payload.get("utm_content") or row["utm_content"] or "")[:200],
                    str(payload.get("referrer") or row["referrer"] or "")[:500],
                    str(payload.get("pathname") or row["pathname"] or "")[:300],
                    email_submitted,
                    cta_book,
                    ts,
                    sid,
                ),
            )
        else:
            conn.execute(
                """INSERT INTO quiz_sessions (
                    session_id, distinct_id, status, last_question, answers, first_name, email,
                    phone, company, funnel,
                    guide_id, utm_source, utm_medium, utm_campaign, utm_content, referrer,
                    pathname, email_submitted, cta_book, created_at, updated_at
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    sid,
                    str(payload.get("distinct_id") or "")[:200],
                    str(payload.get("status") or "intro")[:40],
                    int(payload.get("last_question") or 0),
                    json.dumps(answers, ensure_ascii=False),
                    name,
                    email,
                    phone,
                    company,
                    funnel_name,
                    str(payload.get("guide_id") or "")[:80],
                    str(payload.get("utm_source") or "")[:200],
                    str(payload.get("utm_medium") or "")[:200],
                    str(payload.get("utm_campaign") or "")[:200],
                    str(payload.get("utm_content") or "")[:200],
                    str(payload.get("referrer") or "")[:500],
                    str(payload.get("pathname") or "")[:300],
                    email_submitted,
                    cta_book,
                    ts,
                    ts,
                ),
            )
        conn.commit()
    return {"ok": True, "session_id": sid}


def quiz_report(since: int) -> dict:
    conn = db()
    sessions = list(conn.execute("SELECT * FROM quiz_sessions WHERE updated_at >= ? ORDER BY updated_at DESC", (since,)))
    overall = quiz_stats_for_sessions(sessions, conn, since)
    by_funnel: dict[str, dict] = {}
    funnel_groups: dict[str, list] = {}
    for s in sessions:
        key = session_funnel(s)
        funnel_groups.setdefault(key, []).append(s)
    for key, group in funnel_groups.items():
        stats = quiz_stats_for_sessions(group, conn, since)
        stats.pop("event_funnel", None)
        stats["label"] = FUNNEL_LABELS.get(key, key)
        by_funnel[key] = stats
    overall["by_funnel"] = by_funnel
    overall["funnels"] = [
        {"id": k, "label": FUNNEL_LABELS.get(k, k), **{m: v.get(m, 0) for m in ("sessions", "started", "completed", "emails")}}
        for k, v in sorted(by_funnel.items(), key=lambda x: -x[1].get("sessions", 0))
    ]
    return overall


def quiz_session_lookup(session_id: str) -> dict | None:
    row = db().execute("SELECT * FROM quiz_sessions WHERE session_id = ?", (session_id,)).fetchone()
    if not row:
        return None
    return session_payload(row)


class Handler(BaseHTTPRequestHandler):
    server_version = "HelixHog/1.0"

    def log_message(self, fmt: str, *args) -> None:
        sys_stderr = __import__("sys").stderr
        sys_stderr.write("[helixhog] " + (fmt % args) + "\n")

    def cors(self) -> None:
        origin = self.headers.get("Origin") or "*"
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header("Vary", "Origin")

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.cors()
        self.end_headers()

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        if not raw:
            return {}
        try:
            return json.loads(raw.decode("utf-8", errors="replace"))
        except json.JSONDecodeError:
            return {}

    def send_json(self, data, status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def send_bytes(self, data: bytes, content_type: str, status: int = 200) -> None:
        self.send_response(status)
        self.cors()
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        if content_type.startswith("text/html") or content_type.startswith("application/javascript"):
            self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def redirect(self, location: str, status: int = 301) -> None:
        self.send_response(status)
        self.cors()
        self.send_header("Location", location)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_POST(self) -> None:
        path = urlparse(self.path).path.rstrip("/") or "/"
        if path in {"/capi/lead", "/meta/capi/lead", "/capi/event", "/capi/pageview"}:
            payload = self.read_json()
            if not isinstance(payload, dict):
                payload = {}
            host = (self.headers.get("Host") or "").split(",")[0].strip()
            fallback_ip = self.client_address[0] if self.client_address else ""
            default = "Lead" if path.endswith("lead") else "PageView"
            if path.endswith("pageview"):
                payload["event_name"] = "PageView"
            result, status = capi_event(payload, self.headers, host, fallback_ip, default_name=default)
            self.send_json(result, status)
            return
        if path in {"/quiz/progress", "/quiz/lead"}:
            payload = self.read_json()
            result = upsert_quiz(payload)
            self.send_json(result, 200 if result.get("ok") else 400)
            return
        if path in {"/e", "/batch", "/capture", "/i/v0/e", "/i/v0/e"}:
            payload = self.read_json()
            key = payload.get("api_key") or payload.get("apiKey") or ""
            if key and key != TOKEN:
                self.send_json({"status": 0, "error": "invalid api_key"}, 401)
                return
            n = ingest_payload(payload)
            self.send_json({"status": 1, "captured": n})
            return
        self.send_json({"error": "not found"}, 404)

    def do_HEAD(self) -> None:
        self.do_GET()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        qs = parse_qs(parsed.query)
        if path.startswith("/api/"):
            self.api(path, qs)
            return
        if path == "/e" or path.startswith("/e/"):
            self.send_json({"ok": True, "service": "helixhog"})
            return
        if path in {"/hog.js", "/js/helixhog.js"}:
            self.send_bytes(self.tracker_js(), "application/javascript; charset=utf-8")
            return
        if path == "/hog" or path.startswith("/hog/"):
            self.hog_file(path)
            return
        self.site_file(path)

    def api(self, path: str, qs: dict) -> None:
        since = range_ms(qs.get("range", ["7d"])[0])
        if path == "/api/overview":
            self.send_json(overview(since))
            return
        if path == "/api/trends":
            event = qs.get("event", ["$pageview"])[0]
            interval = qs.get("interval", ["day"])[0]
            self.send_json(trends(since, event, interval))
            return
        if path == "/api/funnel":
            steps = qs.get("steps", ["$pageview,book_continue,lead"])[0].split(",")
            steps = [s.strip() for s in steps if s.strip()]
            self.send_json(funnel(since, steps))
            return
        if path == "/api/heatmap":
            pathname = qs.get("path", [""])[0]
            self.send_json(heatmap(since, pathname))
            return
        if path == "/api/events":
            event = qs.get("event", [None])[0] or None
            limit = min(int(qs.get("limit", ["50"])[0]), 200)
            offset = int(qs.get("offset", ["0"])[0])
            self.send_json(event_list(since, limit, offset, event))
            return
        if path == "/api/persons":
            self.send_json(persons(since))
            return
        if path == "/api/event-names":
            self.send_json({"events": event_names(since)})
            return
        if path == "/api/quiz":
            self.send_json(quiz_report(since))
            return
        if path.startswith("/api/quiz/session/"):
            sid = path.split("/api/quiz/session/", 1)[1].strip("/")
            detail = quiz_session_lookup(sid) if sid else None
            if not detail:
                self.send_json({"error": "not found"}, 404)
                return
            self.send_json(detail)
            return
        if path == "/api/config":
            self.send_json({"origin": self.public_origin(), "snippet": self.snippet()})
            return
        self.send_json({"error": "not found"}, 404)

    def public_origin(self) -> str:
        if PUBLIC_URL:
            return PUBLIC_URL
        proto = self.headers.get("X-Forwarded-Proto") or "http"
        host = self.headers.get("Host") or f"{HOST}:{PORT}"
        return f"{proto}://{host}"

    def snippet(self) -> str:
        origin = self.public_origin()
        return f'<script src="{origin}/hog.js" async></script>'

    def tracker_js(self) -> bytes:
        raw = (SITE / "js" / "helixhog.js").read_text(encoding="utf-8")
        origin = self.public_origin()
        preamble = f"window.HELIXHOG_API_HOST=window.HELIXHOG_API_HOST||{json.dumps(origin)};\n"
        return (preamble + raw).encode("utf-8")

    def hog_file(self, path: str) -> None:
        rel = path[len("/hog") :].lstrip("/") or "index.html"
        if rel in {"", "/"}:
            rel = "index.html"
        target = (STATIC / rel).resolve()
        if not str(target).startswith(str(STATIC.resolve())) or not target.is_file():
            self.send_json({"error": "not found"}, 404)
            return
        self.send_bytes(target.read_bytes(), MIME.get(target.suffix, "application/octet-stream"))

    def site_file(self, path: str) -> None:
        rel = path.lstrip("/") or "index.html"
        if any(part in BLOCKED for part in Path(rel).parts) or rel.startswith("."):
            self.send_json({"error": "forbidden"}, 403)
            return
        target = (SITE / rel).resolve()
        site_root = SITE.resolve()
        if not str(target).startswith(str(site_root)):
            self.send_json({"error": "forbidden"}, 403)
            return
        if target.is_dir():
            if not path.endswith("/"):
                dest = path + "/"
                qs = urlparse(self.path).query
                if qs:
                    dest += "?" + qs
                self.redirect(dest)
                return
            target = target / "index.html"
        if not target.is_file():
            body = b"Not found"
            self.send_bytes(body, "text/plain; charset=utf-8", 404)
            return
        self.send_bytes(target.read_bytes(), MIME.get(target.suffix, "application/octet-stream"))


def main() -> None:
    db()
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"HelixHog  ·  site      http://{HOST}:{PORT}/")
    print(f"HelixHog  ·  dashboard http://{HOST}:{PORT}/hog/")
    print(f"HelixHog  ·  capture   POST http://{HOST}:{PORT}/e")
    capi_state = "ready" if capi_configured() else "waiting for META_CAPI_TOKEN"
    print(f"HelixHog  ·  meta capi {capi_state}")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
