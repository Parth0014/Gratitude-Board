import type { AssetProvider, GratitudeAsset } from "../contracts";

type LocalAsset = {
  id: string;
  type: GratitudeAsset["type"];
  title: string;
  tags: string[];
  body: string;
  width?: number;
  height?: number;
  colors?: boolean;
};

const svg = (body: string, width = 512, height = 512) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>`;

const repeat = (count: number, render: (index: number) => string) =>
  Array.from({ length: count }, (_, index) => render(index)).join("");

const stickers: LocalAsset[] = [
  [
    "heart-bloom",
    "Heart bloom",
    ["love", "gratitude", "relationship"],
    '<path d="M256 438C124 352 62 270 82 170c17-86 126-98 174-20 48-78 157-66 174 20 20 100-42 182-174 268Z" fill="#ef7898"/><path d="M256 405c-89-61-142-125-142-199" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity=".55"/>',
  ],
  [
    "sunshine",
    "Warm sunshine",
    ["joy", "energy", "wellness"],
    `<circle cx="256" cy="256" r="112" fill="#f8c85d"/><g stroke="#e89d43" stroke-width="22" stroke-linecap="round">${repeat(
      12,
      (i) => {
        const a = (i * Math.PI) / 6;
        return `<line x1="${256 + 158 * Math.cos(a)}" y1="${
          256 + 158 * Math.sin(a)
        }" x2="${256 + 214 * Math.cos(a)}" y2="${256 + 214 * Math.sin(a)}"/>`;
      },
    )}</g><path d="M210 270q46 50 92 0" fill="none" stroke="#7b5144" stroke-width="14" stroke-linecap="round"/><circle cx="210" cy="225" r="10" fill="#7b5144"/><circle cx="302" cy="225" r="10" fill="#7b5144"/>`,
  ],
  [
    "rainbow",
    "Hope rainbow",
    ["hope", "dream", "color"],
    '<path d="M76 374a180 180 0 0 1 360 0" fill="none" stroke="#e26f91" stroke-width="42"/><path d="M118 374a138 138 0 0 1 276 0" fill="none" stroke="#f2b85b" stroke-width="42"/><path d="M160 374a96 96 0 0 1 192 0" fill="none" stroke="#75b89c" stroke-width="42"/><circle cx="82" cy="385" r="52" fill="#fff"/><circle cx="430" cy="385" r="52" fill="#fff"/>',
  ],
  [
    "sparkle-cluster",
    "Sparkle cluster",
    ["magic", "dream", "celebrate"],
    '<path d="m256 48 38 132 132 38-132 38-38 132-38-132-132-38 132-38Z" fill="#f3b74f"/><path d="m105 286 18 60 60 18-60 18-18 60-18-60-60-18 60-18Z" fill="#df7aa0"/><path d="m407 82 15 50 50 15-50 15-15 50-15-50-50-15 50-15Z" fill="#8d79cb"/>',
  ],
  [
    "flower",
    "Growing flower",
    ["growth", "nature", "wellness"],
    '<path d="M256 454V266" stroke="#47826a" stroke-width="20" stroke-linecap="round"/><path d="M250 348c-80-72-140-25-146 26 70 35 119 12 146-26Zm12 43c74-66 132-23 138 24-65 32-111 11-138-24Z" fill="#86c7a9"/><g fill="#e982a2"><circle cx="256" cy="170" r="58"/><circle cx="181" cy="205" r="58"/><circle cx="331" cy="205" r="58"/><circle cx="213" cy="125" r="58"/><circle cx="299" cy="125" r="58"/></g><circle cx="256" cy="174" r="54" fill="#f4c65d"/>',
  ],
  [
    "home",
    "Happy home",
    ["home", "family", "future"],
    '<path d="m72 242 184-154 184 154v204H72Z" fill="#f7e1e6" stroke="#a9657f" stroke-width="16" stroke-linejoin="round"/><path d="M207 446V309h98v137" fill="#fff9f3" stroke="#a9657f" stroke-width="14"/><path d="M125 266h76v72h-76Zm186 0h76v72h-76Z" fill="#9dc9d1"/>',
  ],
  [
    "airplane",
    "Dream trip",
    ["travel", "vacation", "adventure"],
    '<path d="m64 282 160-42 104-150c17-24 52-31 70-13s11 53-13 70L235 251 193 411l-37 21-3-128-79 42-45-22Z" fill="#78a7ca" stroke="#345e78" stroke-width="12" stroke-linejoin="round"/><path d="M77 157c75-60 148-72 218-52" fill="none" stroke="#e38aa5" stroke-width="12" stroke-linecap="round" stroke-dasharray="18 24"/>',
  ],
  [
    "trophy",
    "Goal achieved",
    ["career", "success", "goal"],
    '<path d="M167 75h178v113c0 70-38 113-89 113s-89-43-89-113Z" fill="#f2bd4e" stroke="#a66c28" stroke-width="14"/><path d="M166 113H83c0 91 36 132 105 132M346 113h83c0 91-36 132-105 132M256 301v75m-75 61h150" fill="none" stroke="#a66c28" stroke-width="18" stroke-linecap="round"/><rect x="196" y="368" width="120" height="70" rx="16" fill="#e09a42"/>',
  ],
  [
    "open-book",
    "Learning journey",
    ["study", "learning", "career"],
    '<path d="M54 105c77-18 145 0 202 49v278c-57-49-125-67-202-49Zm404 0c-77-18-145 0-202 49v278c57-49 125-67 202-49Z" fill="#fff5dc" stroke="#8f6d61" stroke-width="14" stroke-linejoin="round"/><path d="M256 154v278" stroke="#8f6d61" stroke-width="10"/>',
  ],
  [
    "wellness",
    "Mindful moment",
    ["health", "wellness", "calm"],
    '<circle cx="256" cy="256" r="186" fill="#e3f1eb"/><circle cx="256" cy="151" r="48" fill="#9c6b56"/><path d="M157 386c18-104 54-155 99-155s81 51 99 155" fill="#a9cfbf" stroke="#477b69" stroke-width="14"/><path d="m101 394 155-82 155 82M179 314l77 79 77-79" fill="none" stroke="#477b69" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>',
  ],
  [
    "money-plant",
    "Abundant growth",
    ["money", "finance", "growth"],
    '<path d="M256 451V163" stroke="#4e7e62" stroke-width="18"/><path d="M248 236c-100-83-165-17-161 50 82 29 134 4 161-50Zm16 88c96-78 157-13 151 52-78 26-128 1-151-52Z" fill="#79b98f" stroke="#4e7e62" stroke-width="10"/><circle cx="256" cy="117" r="77" fill="#f0c85c" stroke="#ae7c31" stroke-width="12"/><path d="M276 82c-52-18-76 8-71 34 8 36 93 12 91 54-2 29-37 38-76 24m36-129v-19m0 175v-20" fill="none" stroke="#8c6128" stroke-width="13" stroke-linecap="round"/>',
  ],
  [
    "camera",
    "Capture memories",
    ["memory", "travel", "family"],
    '<rect x="55" y="135" width="402" height="286" rx="48" fill="#806c8f"/><path d="M147 135l33-58h152l33 58" fill="#aa92bc"/><circle cx="256" cy="279" r="105" fill="#d9e7eb" stroke="#4e4159" stroke-width="18"/><circle cx="256" cy="279" r="61" fill="#78a8b7"/><circle cx="395" cy="194" r="18" fill="#f3c45b"/>',
  ],
].map(
  ([id, title, tags, body]) =>
    ({ id, type: "sticker", title, tags, body } as LocalAsset),
);

const frames: LocalAsset[] = [
  [
    "classic-polaroid",
    "Classic polaroid",
    '<path d="M65 35h382v442H65Z M105 78v278h302V78Z" fill="#fffdf8" fill-rule="evenodd" stroke="#cfbec5" stroke-width="10"/>',
    ["polaroid", "photo", "scrapbook"],
  ],
  [
    "soft-arch",
    "Soft arch frame",
    '<path d="M55 457V224a201 201 0 0 1 402 0v233Zm54-54h294V224a147 147 0 0 0-294 0Z" fill="#e794ad" fill-rule="evenodd"/>',
    ["arch", "window", "photo"],
  ],
  [
    "circle-ring",
    "Circle frame",
    '<path d="M256 28a228 228 0 1 0 0 456 228 228 0 0 0 0-456Zm0 54a174 174 0 1 1 0 348 174 174 0 0 1 0-348Z" fill="#d9b55e" fill-rule="evenodd"/>',
    ["circle", "round", "portrait"],
  ],
  [
    "organic-frame",
    "Organic frame",
    '<path d="M419 115c69 91 40 264-56 335-91 67-272 22-321-90-42-96 31-259 145-305 79-32 178-11 232 60Zm-54 42c-42-55-112-70-169-47-78 31-131 145-103 211 34 76 157 107 219 61 66-49 86-162 53-225Z" fill="#99c8b3" fill-rule="evenodd"/>',
    ["blob", "organic", "modern"],
  ],
  [
    "postage-frame",
    "Postage frame",
    '<path d="M54 54h404v404H54Zm53 53v298h298V107Z" fill="#e88aa5" fill-rule="evenodd" stroke="#fff" stroke-width="12" stroke-dasharray="14 12"/>',
    ["postage", "travel", "memory"],
  ],
  [
    "film-frame",
    "Film frame",
    `<path d="M35 70h442v372H35Zm71 61v250h300V131Z" fill="#3f3945" fill-rule="evenodd"/>${repeat(
      8,
      (i) =>
        `<rect x="${
          50 + i * 55
        }" y="86" width="28" height="24" rx="4" fill="#fff"/><rect x="${
          50 + i * 55
        }" y="402" width="28" height="24" rx="4" fill="#fff"/>`,
    )}`,
    ["film", "cinema", "memory"],
  ],
  [
    "double-line",
    "Editorial frame",
    '<rect x="39" y="39" width="434" height="434" rx="20" fill="none" stroke="#8e759f" stroke-width="12"/><rect x="66" y="66" width="380" height="380" rx="10" fill="none" stroke="#d3b6df" stroke-width="5"/>',
    ["editorial", "minimal", "border"],
  ],
  [
    "scallop-frame",
    "Scallop frame",
    '<path d="M74 64h364v384H74Z" fill="none" stroke="#ef9f86" stroke-width="34" stroke-linecap="round" stroke-dasharray="2 38"/><rect x="82" y="72" width="348" height="368" fill="none" stroke="#ef9f86" stroke-width="8"/>',
    ["scallop", "playful", "border"],
  ],
].map(
  ([id, title, body, tags]) =>
    ({ id, title, body, tags, type: "shape", colors: true } as LocalAsset),
);

const illustrations: LocalAsset[] = [
  [
    "mountain-dream",
    "Mountain sunrise",
    ["travel", "nature", "adventure"],
    '<rect width="512" height="512" rx="38" fill="#f6dce4"/><circle cx="388" cy="121" r="66" fill="#f5c661"/><path d="M20 415 181 172l90 126 61-84 160 201Z" fill="#8ca9b0"/><path d="m128 252 53-80 42 58-31-10-18 29Z" fill="#fff"/><path d="M20 415h472v67H20Z" fill="#668f7a"/>',
  ],
  [
    "coastal-escape",
    "Coastal escape",
    ["vacation", "travel", "sea"],
    '<rect width="512" height="512" rx="38" fill="#dcedf1"/><circle cx="94" cy="104" r="48" fill="#f4c45e"/><path d="M0 285q128-70 256 0t256 0v227H0Z" fill="#72aabb"/><path d="M0 349q128-70 256 0t256 0" fill="none" stroke="#fff" stroke-width="16" opacity=".7"/><path d="M350 162v196m0-176-72 54h144Z" fill="#fff8ef" stroke="#6b6574" stroke-width="10"/>',
  ],
  [
    "cozy-home",
    "Cozy dream home",
    ["home", "family", "comfort"],
    '<rect width="512" height="512" rx="38" fill="#f5e8df"/><path d="m74 253 182-150 182 150v196H74Z" fill="#e6a991"/><path d="M202 449V320h108v129" fill="#fff7ed"/><path d="M112 279h67v68h-67Zm221 0h67v68h-67Z" fill="#94bdc1"/><path d="M0 449h512v63H0Z" fill="#8db294"/>',
  ],
  [
    "garden-life",
    "Garden life",
    ["garden", "nature", "wellness"],
    `<rect width="512" height="512" rx="38" fill="#e8f2e7"/><path d="M0 383q126-70 256 0t256 0v129H0Z" fill="#7eae80"/>${repeat(
      9,
      (i) =>
        `<path d="M${55 + i * 50} ${
          405 - (i % 3) * 18
        }v-96" stroke="#4f805b" stroke-width="9"/><circle cx="${
          55 + i * 50
        }" cy="${300 - (i % 3) * 18}" r="29" fill="${
          i % 2 ? "#e887a4" : "#f0bd55"
        }"/>`,
    )}`,
  ],
  [
    "career-focus",
    "Career focus",
    ["career", "work", "success"],
    '<rect width="512" height="512" rx="38" fill="#eee8f4"/><rect x="75" y="296" width="362" height="24" rx="12" fill="#815f53"/><path d="M111 320v132m290-132v132" stroke="#815f53" stroke-width="18"/><rect x="146" y="93" width="220" height="168" rx="15" fill="#5f667c"/><rect x="168" y="115" width="176" height="124" fill="#b8d8dc"/><path d="m196 205 40-48 31 29 43-56" fill="none" stroke="#cc668c" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>',
  ],
  [
    "family-moment",
    "Together moment",
    ["family", "relationship", "love"],
    '<rect width="512" height="512" rx="38" fill="#fde7df"/><circle cx="184" cy="174" r="57" fill="#9b654d"/><circle cx="328" cy="174" r="57" fill="#c98f70"/><path d="M83 446c17-139 55-204 101-204s84 65 101 204m-58 0c17-139 55-204 101-204s84 65 101 204" fill="#d77b98" stroke="#654952" stroke-width="12"/><path d="M213 274c22 24 64 24 86 0" fill="none" stroke="#654952" stroke-width="14"/>',
  ],
  [
    "creative-studio",
    "Creative studio",
    ["creativity", "art", "hobby"],
    '<rect width="512" height="512" rx="38" fill="#fff1d8"/><path d="m100 417 100-298 212 71-100 298Z" fill="#fff" stroke="#7e665c" stroke-width="13"/><circle cx="271" cy="249" r="58" fill="#e786a4"/><path d="m152 383 82-89 44 52 48-43 51 80" fill="#89b9a1"/><path d="M88 438h336" stroke="#7e665c" stroke-width="20" stroke-linecap="round"/>',
  ],
  [
    "quiet-reading",
    "Quiet reading",
    ["learning", "calm", "books"],
    '<rect width="512" height="512" rx="38" fill="#e5eff0"/><circle cx="256" cy="129" r="55" fill="#a46e55"/><path d="M140 432c21-151 61-230 116-230s95 79 116 230" fill="#8b7db1"/><path d="M70 281c77-19 139 3 186 55v116c-47-52-109-74-186-55Zm372 0c-77-19-139 3-186 55v116c47-52 109-74 186-55Z" fill="#fff8df" stroke="#745c54" stroke-width="11"/>',
  ],
].map(
  ([id, title, tags, body]) =>
    ({ id, type: "illustration", title, tags, body } as LocalAsset),
);

const scenes: LocalAsset[] = [
  [
    "pink-sky",
    "Pink mountain sky",
    ["travel", "mountain", "dream"],
    "#efd8e4",
    "#8b8294",
    "#665f78",
  ],
  [
    "golden-coast",
    "Golden coast",
    ["vacation", "sea", "sunset"],
    "#f6ddae",
    "#6e9eaa",
    "#3e7186",
  ],
  [
    "green-hills",
    "Green rolling hills",
    ["nature", "wellness", "calm"],
    "#dcebdc",
    "#84ad83",
    "#52745f",
  ],
  [
    "lavender-dawn",
    "Lavender dawn",
    ["morning", "hope", "soft"],
    "#e8def2",
    "#9c8cb5",
    "#655d83",
  ],
  [
    "desert-light",
    "Desert light",
    ["travel", "warm", "adventure"],
    "#f5dfca",
    "#d29070",
    "#9a5f52",
  ],
  [
    "blue-lake",
    "Quiet blue lake",
    ["water", "calm", "nature"],
    "#dcebf1",
    "#79a7b6",
    "#466d7b",
  ],
  [
    "city-dream",
    "City dream",
    ["career", "city", "future"],
    "#e9e4ed",
    "#8b8396",
    "#554e67",
  ],
  [
    "flower-field",
    "Wildflower field",
    ["flowers", "nature", "joy"],
    "#f7e5df",
    "#8aae83",
    "#55715a",
  ],
].map(
  ([id, title, tags, sky, middle, foreground], sceneIndex) =>
    ({
      id,
      type: "photo",
      title,
      tags,
      width: 720,
      height: 540,
      body: `<rect width="720" height="540" fill="${sky}"/><circle cx="${
        sceneIndex % 2 ? 560 : 135
      }" cy="115" r="62" fill="#f7ca68" opacity=".88"/><path d="M0 350 130 214l92 85 112-142 126 151 83-82 177 142v172H0Z" fill="${middle}"/><path d="M0 405q180-105 360 0t360 0v135H0Z" fill="${foreground}"/>${
        sceneIndex === 7
          ? repeat(
              18,
              (i) =>
                `<circle cx="${35 + ((i * 83) % 680)}" cy="${
                  430 + (i % 3) * 32
                }" r="${8 + (i % 4)}" fill="${
                  i % 2 ? "#e985a4" : "#f4c95e"
                }"/>`,
            )
          : ""
      }`,
    } as LocalAsset),
);

const patternDefinitions = [
  [
    "soft-dots",
    "Soft dots",
    ["dots", "minimal"],
    repeat(
      49,
      (i) =>
        `<circle cx="${22 + (i % 7) * 78}" cy="${
          22 + Math.floor(i / 7) * 78
        }" r="8" fill="${i % 2 ? "#d98ca6" : "#8f7ab8"}"/>`,
    ),
  ],
  [
    "calm-waves",
    "Calm waves",
    ["waves", "calm"],
    repeat(
      8,
      (i) =>
        `<path d="M-20 ${
          35 + i * 70
        }q45-35 90 0t90 0 90 0 90 0 90 0 90 0" fill="none" stroke="#c77994" stroke-width="8"/>`,
    ),
  ],
  [
    "notebook-grid",
    "Notebook grid",
    ["grid", "paper", "planning"],
    repeat(
      11,
      (i) =>
        `<line x1="${i * 52}" y1="0" x2="${
          i * 52
        }" y2="512" stroke="#b9d1d5" stroke-width="3"/><line x1="0" y1="${
          i * 52
        }" x2="512" y2="${i * 52}" stroke="#b9d1d5" stroke-width="3"/>`,
    ),
  ],
  [
    "candy-stripes",
    "Candy stripes",
    ["stripes", "playful"],
    repeat(
      12,
      (i) =>
        `<path d="M${-300 + i * 75} 540 80 ${-40 + i * 75}" stroke="${
          i % 2 ? "#ef9db4" : "#e6c6d1"
        }" stroke-width="28"/>`,
    ),
  ],
  [
    "gingham",
    "Soft gingham",
    ["gingham", "home", "fabric"],
    repeat(
      6,
      (i) =>
        `<rect x="${
          i * 102
        }" width="48" height="512" fill="#d88da5" opacity=".24"/><rect y="${
          i * 102
        }" width="512" height="48" fill="#d88da5" opacity=".24"/>`,
    ),
  ],
  [
    "confetti",
    "Celebration confetti",
    ["confetti", "celebrate", "joy"],
    repeat(
      46,
      (i) =>
        `<rect x="${(i * 83) % 500}" y="${
          (i * 137) % 500
        }" width="9" height="25" rx="4" fill="${
          ["#e77f9f", "#efbd56", "#78aa93", "#8977b5"][i % 4]
        }" transform="rotate(${(i * 31) % 180} ${(i * 83) % 500} ${
          (i * 137) % 500
        })"/>`,
    ),
  ],
  [
    "little-hearts",
    "Little hearts",
    ["heart", "love", "relationship"],
    repeat(30, (i) => {
      const x = 25 + ((i * 97) % 480);
      const y = 24 + ((i * 151) % 470);
      return `<path d="M${x} ${
        y + 8
      }c-14-12-26 10 0 29 26-19 14-41 0-29Z" fill="#dd819f"/>`;
    }),
  ],
  [
    "star-field",
    "Star field",
    ["stars", "dream", "night"],
    repeat(36, (i) => {
      const x = 20 + ((i * 107) % 480);
      const y = 20 + ((i * 73) % 480);
      return `<path d="m${x} ${
        y - 10
      } 4 7 8 2-6 6 2 8-8-4-8 4 2-8-6-6 8-2Z" fill="#f2c25b"/>`;
    }),
  ],
  [
    "terrazzo",
    "Warm terrazzo",
    ["terrazzo", "modern", "texture"],
    repeat(34, (i) => {
      const x = 12 + ((i * 89) % 490);
      const y = 12 + ((i * 131) % 490);
      return `<path d="m${x} ${y} ${15 + (i % 14)} ${5 + (i % 9)} -7 ${
        18 + (i % 7)
      } -${12 + (i % 10)} -4Z" fill="${
        ["#cf809a", "#7da995", "#d4a454", "#8977a9"][i % 4]
      }" opacity=".75"/>`;
    }),
  ],
  [
    "arches",
    "Modern arches",
    ["arches", "modern", "retro"],
    repeat(16, (i) => {
      const x = (i % 4) * 138 - 18;
      const y = Math.floor(i / 4) * 138 - 20;
      return `<path d="M${x} ${y + 110}V${
        y + 58
      }a55 55 0 0 1 110 0v52" fill="none" stroke="${
        i % 2 ? "#d987a3" : "#8bb29f"
      }" stroke-width="18"/>`;
    }),
  ],
  [
    "linen",
    "Natural linen",
    ["linen", "fabric", "texture"],
    repeat(
      26,
      (i) =>
        `<line x1="${i * 21}" y1="0" x2="${
          i * 21 - 45
        }" y2="512" stroke="#bba992" stroke-width="3" opacity=".45"/><line x1="0" y1="${
          i * 21
        }" x2="512" y2="${
          i * 21 + 38
        }" stroke="#fff" stroke-width="2" opacity=".65"/>`,
    ),
  ],
  [
    "paper-speckle",
    "Paper speckle",
    ["paper", "grain", "texture"],
    repeat(
      90,
      (i) =>
        `<circle cx="${(i * 71) % 510}" cy="${(i * 113) % 510}" r="${
          1 + (i % 3)
        }" fill="#967d75" opacity="${0.12 + (i % 4) * 0.05}"/>`,
    ),
  ],
] as const;

