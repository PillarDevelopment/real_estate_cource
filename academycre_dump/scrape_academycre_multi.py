#!/usr/bin/env python3
import html
import http.cookiejar
import json
import pathlib
import re
import sys
import urllib.parse
import urllib.request


EMAIL = "FSkvortzov@yandex.ru"
PASSWORD = "Qwerty1234"
BASE_DIR = pathlib.Path("/Users/ivanborisov/Desktop/realestate/academycre_dump")
LOGIN_URL = "https://lk.academycre.ru/cms/system/login"
DEFAULT_STREAMS = [
    "https://lk.academycre.ru/teach/control/stream/view/id/934981977?scan=efb8b25a-19de-4f79-9dc4-0f4b0dcdef8b&scan_id=fc584764-a8be-4d0a-9912-9b5b7eb52740",
    "https://lk.academycre.ru/teach/control/stream/view/id/935320983?scan=47635c31-80a9-4c2e-97f0-45e8b048a44d&scan_id=fc584764-a8be-4d0a-9912-9b5b7eb52740",
    "https://lk.academycre.ru/teach/control/stream/view/id/857759964?scan=828fbff4-8b0e-40c1-8ff1-f95f4de2fc44&scan_id=fc584764-a8be-4d0a-9912-9b5b7eb52740",
]


def slugify(value):
    value = re.sub(r"[^\w\-]+", "_", value, flags=re.U).strip("_")
    return value or "course"


def build_opener():
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    opener.addheaders = [("User-Agent", "Mozilla/5.0")]
    return opener


def login(opener):
    html_text = opener.open(LOGIN_URL).read().decode("utf-8", "ignore")
    csrf = re.search(r'window\.csrfToken = "([^"]+)"', html_text).group(1)
    request_time = re.search(r"window\.requestTime = ([0-9]+)", html_text).group(1)
    request_sign = re.search(r'window\.requestSimpleSign = "([^"]+)"', html_text).group(1)
    payload = {
        "action": "processXdget",
        "xdgetId": "r2104_1_1_1_1_1_1_1_1_1_1",
        "params[action]": "login",
        "params[email]": EMAIL,
        "params[password]": PASSWORD,
        "params[url]": LOGIN_URL,
        "params[object_type]": "",
        "params[object_id]": "",
        "requestTime": request_time,
        "requestSimpleSign": request_sign,
        "_csrf": csrf,
    }
    request = urllib.request.Request(
        LOGIN_URL,
        data=urllib.parse.urlencode(payload).encode(),
        headers={
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "Mozilla/5.0",
        },
    )
    body = opener.open(request).read().decode("utf-8", "ignore")
    data = json.loads(body)
    if not data.get("success"):
        raise RuntimeError(f"Login failed: {body}")
    return data


def fetch_text(opener, url, referer=None):
    headers = {"User-Agent": "Mozilla/5.0"}
    if referer:
        headers["Referer"] = referer
    req = urllib.request.Request(url, headers=headers)
    return opener.open(req).read().decode("utf-8", "ignore")


def fetch_bytes(opener, url, referer=None):
    headers = {"User-Agent": "Mozilla/5.0"}
    if referer:
        headers["Referer"] = referer
    req = urllib.request.Request(url, headers=headers)
    return opener.open(req).read()


def extract_stream_title(stream_html):
    for pattern in [
        r"<title>(.*?)</title>",
        r'<h1[^>]*class="[^"]*page-header[^"]*"[^>]*>(.*?)</h1>',
        r'<h1[^>]*>(.*?)</h1>',
    ]:
        match = re.search(pattern, stream_html, re.S | re.I)
        if match:
            value = re.sub(r"<.*?>", "", html.unescape(match.group(1)))
            value = re.sub(r"\s+", " ", value).strip()
            if value:
                return value
    return "AcademyCRE course"


def extract_lessons(stream_html, stream_url):
    lessons = []
    pattern = re.compile(
        r"""<li[^>]*data-lesson-id="(?P<id>\d+)"[^>]*>.*?<a[^>]+href=['"](?P<href>/teach/control/lesson/view/id/\d+)['"][^>]*>.*?<div class="link title"[^>]*>\s*(?P<title>.*?)\s*(?:<span|</div>)""",
        re.S,
    )
    for match in pattern.finditer(stream_html):
        title = re.sub(r"<.*?>", "", match.group("title")).strip()
        href = urllib.parse.urljoin(stream_url, html.unescape(match.group("href")))
        lessons.append({"id": match.group("id"), "title": title, "url": href})
    return lessons


