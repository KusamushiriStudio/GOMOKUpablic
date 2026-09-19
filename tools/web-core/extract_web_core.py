#!/usr/bin/env python3
"""Materialize selected modules from TRIAD's checked-in single-file Web bundle."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


MODULE_START = re.compile(r'^__def\(("(?:[^"\\]|\\.)*")\s*,\s*function\s*\(__req\)\s*\{', re.MULTILINE)


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def module_segments(bundle: str) -> dict[str, str]:
    matches = list(MODULE_START.finditer(bundle))
    segments: dict[str, str] = {}
    for index, match in enumerate(matches):
        module_id = json.loads(match.group(1))
        end = matches[index + 1].start() if index + 1 < len(matches) else bundle.rfind('__req("app.js");')
        if end < match.start():
            raise RuntimeError(f"Could not locate end of module {module_id}")
        segments[module_id] = bundle[match.start():end].rstrip() + "\n"
    return segments


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, default=Path(__file__).with_name("module_manifest.json"))
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    source_path = (args.repo / manifest["source"]).resolve()
    source_bytes = source_path.read_bytes()
    bundle = source_bytes.decode("utf-8")
    segments = module_segments(bundle)

    args.output.mkdir(parents=True, exist_ok=True)
    resolved = {
        "schemaVersion": manifest["schemaVersion"],
        "source": manifest["source"],
        "sourceCommit": manifest["sourceCommit"],
        "sourceSha256": sha256_bytes(source_bytes),
        "modules": [],
    }

    for item in manifest["modules"]:
        module_id = item["id"]
        if module_id not in segments:
            raise KeyError(f"Module not found in bundle: {module_id}")
        output_path = args.output / item["output"]
        output_path.parent.mkdir(parents=True, exist_ok=True)
        data = segments[module_id].encode("utf-8")
        output_path.write_bytes(data)
        resolved["modules"].append({
            **item,
            "bytes": len(data),
            "sha256": sha256_bytes(data),
        })

    resolved_path = args.output / "module_manifest.resolved.json"
    resolved_path.write_text(json.dumps(resolved, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Extracted {len(resolved['modules'])} modules from {source_path}")
    print(f"Source SHA-256: {resolved['sourceSha256']}")
    print(f"Resolved manifest: {resolved_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
