import json, re
from pathlib import Path
from html import escape

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/pdf/excalidraw_editing_tools_inventory.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
L=json.loads((ROOT/'packages/excalidraw/locales/en.json').read_text(encoding='utf-8'))
story=[]
def p(s,sty='BodyX'): story.append(f'<p class="{sty}">{escape(str(s))}</p>')
def h(s): p(s,'H1X')
def sub(s): p(s,'H2X')
def items(seq):
    for x in seq:p('• '+x,'BodyX')
def locale(path):
    v=L
    for k in path.split('.'):v=v[k]
    return v
def flat(d,prefix=''):
    for k,v in d.items():
        key=f'{prefix}.{k}' if prefix else k
        if isinstance(v,dict):yield from flat(v,key)
        elif isinstance(v,str):yield key,v
def loc_items(path,exclude=()):
    for key,value in flat(locale(path)):
        if key in exclude:continue
        p(f'{value}  [{path}.{key}]','SmallX')

p('Excalidraw editing tools and options','TitleX')
p('Repository inventory | Gratitude Studio fork | 27 September 2026')
p('Scope: the active packages/excalidraw editor and excalidraw-app integration. Archived copies under docs/legacy-branch-backup and the unrelated tldraw source are excluded. Controls are conditional on selection, device, UI mode, host props, and enabled plugins. This is a source inventory, not a claim that every entry appears simultaneously.')
p('How to read: each major control is described below. The final locale appendix preserves the exact English UI labels and keys, including minor commands and hints, for exhaustive lookup.')
h('1. Drawing and selection toolbar')
items([
'Hand: pan the canvas. Selection: click, box select, move, resize, rotate, and edit selected objects. Lasso: freeform area selection; may replace Selection as the preferred tool.',
'Rectangle, Diamond, Ellipse: geometric shapes. Arrow: connectors, including sharp, curved, and elbow variants. Line: open polyline. Draw: freehand strokes with variable or constant pressure modes.',
'Text: standalone text or labels. Sticky note: note object. Eraser: remove touched elements.',
'More tools: Insert image; Frame; Web Embed; Draw to shape (autoshape); Laser pointer; Bucket fill; Lasso selection. The menu also contains a Generate group: text-to-diagram when enabled, Mermaid to Excalidraw, and Wireframe to code when the diagram-to-code plugin is present.',
'Toolbar modes: keep selected tool active (tool lock); pen mode prevents touch drawing. Compact UI puts selection/lasso and draw variants in popovers. The image tool can be hidden by UIOptions.tools.image.'
])
h('2. Appearance and shape properties')
items([
'Stroke/text color and background/fill color: palette, shades, used canvas colors, custom color input, and eyedropper. Bucket fill exposes fill color, fill style, and opacity only.',
'Fill style: solid, hachure, cross-hatch, zigzag. Stroke width: thin, bold, extra bold. Stroke style: solid, dashed, dotted.',
'Sloppiness: architect, artist, cartoonist. Edges: sharp or round. Freehand pressure: constant or variable.',
'Arrow type: sharp, curved, elbow. Start/end arrowhead choices: none, arrow, bar, circle, circle outline, triangle, triangle outline, diamond, diamond outline, crow foot (one/many/one or many), and cardinality (one/many/one or many/exactly one/zero or one/zero or many).',
'Text: font family (hand-drawn, normal, code and available named fonts), size (small, medium, large, very large plus numeric adjustment), horizontal align (left/center/right), and vertical alignment. Opacity is adjustable.',
'Conditional controls: stroke/fill/text controls depend on element type; image crop and text resizing appear for applicable selections. Compact styles panel groups properties in popovers.'
])
h('3. Arrange, transform, and object actions')
items([
'Layer order: send to back, send backward, bring forward, bring to front.',
'Align: left, horizontal center, right, top, vertical center, bottom. Distribute: horizontally or vertically.',
'Duplicate; delete; group/ungroup; flip horizontal/vertical; copy/paste styles; add to library; lock/unlock selection or all elements.',
'Edit line/arrow points; bind/unbind text; wrap text in a container; auto resize text; crop image; switch shape type; convert to/break polygon where applicable.',
'Link: add/edit/open a URL or embedded link, link to an object, copy object link. Frame actions: wrap selection in frame, select all in frame, remove all from frame.',
'Clipboard and selection: cut, copy, paste, paste plain text, copy as PNG/SVG/text, select all, deep select, deep box select. Paste can interpret supported chart data.'
])
h('4. Canvas, view, navigation, and preferences')
items([
'Undo/redo; zoom in/out/reset; zoom to fit all or selection; scroll back to content; canvas background color.',
'Grid; snap to objects; arrow binding; snap to midpoints; view mode; zen mode; light/dark/system theme; full screen; show hints; mouse/trackpad input preference; box selection mode (wrap or overlap).',
'Find on canvas searches text and frames. Properties panel provides scene and selected shape values, including position, size, angle, font size, grid, totals, and version where applicable.',
'Command palette, keyboard shortcut help, library sidebar, and collaboration controls provide additional routes to editor commands.'
])
h('5. File, export, collaboration, and generation')
items([
'Open scene from file; save to current file; export scene file; export image; copy export to clipboard; clear/reset canvas.',
'Image export options include background inclusion, scene embedding, scale, and available PNG/SVG formats; options depend on the export dialog and host configuration.',
'Live collaboration, shareable links, language selector, library browsing/import, text-to-diagram, Mermaid conversion, and AI wireframe-to-code are integration or feature gated options.'
])
h('6. Exact toolbar labels')
loc_items('toolBar')
h('7. Exact editing, arrangement, and preference labels')
loc_items('labels')
h('8. Exact buttons and help entries')
sub('Buttons');loc_items('buttons')
sub('Help');loc_items('helpDialog')
h('9. Registered action identifiers')
action_dir=ROOT/'packages/excalidraw/actions'
actions={}
for f in action_dir.glob('*.ts*'):
    if '.test.' in f.name:continue
    txt=f.read_text(encoding='utf-8',errors='replace')
    for match in re.finditer(r'\bname:\s*["\']([^"\']+)["\']',txt):
        name=match.group(1)
        if re.match(r'^[A-Za-z][A-Za-z0-9]*$',name):actions.setdefault(name,set()).add(f.name)
