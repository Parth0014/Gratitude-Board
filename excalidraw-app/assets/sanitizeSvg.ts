const SVG_NS = "http://www.w3.org/2000/svg";
const allowedElements = new Set([
  "svg",
  "g",
  "path",
  "circle",
  "ellipse",
  "rect",
  "line",
  "polyline",
  "polygon",
]);
const allowedAttributes = new Set([
  "width",
  "height",
  "viewBox",
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "points",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "fill-rule",
  "clip-rule",
  "opacity",
  "fill-opacity",
  "stroke-opacity",
  "transform",
]);

/** Rebuild an SVG from drawing primitives so no remote markup reaches the canvas. */
export const sanitizeSvg = (
  source: string,
  ownerDocument: Document,
): string => {
  if (source.length > 100_000) {
    throw new Error("SVG is too large");
  }
  const ownerWindow = ownerDocument.defaultView;
  if (!ownerWindow) {
    throw new Error("No browser window");
  }
  const parsed = new ownerWindow.DOMParser().parseFromString(
    source,
    "image/svg+xml",
  );
  const root = parsed.documentElement;
  if (root.localName !== "svg" || root.namespaceURI !== SVG_NS) {
    throw new Error("Invalid SVG");
  }
  const cleanDocument = ownerDocument.implementation.createDocument(
    SVG_NS,
    "svg",
    null,
  );
  const cleanRoot = cleanDocument.documentElement;
  let count = 0;
  const copy = (from: Element, to: Element) => {
    for (const attribute of Array.from(from.attributes)) {
      if (!allowedAttributes.has(attribute.name) || attribute.namespaceURI) {
        continue;
      }
      const value = attribute.value.trim();
      if (
        value.length > 10_000 ||
        /url\s*\(|javascript:|data:|[<>]/i.test(value)
      ) {
        continue;
      }
      to.setAttribute(attribute.name, value);
    }
    for (const child of Array.from(from.children)) {
      if (
        child.namespaceURI !== SVG_NS ||
        !allowedElements.has(child.localName)
      ) {
        continue;
      }
      if (++count > 300) {
        throw new Error("SVG has too many elements");
      }
      const cleanChild = cleanDocument.createElementNS(SVG_NS, child.localName);
      copy(child, cleanChild);
      to.appendChild(cleanChild);
    }
  };
  copy(root, cleanRoot);
  if (!cleanRoot.children.length) {
    throw new Error("SVG contains no supported artwork");
  }
  cleanRoot.setAttribute("xmlns", SVG_NS);
  if (!cleanRoot.hasAttribute("viewBox")) {
    cleanRoot.setAttribute("viewBox", "0 0 24 24");
  }
  cleanRoot.setAttribute("width", "512");
  cleanRoot.setAttribute("height", "512");
  return new ownerWindow.XMLSerializer().serializeToString(cleanRoot);
};

export const svgToPng = async (
  blob: Blob,
  ownerDocument: Document,
  color?: string,
): Promise<Blob> => {
  const ownerWindow = ownerDocument.defaultView;
  if (!ownerWindow) {
    throw new Error("No browser window");
  }
  let clean = sanitizeSvg(await blob.text(), ownerDocument);
  if (color && /^#[0-9a-f]{6}$/i.test(color)) {
    const parsed = new ownerWindow.DOMParser().parseFromString(
      clean,
      "image/svg+xml",
    );
    parsed.documentElement.querySelectorAll("*").forEach((element) => {
      const fill = element.getAttribute("fill");
      const stroke = element.getAttribute("stroke");
      if (fill && fill !== "none" && fill !== "transparent") {
        element.setAttribute("fill", color);
      }
      if (stroke && stroke !== "none" && stroke !== "transparent") {
        element.setAttribute("stroke", color);
      }
    });
    clean = new ownerWindow.XMLSerializer().serializeToString(
      parsed.documentElement,
    );
  }
  const svgBlob = new ownerWindow.Blob([clean], { type: "image/svg+xml" });
  const url = ownerWindow.URL.createObjectURL(svgBlob);
  try {
    const image = new ownerWindow.Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("SVG could not be rendered"));
      image.src = url;
    });
    const canvas = ownerDocument.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is unavailable");
    }
    context.drawImage(image, 0, 0, 512, 512);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) =>
          result ? resolve(result) : reject(new Error("PNG conversion failed")),
        "image/png",
      ),
    );
  } finally {
    ownerWindow.URL.revokeObjectURL(url);
  }
};
