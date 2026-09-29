from pathlib import Path
p=Path('excalidraw-app/App.tsx')
s=p.read_text(encoding='utf-8')
for line in [
 'import { ShareableLinkDialog } from "@excalidraw/excalidraw/components/ShareableLinkDialog";\n',
 'import { ShareDialog, shareDialogStateAtom } from "./share/ShareDialog";\n',
 '  exportToBackend,\n',
 '  const [, setShareDialogState] = useAtom(shareDialogStateAtom);\n',
]:
 s=s.replace(line,'')
s=s.replace('import Collab, {','import {')
a=s.index('  const [latestShareableLink, setLatestShareableLink]')
b=s.index('  const renderCustomStats =',a)
s=s[:a]+s[b:]
a=s.index('  const onCollabDialogOpen =')
b=s.index('  // ---------------------------------------------------------------------------',a)
s=s[:a]+s[b:]
s=s.replace('            onCollabDialogOpen={onCollabDialogOpen}\n','').replace('            isCollaborating={isCollaborating}\n            isCollabEnabled={!isCollabDisabled}\n','').replace('            refresh={() => forceRefresh((prev) => !prev)}\n','')
a=s.index('          {latestShareableLink && (')
b=s.index('          {errorMessage && (',a)
s=s[:a]+s[b:]
p.write_text(s,encoding='utf-8')