p(f'{len(actions)} literal action identifiers found in packages/excalidraw/actions. These include internal or conditional commands in addition to visible controls.')
for name,files in sorted(actions.items()):p(f'{name}  -  {", ".join(sorted(files))}','SmallX')
h('10. Sources and coverage notes')
items([
'Local: packages/excalidraw/components/Toolbar.tsx; Tools.tsx; Actions.tsx; LayerUI.tsx; ContextMenu.tsx; packages/excalidraw/components/main-menu/DefaultItems.tsx; packages/excalidraw/components/App.tsx; packages/excalidraw/actions/*; packages/excalidraw/locales/en.json; excalidraw-app/components/AppMainMenu.tsx.',
'Local docs: dev-docs/docs/@excalidraw/excalidraw/api/children-components/main-menu.mdx and api/props/ui-options.mdx explain host menus and tool visibility. The docs themselves are integration-oriented and do not enumerate this fork’s complete editing UI.',
'Official online references checked: https://docs.excalidraw.com/ and https://excalidraw.com/ . Online material may describe a newer upstream editor; the local repository is authoritative for this PDF.',
'Excluded: translated duplicates, archived Excalidraw snapshots, tldraw checkout, developer-only debug control, and every dynamic shade/color value. The exact English labels and registered action identifiers above are included to make uncommon options searchable.'
])
html='''<!doctype html><html><head><meta charset="utf-8"><title>Excalidraw editing tools and options</title><style>
@page {size:A4;margin:16mm 15mm 17mm} body{font:9pt/1.38 Arial,sans-serif;color:#24253a}
p{margin:0 0 5pt} .TitleX{font-size:23pt;font-weight:bold;line-height:1.1;color:#24213e;margin-bottom:14pt}
.H1X{font-size:14pt;font-weight:bold;color:#51419b;margin:16pt 0 7pt;break-after:avoid}
.H2X{font-size:10.5pt;font-weight:bold;margin:10pt 0 5pt;break-after:avoid}
.SmallX{font-size:7.5pt;margin-bottom:2pt;overflow-wrap:anywhere}
footer{position:fixed;bottom:-12mm;font-size:7pt;color:#77778a}
</style></head><body>'''+''.join(story)+'''<footer>Gratitude Studio | editor inventory</footer></body></html>'''
html_path=ROOT/'tmp/pdfs/excalidraw_editing_tools_inventory.html'
html_path.write_text(html,encoding='utf-8')
print(html_path)
print('actions',len(actions),'pages estimate',len(story))
