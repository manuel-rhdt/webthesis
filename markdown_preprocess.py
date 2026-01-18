#!/usr/bin/env python3
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "beautifulsoup4>=4.14.3",
# ]
# ///

import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup

def main():
    """Main entry point for processing markdown files."""

    # Get all chapters in ./chapters
    chapters_dir = Path("./chapters")
    if not chapters_dir.exists():
        print(f"Error: {chapters_dir} directory not found")
        sys.exit(1)

    md_files = sorted(chapters_dir.glob("*.md"))
    if not md_files:
        print(f"No markdown files found in {chapters_dir}")
        sys.exit(1)

    print(f"Found {len(md_files)} markdown file(s) in {chapters_dir}")

    # Define substitution rules: prefix: (colon) → prefix- (dash)
    substitutions = ["eq", "ch", "sec", "fig", "tab"]

    total_changes = 0

    # Apply regex substitution to each file
    for md_file in md_files:
        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()

        file_changes = 0
        new_content = content

        # Apply each substitution rule
        for prefix in substitutions:
            # Pattern: matches prefix:label-name and converts to prefix-label-name
            pattern = rf"{prefix}:([a-zA-Z0-9_-]+)"
            replacement = rf"{prefix}-\1"

            if prefix == "tab":
                replacement = r"tbl-\1"
            if prefix == "ch":
                replacement = r"sec-\1"

            matches = re.findall(pattern, new_content)
            if matches:
                file_changes += len(matches)
                new_content = re.sub(pattern, replacement, new_content)

        pattern = r"::: \{#(eq-[a-zA-Z0-9_-]+)\}([\s\S]*?)\n:::$"
        replacement = r"\2 {#\1}"
        new_content = re.sub(pattern, replacement, new_content, flags=re.MULTILINE)

        pattern = r'<embed\s+src="([^"]+)\.pdf"[^>]*>'
        replacement = r'<img src="\1.svg" />'
        new_content = re.sub(pattern, replacement, new_content)

        # Convert HTML figures to Pandoc markdown figures
        pattern = r"<figure[^>]*>((.|\n)*?)</figure>"

        def replace_figure(match: re.Match):
            soup = BeautifulSoup(match.group(0), "html.parser")
            identifier = soup.figure.get('id')
            caption = soup.figcaption
            for mathml in caption.find_all('math'):
                mathml.replace_with(f"${mathml.annotation.string}$")
            caption = caption.decode_contents().replace("\n", " ")
            img_src = "figures/" + Path(soup.img['src']).name

            md = f"![{caption}]({img_src})"
            if identifier is not None:
                md += f"{{#{identifier}}}"
            return md

        new_content = re.sub(
            pattern, replace_figure, new_content, re.DOTALL | re.IGNORECASE
        )

        # Save each file at ./ directory
        output_file = Path("processed") / md_file.name
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(new_content)

        total_changes += file_changes
        print(f"  ✓ {md_file.name} → {output_file.name} ({file_changes} changes)")

    print(f"\nCompleted: {total_changes} total substitutions made")


if __name__ == "__main__":
    main()
