# Gratitude editor migration

Branch: `route/excalidraw-fresh`. This branch begins with official Excalidraw source at `c10499eebb6267f24c056a03c5daf436aada0446`, under its MIT license. It has no tldraw code or Gratitude app yet.

- [x] Create a clean orphan branch in a separate worktree so the existing tldraw checkout remains untouched.
- [x] Copy official Excalidraw source to the root and retain its license.
- [ ] Install locked upstream dependencies and start the unmodified app for an initial preview.
- [ ] Map the existing Gratitude design, photo assets, templates, pin, reflection note, and export flow.
- [ ] Build Gratitude's curated studio UI on the Excalidraw engine from this source tree.
- [ ] Add private persistence and a safe import path for any existing boards without overwriting old local data.
- [ ] Check photo editing, text, shapes, drawing, undo/redo, export, mobile, and accessibility in the browser.
- [ ] Remove unused upstream app services and retain required license and third-party notices.
- [ ] Update setup docs and run relevant build and browser checks.

Acceptance: users can create, save, reopen, and export a photo-based vision board in Gratitude's visual language. No tldraw dependency or license notice is present.