const patterns: LocalAsset[] = patternDefinitions.map(
  ([id, title, tags, body], index) => ({
    id,
    type: "pattern",
    title,
    tags: [...tags],
    colors: index < 4,
    body: `<rect width="512" height="512" fill="${
      index % 3 === 0 ? "#fff8fa" : index % 3 === 1 ? "#f5edf2" : "#f8f3e8"
    }"/>${body}`,
  }),
);

const catalog = [
  ...scenes,
  ...stickers,
  ...illustrations,
  ...frames,
  ...patterns,
];

const assets = catalog.map((item): GratitudeAsset => {
  const source = svg(item.body, item.width, item.height);
  const dataUrl = `data:image/svg+xml,${encodeURIComponent(source)}`;
  return {
    id: `curated:${item.id}`,
    provider: "curated-local",
    externalId: item.id,
    type: item.type,
    title: item.title,
    tags: [...item.tags, "offline", "curated"],
    previewUrl: dataUrl,
    assetUrl: dataUrl,
    mimeType: "image/svg+xml",
    width: item.width || 512,
    height: item.height || 512,
    license: {
      tier: "A",
      id: "gratitude-original",
      label: "Gratitude original",
      attributionRequired: false,
    },
    editable: {
      colors: !!item.colors,
      stroke: !!item.colors,
      crop: item.type === "photo",
      filters: item.type === "photo",
    },
  };
});

export const curatedLocalProvider: AssetProvider = {
  id: "curated-local",
  capabilities: { search: true, categories: true, pagination: false },
  async search(query) {
    const terms =
      query.search?.toLowerCase().split(/\s+/).filter(Boolean) || [];
    return {
      items: assets
        .filter(
          (asset) =>
            (!query.type || asset.type === query.type) &&
            (!terms.length ||
              terms.some((term) =>
                `${asset.title} ${asset.tags.join(" ")}`
                  .toLowerCase()
                  .includes(term),
              )),
        )
        .slice(0, query.limit || 30),
    };
  },
  async resolve(assetId) {
    const asset = assets.find((item) => item.id === assetId);
    if (!asset) {
      throw new Error(`Unknown curated asset: ${assetId}`);
    }
    return asset;
  },
  async fetchAsset(asset, ownerWindow) {
    if (!assets.some((item) => item.id === asset.id)) {
      throw new Error("Unknown curated asset");
    }
    return (await ownerWindow.fetch(asset.assetUrl)).blob();
  },
};

export const CURATED_LOCAL_ASSET_COUNT = assets.length;
