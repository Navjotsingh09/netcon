#!/usr/bin/env python3
"""Local static server with clean URL support for NetCon.

Usage:
  python3 scripts/dev-server.py
  PORT=8080 python3 scripts/dev-server.py
"""

from __future__ import annotations

import http.server
import os
import posixpath
import urllib.parse
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PORT = int(os.environ.get("PORT", "3000"))


class CleanURLRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def translate_path(self, path: str) -> str:
        # Resolve URL path safely relative to project root.
        parsed = urllib.parse.urlparse(path)
        raw_path = urllib.parse.unquote(parsed.path)
        normalized = posixpath.normpath(raw_path)

        if normalized in (".", "/"):
            return str(ROOT / "index.html")

        relative = normalized.lstrip("/")
        candidate = ROOT / relative

        # Serve exact file when present.
        if candidate.is_file():
            return str(candidate)

        # Serve directory index when present.
        if candidate.is_dir() and (candidate / "index.html").is_file():
            return str(candidate / "index.html")

        # Clean URL support: /foo/bar -> /foo/bar.html
        html_candidate = ROOT / f"{relative}.html"
        if html_candidate.is_file():
            return str(html_candidate)

        # Fall back to default handling (404).
        return str(candidate)

    def log_message(self, format: str, *args) -> None:
        # Keep output readable while still showing request details.
        print(f"[{self.log_date_time_string()}] {format % args}")


def main() -> None:
    os.chdir(ROOT)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), CleanURLRequestHandler)
    print(f"Serving {ROOT} at http://127.0.0.1:{PORT}")
    print("Press Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
