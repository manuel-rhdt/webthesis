#!/usr/bin/env python3

import re
import sys
import argparse
from pathlib import Path
from typing import List, Tuple, Optional, Callable
import logging

def main():
    """Main entry point for processing markdown files."""

    # Get all chapters in ./chapters
    chapters_dir = Path('./chapters')
    if not chapters_dir.exists():
        print(f"Error: {chapters_dir} directory not found")
        sys.exit(1)

    md_files = sorted(chapters_dir.glob('*.md'))
    if not md_files:
        print(f"No markdown files found in {chapters_dir}")
        sys.exit(1)

    print(f"Found {len(md_files)} markdown file(s) in {chapters_dir}")

    # Define substitution rules: prefix: (colon) → prefix- (dash)
    substitutions = ['eq', 'ch', 'sec', 'fig', 'tab']

    total_changes = 0

    # Apply regex substitution to each file
    for md_file in md_files:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        file_changes = 0
        new_content = content

        # Apply each substitution rule
        for prefix in substitutions:
            # Pattern: matches prefix:label-name and converts to prefix-label-name
            pattern = rf'{prefix}:([a-zA-Z0-9_-]+)'
            replacement = rf'{prefix}-\1'

            if prefix == "ch":
                replacement = r'sec-\1'

            matches = re.findall(pattern, new_content)
            if matches:
                file_changes += len(matches)
                new_content = re.sub(pattern, replacement, new_content)

        pattern = r'::: \{#(eq-[a-zA-Z0-9_-]+)\}([\s\S]*?)\n:::$'
        replacement = r'\2 {#\1}'
        new_content = re.sub(pattern, replacement, new_content, flags=re.MULTILINE)

        pattern = r'<embed\s+src="([^"]+)\.pdf"[^>]*>'
        replacement = r'<img src="\1.svg" />'
        new_content = re.sub(pattern, replacement, new_content)

        # Convert HTML figures to Pandoc markdown figures
        pattern = r'<figure[^>]*id=["\']([^"\']+)["\'][^>]*>((.|\n)*?)</figure>'
        def replace_figure(match):
            identifier = match.group(1)
            content = match.group(2)
            img_match = re.search(r'<img[^>]+src=["\'](.*?)["\']', content, re.IGNORECASE)
            img_src = img_match.group(1) if img_match else None
            
            img_src = "figures/" + Path(img_src).name

            # Extract figcaption if present
            caption_match = re.search(r'<figcaption[^>]*>((.|\n)*?)</figcaption>', content, re.DOTALL | re.IGNORECASE)
            caption = caption_match.group(1).strip() if caption_match else None

            # create markdown figure
            return f"![{caption}]({img_src}){{#{identifier}}}"

        new_content = re.sub(pattern, replace_figure, new_content, re.DOTALL | re.IGNORECASE)

        # Save each file at ./ directory
        output_file = Path('.') / md_file.name
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(new_content)

        total_changes += file_changes
        print(f"  ✓ {md_file.name} → {output_file.name} ({file_changes} changes)")

    print(f"\nCompleted: {total_changes} total substitutions made")

if __name__ == "__main__":
    main()