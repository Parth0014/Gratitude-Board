from pathlib import Path
p=Path('excalidraw-app/App.tsx')
s=p.read_text(encoding='utf-8')
a=s.index('declare global {\n  interface BeforeInstallPromptEventChoiceResult')
b=s.index('let isSelfEmbedding = false;',a)
s=s[:a]+s[b:]
for x in [
 '  useEditorInterface,\n',
 'import { getDefaultAppState } from "@excalidraw/excalidraw/appState";\n',
 'import CollabError, { collabErrorIndicatorAtom } from "./collab/CollabError";\n',
 '  const editorInterface = useEditorInterface();\n',
 '  const collabError = useAtomValue(collabErrorIndicatorAtom);\n',
]:s=s.replace(x,'')
p.write_text(s,encoding='utf-8')

p=Path('packages/excalidraw/components/App.tsx')
s=p.read_text(encoding='utf-8')
for x in [
 '  normalizeEOL,\n','  maybeParseEmbedSrc,\n','  actionAddToLibrary,\n',
 '  actionToggleGridMode,\n','  actionToggleStats,\n','  actionToggleZenMode,\n',
 '  actionLink,\n','  actionToggleObjectsSnapMode,\n',
 '  actionToggleArrowBinding,\n','  actionToggleMidpointSnapping,\n',
 'import { actionCopyElementLink } from "../actions/actionElementLink";\n',
 'import { actionUnlockAllElements } from "../actions/actionElementLock";\n',
 'import { actionToggleViewMode } from "../actions/actionToggleViewMode";\n',
]:s=s.replace(x,'')
p.write_text(s,encoding='utf-8')
