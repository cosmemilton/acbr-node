"""Extract an npm tarball without links, traversal or special files."""
import pathlib
import shutil
import sys
import tarfile

archive, destination = map(pathlib.Path, sys.argv[1:])
destination.mkdir(parents=True, exist_ok=False)
seen = set()
total = 0
with tarfile.open(archive, mode="r:gz") as source:
    for member in source:
        parts = member.name.split("/")
        if (parts[0] != "package" or any(part in ("", ".", "..") for part in parts)
                or "\\" in member.name or any(ord(c) < 32 for c in member.name)
                or member.name in seen or not (member.isfile() or member.isdir())):
            raise ValueError("Unsafe or duplicate npm tar entry: " + member.name)
        seen.add(member.name)
        total += member.size
        if len(seen) > 100000 or total > 512 * 1024 * 1024:
            raise ValueError("npm tarball exceeds extraction limits")
        target = destination.joinpath(*parts)
        if member.isdir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            with source.extractfile(member) as stream, target.open("xb") as output:
                shutil.copyfileobj(stream, output)
            target.chmod(0o755 if member.mode & 0o111 else 0o644)
