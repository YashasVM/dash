"""Local preview serving public homepage assets only."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        # Only serve public site assets, never source files or private data.
        path = unquote(self.path.split('?')[0])
        resolved = (ROOT / path.lstrip('/')).resolve()
        if '..' in Path(path).parts or not resolved.is_relative_to(ROOT):
            return self.send_error(404)
        if path not in ('/', '/index.html', '/home.css', '/script.js', '/favicon.svg') and not path.startswith(('/logos/', '/fonts/', '/assets/')):
            return self.send_error(404)
        return super().do_GET()

if __name__ == '__main__':
    print('Preview at http://localhost:8788', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8788), Handler).serve_forever()
