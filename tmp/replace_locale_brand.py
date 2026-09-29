from pathlib import Path
import re

root = Path('packages/excalidraw/locales')
changed = []
for path in root.glob('*.json'):
    raw = path.read_text(encoding='utf-8')
    updated = raw.replace('Excalidraw+', 'Gratitude Studio').replace('Excalidraw', 'Gratitude Studio')
    updated = re.sub(
        r'"([^"\n]*?)Gratitude Studio([^"\n]*?)"(?=\s*:)',
        lambda match: f'"{match.group(1)}Excalidraw{match.group(2)}"',
        updated,
    )
    if updated != raw:
        path.write_text(updated, encoding='utf-8')
        changed.append(path.name)
print(f'Updated {len(changed)} locale files')
