"""Package current source, including uncommitted changes, without local secrets/data."""
from pathlib import Path
import hashlib
import subprocess
import tarfile

root = Path(__file__).resolve().parent.parent
output = root / "release"
output.mkdir(exist_ok=True)
raw = subprocess.check_output(["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"], cwd=root)
names = set(raw.decode("utf-8").split("\0"))
allowed_roots = {"backend", "frontend", "scripts", ".agents"}
allowed_files = {"docker-compose.yml", "AGENTS.md", "README.md", "DEPLOY.md", ".gitignore"}
excluded_parts = {"venv", ".venv", "node_modules", ".next", ".next-build", "media", "__pycache__", ".pytest_cache", "fixtures"}
archive = output / "alumni-update.tar.gz"
with tarfile.open(archive, "w:gz") as tar:
    for name in sorted(names):
        path = Path(name)
        if not name or (path.parts[0] not in allowed_roots and name not in allowed_files):
            continue
        if any(part in excluded_parts for part in path.parts):
            continue
        if path.name.startswith(".env") or path.suffix in {".log", ".sqlite3", ".pyc", ".tsbuildinfo"}:
            continue
        if path.name == "demo_data_backup.json":
            continue
        source = root / path
        if source.is_file() and not source.is_symlink():
            tar.add(source, arcname=path.as_posix(), recursive=False)
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
(output / "alumni-update.tar.gz.sha256").write_text(f"{digest}  alumni-update.tar.gz\n", encoding="ascii")
print(f"Created {archive} ({archive.stat().st_size:,} bytes), SHA256: {digest}")
