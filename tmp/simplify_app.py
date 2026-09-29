from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
def edit(path, fn):
    p=root/path
    old=p.read_text(encoding='utf-8')
    new=fn(old)
    p.write_text(new,encoding='utf-8')
    print(path, len(old)-len(new))

def app(s):
    s=s.replace('  LiveCollaborationTrigger,\n','').replace('  TTDDialogTrigger,\n','')
    s=re.sub(r'import \{\s*CommandPalette,\s*DEFAULT_CATEGORIES,\s*\} from "@excalidraw/excalidraw/components/CommandPalette/CommandPalette";\n','',s)
    s=s.replace('import { usersIcon, share } from "@excalidraw/excalidraw/components/icons";\n','')
    s=s.replace('import { AIComponents } from "./components/AI";\n','')
    s=re.sub(r'\s*<CommandPalette\s+customCommandPaletteItems=\{\[.*?\]\}\s*/>','',s,flags=re.S)
    s=re.sub(r'\s*<TTDDialogTrigger />','',s)
    s=re.sub(r'\s*\{excalidrawAPI && <AIComponents excalidrawAPI=\{excalidrawAPI\} />\}','',s)
    s=re.sub(r'\s*renderTopRightUI=\{\(isMobile\) => \{.*?\}\}\n\s*onLinkOpen=', '\n          onLinkOpen=',s,flags=re.S)
    return s
edit(Path('excalidraw-app/App.tsx'),app)

def layer(s):
    s=re.sub(r'\s*<MainMenu.Group title="Excalidraw links">.*?</MainMenu.Group>\s*<MainMenu.Separator />','',s,flags=re.S)
    s=s.replace('      {UIOptions.canvasActions.export && <MainMenu.DefaultItems.Export />}\n','')
    return s
edit(Path('packages/excalidraw/components/LayerUI.tsx'),layer)

def mobile(s):
    for typ in ['embeddable','autoshape','laser','bucketfill']:
        pattern=r'\s*<DropdownMenu.Item\s+onSelect=\{\(\) => app.setActiveTool\(\{ type: "'+typ+r'" \}\)\}.*?</DropdownMenu.Item>'
        s,n=re.subn(pattern,'',s,flags=re.S)
        print('mobile',typ,n)
    s=re.sub(r'\s*<div style=\{\{ margin: "6px 0".*?\}\}>\s*Generate\s*</div>\s*\{app.props.aiEnabled !== false && <TTDDialogTriggerTunnel.Out />\}.*?\{app.props.aiEnabled !== false && app.plugins.diagramToCode && \(.*?\)\}', '',s,flags=re.S)
    return s
edit(Path('packages/excalidraw/components/MobileToolbar.tsx'),mobile)
