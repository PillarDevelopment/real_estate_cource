#!/usr/bin/env python3
import html
import http.cookiejar
import json
import pathlib
import re
import urllib.parse
import urllib.request


EMAIL = "FSkvortzov@yandex.ru"
PASSWORD = "Qwerty1234"
BASE_DIR = pathlib.Path("/Users/ivanborisov/Desktop/realestate/academycre_dump")
LOGIN_URL = "https://lk.academycre.ru/cms/system/login"
STREAM_URL = "https://lk.academycre.ru/teach/control/stream/view/id/934981977"
INTRO_URL = "https://lk.academycre.ru/pl/teach/control/lesson/view?id=347121950&scan=37122a32-d4f5-47c7-b544-c4cc3297a964&scan_id=a146e474-9bfb-44ce-a8b7-cb65528b21a0"


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


def slugify(value):
    value = re.sub(r"[^\w\-]+", "_", value, flags=re.U).strip("_")
    return value or "lesson"


def extract_lessons(stream_html):
    lessons = []
    pattern = re.compile(
        r"""<li[^>]*data-lesson-id="(?P<id>\d+)"[^>]*>.*?<a[^>]+href=['"](?P<href>/teach/control/lesson/view/id/\d+)['"][^>]*>.*?<div class="link title"[^>]*>\s*(?P<title>.*?)\s*(?:<span|</div>)""",
        re.S,
    )
    for match in pattern.finditer(stream_html):
        title = re.sub(r"<.*?>", "", match.group("title")).strip()
        href = urllib.parse.urljoin(STREAM_URL, html.unescape(match.group("href")))
        lessons.append({"id": match.group("id"), "title": title, "url": href})
    return lessons


def parse_embed_data(embed_html):
    m = re.search(r"var playerOptions = (\{.*?\});\s*var id =", embed_html, re.S)
    if not m:
        raise RuntimeError("playerOptions not found")
    data = json.loads(m.group(1))
    item = data["playlist"][0]
    subtitles = item.get("vtt", [])
    chapters = item.get("chapters", [])
    hls = item["sources"]["hls"]["src"]
    return {
        "video_id": item["id"],
        "title": item.get("title"),
        "duration": item.get("meta", {}).get("duration"),
        "hls": hls,
        "subtitles": subtitles,
        "chapters": chapters,
    }


def inspect_lesson(opener, lesson, html_text=None):
    lesson_slug = f"{lesson['id']}_{slugify(lesson['title'])}"
    lessons_dir = BASE_DIR / "lessons"
    lessons_dir.mkdir(parents=True, exist_ok=True)
    if html_text is None:
        html_text = fetch_text(opener, lesson["url"])
    (lessons_dir / f"{lesson_slug}.html").write_text(html_text, encoding="utf-8")
    iframe = re.search(r'<iframe src="([^"]+)"', html_text)
    embed_url = iframe.group(1) if iframe else None
    embed = None
    subtitle_files = []
    if embed_url:
        embed_html = fetch_text(opener, embed_url, referer=lesson["url"])
        (lessons_dir / f"{lesson_slug}.embed.html").write_text(embed_html, encoding="utf-8")
        embed = parse_embed_data(embed_html)
        subs_dir = BASE_DIR / "subtitles"
        subs_dir.mkdir(parents=True, exist_ok=True)
        for idx, subtitle in enumerate(embed["subtitles"], start=1):
            sub_url = subtitle["src"]
            content = fetch_bytes(opener, sub_url, referer=embed_url)
            filename = subs_dir / f"{lesson_slug}_{idx}_{subtitle.get('srcLang','sub')}.vtt"
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


def main():
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    opener = build_opener()
    login_data = login(opener)
    stream_html = fetch_text(opener, STREAM_URL)
    (BASE_DIR / "stream.html").write_text(stream_html, encoding="utf-8")
    lessons = extract_lessons(stream_html)
    inventory = [inspect_lesson(opener, lesson) for lesson in lessons]

    intro_html = fetch_text(opener, INTRO_URL)
    intro_title_match = re.search(r"<title>(.*?)</title>", intro_html, re.S)
    intro = inspect_lesson(
        opener,
        {
            "id": "347121950",
            "title": re.sub(r"\s+", " ", html.unescape(intro_title_match.group(1))).strip() if intro_title_match else "Вводный урок",
            "url": INTRO_URL,
        },
        html_text=intro_html,
    )
    payload = {
        "login": login_data,
        "lesson_count": len(lessons),
        "lessons": inventory,
        "intro": intro,
    }
    out = BASE_DIR / "inventory.json"
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(out)
    print(f"LESSONS: {len(lessons)}")
    for lesson in inventory:
        print(f"{lesson['id']} | {lesson['title']} | subtitles={len(lesson['subtitle_files'])}")
    print(f"INTRO | {intro['title']} | subtitles={len(intro['subtitle_files'])}")


if __name__ == "__main__":
    main()