def parse_embed_data(embed_html):
    m = re.search(r"var playerOptions = (\{.*?\});\s*var id =", embed_html, re.S)
    if not m:
        return None
    data = json.loads(m.group(1))
    item = data["playlist"][0]
    return {
        "video_id": item["id"],
        "title": item.get("title"),
        "duration": item.get("meta", {}).get("duration"),
        "hls": item["sources"]["hls"]["src"],
        "subtitles": item.get("vtt", []),
        "chapters": item.get("chapters", []),
    }


def inspect_lesson(opener, lesson, course_dir):
    lesson_slug = f"{lesson['id']}_{slugify(lesson['title'])}"
    html_text = fetch_text(opener, lesson["url"])
    (course_dir / "lessons").mkdir(parents=True, exist_ok=True)
    (course_dir / "lessons" / f"{lesson_slug}.html").write_text(html_text, encoding="utf-8")
    iframe = re.search(r'<iframe src="([^"]+)"', html_text)
    embed_url = iframe.group(1) if iframe else None
    embed = None
    subtitle_files = []
    if embed_url:
        embed_html = fetch_text(opener, embed_url, referer=lesson["url"])
        (course_dir / "lessons" / f"{lesson_slug}.embed.html").write_text(embed_html, encoding="utf-8")
        embed = parse_embed_data(embed_html)
        if embed:
            (course_dir / "subtitles").mkdir(parents=True, exist_ok=True)
            for idx, subtitle in enumerate(embed["subtitles"], start=1):
                sub_url = subtitle["src"]
                content = fetch_bytes(opener, sub_url, referer=embed_url)
                filename = course_dir / "subtitles" / f"{lesson_slug}_{idx}_{subtitle.get('srcLang','sub')}.vtt"
                filename.write_bytes(content)
                subtitle_files.append(str(filename))
    return {
        "id": lesson["id"],
        "title": lesson["title"],
        "url": lesson["url"],
        "embed_url": embed_url,
        "embed": embed,
        "subtitle_files": subtitle_files,
    }


def canonicalize_streams(urls):
    seen = set()
    result = []
    for url in urls:
        parsed = urllib.parse.urlparse(url)
        qs = urllib.parse.parse_qs(parsed.query)
        stream_id = re.search(r"/id/(\d+)", parsed.path)
        key = stream_id.group(1) if stream_id else parsed.path
        if key in seen:
            continue
        seen.add(key)
        result.append(url)
    return result


def main():
    streams = canonicalize_streams(sys.argv[1:] or DEFAULT_STREAMS)
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    opener = build_opener()
    login_data = login(opener)
    root = BASE_DIR / "multi"
    root.mkdir(parents=True, exist_ok=True)
    summary = {"login": {"email": login_data.get("email"), "user_id": login_data.get("user_id")}, "courses": []}
    for stream_url in streams:
        stream_html = fetch_text(opener, stream_url)
        stream_id_match = re.search(r"/id/(\d+)", stream_url)
        stream_id = stream_id_match.group(1) if stream_id_match else "stream"
        title = extract_stream_title(stream_html)
        course_dir = root / f"{stream_id}_{slugify(title)}"
        course_dir.mkdir(parents=True, exist_ok=True)
        (course_dir / "stream.html").write_text(stream_html, encoding="utf-8")
        lessons = extract_lessons(stream_html, stream_url)
        inspected = [inspect_lesson(opener, lesson, course_dir) for lesson in lessons]
        payload = {
            "stream_id": stream_id,
            "title": title,
            "url": stream_url,
            "lesson_count": len(inspected),
            "lessons": inspected,
        }
        (course_dir / "inventory.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        summary["courses"].append({
            "stream_id": stream_id,
            "title": title,
            "url": stream_url,
            "lesson_count": len(inspected),
            "course_dir": str(course_dir),
        })
        print(f"{stream_id} | {title} | lessons={len(inspected)}")
    (root / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(root / "summary.json")


if __name__ == "__main__":
    main()
