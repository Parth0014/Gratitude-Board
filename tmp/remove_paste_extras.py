from pathlib import Path
p=Path('packages/excalidraw/components/App.tsx')
s=p.read_text(encoding='utf-8')
a=s.index('    // ------------------- Successful Mermaid -------------------')
b=s.index('    // ------------------- Text -------------------',a)
s=s[:a]+s[b:]
s=s.replace('import { isMaybeMermaidDefinition } from "../mermaid";\n','')
p.write_text(s,encoding='utf-8')
