#!/usr/bin/env python3
"""Extract an All-in-One WP Migration .wpress archive (custom container format).

Format: repeated entries of
  - 255 bytes: filename (null-padded)
  - 14 bytes:  file size, ASCII decimal (null-padded)
  - 12 bytes:  mtime, ASCII (null-padded)
  - 4096 bytes: path prefix relative to wp-content (null-padded)
followed by `size` raw bytes of file content.
An entry with an empty filename marks end of archive.
"""
import os
import sys

HEADER_SIZE = 4377
NAME_SIZE = 255
SIZE_SIZE = 14
MTIME_SIZE = 12
PREFIX_SIZE = 4096

def extract(archive_path, out_dir, list_only=False, max_list=None, only_prefixes=None):
    os.makedirs(out_dir, exist_ok=True)
    count = 0
    listed = []
    total_size = os.path.getsize(archive_path)
    with open(archive_path, 'rb') as f:
        while True:
            header = f.read(HEADER_SIZE)
            if len(header) < HEADER_SIZE:
                break
            name = header[0:NAME_SIZE].split(b'\x00', 1)[0].decode('utf-8', 'replace')
            if name == '':
                break
            size_raw = header[NAME_SIZE:NAME_SIZE+SIZE_SIZE].split(b'\x00', 1)[0]
            try:
                size = int(size_raw.decode('ascii') or '0')
            except ValueError:
                print(f"Bad size field at offset {f.tell()}: {size_raw!r}", file=sys.stderr)
                break
            prefix = header[NAME_SIZE+SIZE_SIZE+MTIME_SIZE:].split(b'\x00', 1)[0].decode('utf-8', 'replace')
            rel_path = os.path.join(prefix, name) if prefix else name
            skip_this = only_prefixes is not None and not any(
                rel_path == p or rel_path.startswith(p) for p in only_prefixes
            )
            listed.append((rel_path, size))
            if list_only or skip_this:
                f.seek(size, os.SEEK_CUR)
            else:
                dest = os.path.join(out_dir, rel_path)
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                remaining = size
                with open(dest, 'wb') as out:
                    chunk = 1024 * 1024
                    while remaining > 0:
                        n = min(chunk, remaining)
                        data = f.read(n)
                        if not data:
                            break
                        out.write(data)
                        remaining -= len(data)
            count += 1
            if max_list and count >= max_list:
                pass
    return listed

if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('archive')
    ap.add_argument('out_dir')
    ap.add_argument('--list-only', action='store_true')
    ap.add_argument('--only', action='append', help='only extract entries whose relative path startswith this prefix (repeatable)')
    args = ap.parse_args()
    listed = extract(args.archive, args.out_dir, list_only=args.list_only, only_prefixes=args.only)
    print(f"Total entries: {len(listed)}")
    if args.list_only:
        for path, size in listed:
            print(f"{size:>12}  {path}")
