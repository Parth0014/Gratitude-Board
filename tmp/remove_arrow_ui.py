from pathlib import Path
p=Path('packages/excalidraw/components/Actions.tsx')
s=p.read_text(encoding='utf-8')
a=s.index('const CombinedArrowProperties = (')
b=s.index('const CombinedTextProperties = (',a)
s=s[:a]+s[b:]
import re
s=re.sub(r'\s*<CombinedArrowProperties\b.*?/>','',s,flags=re.S)
s=s.replace('import { isArrowElement } from "@excalidraw/element";\n','')
s=s.replace('  ExcalidrawElement,\n','')
s=s.replace('import { getFormValue } from "../actions/actionProperties";\n','')
for x in ['  sharpArrowIcon,\n','  roundArrowIcon,\n','  elbowArrowIcon,\n']:
 s=s.replace(x,'')
p.write_text(s,encoding='utf-8')
