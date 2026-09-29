import path from "path";

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import { ViteEjsPlugin } from "vite-plugin-ejs";
import { VitePWA } from "vite-plugin-pwa";
import checker from "vite-plugin-checker";
import { createHtmlPlugin } from "vite-plugin-html";

import { woff2BrowserPlugin } from "../scripts/woff2/woff2-vite-plugins";
import { searchPexels } from "../server/pexels.mjs";
import { searchOpenverse } from "../server/openverse.mjs";
import { searchWikimedia } from "../server/wikimedia.mjs";
import { searchSmithsonian } from "../server/smithsonian.mjs";
import { searchRijksmuseum } from "../server/rijksmuseum.mjs";
import { patternMonsterRequest } from "../server/patternMonster.mjs";
export default defineConfig(({ mode }) => {
  // To load .env variables
  const envVars = loadEnv(mode, `../`);
  const privateEnv = loadEnv(mode, `../`, "");
  // https://vitejs.dev/config/
  return {
    server: {
      port: Number(envVars.VITE_APP_PORT || 3000),
      strictPort: true,
      // open the browser
      open: true,
    },
    // We need to specify the envDir since now there are no
    //more located in parallel with the vite.config.ts file but in parent dir
    envDir: "../",
    resolve: {
      alias: [
        {
          find: /^@excalidraw\/common$/,
          replacement: path.resolve(
            __dirname,
            "../packages/common/src/index.ts",
          ),
        },
        {
          find: /^@excalidraw\/common\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/common/src/$1"),
        },
        {
          find: /^@excalidraw\/element$/,
          replacement: path.resolve(
            __dirname,
            "../packages/element/src/index.ts",
          ),
        },
        {
          find: /^@excalidraw\/element\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/element/src/$1"),
        },
        {
          find: /^@excalidraw\/excalidraw$/,
          replacement: path.resolve(
            __dirname,
            "../packages/excalidraw/index.tsx",
          ),
        },
        {
          find: /^@excalidraw\/excalidraw\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/excalidraw/$1"),
        },
        {
          find: /^@excalidraw\/math$/,
          replacement: path.resolve(__dirname, "../packages/math/src/index.ts"),
        },
        {
          find: /^@excalidraw\/math\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/math/src/$1"),
        },
        {
          find: /^@excalidraw\/utils$/,
          replacement: path.resolve(
            __dirname,
            "../packages/utils/src/index.ts",
          ),
        },
        {
          find: /^@excalidraw\/utils\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/utils/src/$1"),
        },
        {
          find: /^@excalidraw\/fractional-indexing$/,
          replacement: path.resolve(
            __dirname,
            "../packages/fractional-indexing/src/index.ts",
          ),
        },
        {
          find: /^@excalidraw\/laser-pointer$/,
          replacement: path.resolve(
            __dirname,
            "../packages/laser-pointer/src/index.ts",
          ),
        },
      ],
    },
    build: {
      outDir: "build",
      rollupOptions: {
        output: {
          assetFileNames(chunkInfo) {
            if (chunkInfo?.name?.endsWith(".woff2")) {
              const family = chunkInfo.name.split("-")[0];
              return `fonts/${family}/[name][extname]`;
            }

            return "assets/[name]-[hash][extname]";
          },
          // Creating separate chunk for locales except for en and percentages.json so they
          // can be cached at runtime and not merged with
          // app precache. en.json and percentages.json are needed for first load
          // or fallback hence not clubbing with locales so first load followed by offline mode works fine. This is how CRA used to work too.
          manualChunks(id) {
            if (
              id.includes("packages/excalidraw/locales") &&
              id.match(/en.json|percentages.json/) === null
            ) {
              const index = id.indexOf("locales/");
              // Taking the substring after "locales/"
              return `locales/${id.substring(index + 8)}`;
            }

            if (id.includes("@excalidraw/mermaid-to-excalidraw")) {
              return "mermaid-to-excalidraw";
            }

            if (id.includes("@codemirror/") || id.includes("@lezer/")) {
              return "codemirror.chunk";
            }
          },
        },
      },
      sourcemap: true,
      // don't auto-inline small assets (i.e. fonts hosted on CDN)
      assetsInlineLimit: 0,
    },
    plugins: [
      {
        name: "gratitude-pexels-dev-api",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use("/reset-local-data", (request, response) => {
            if (request.headers.host !== "localhost:3000") {
              response.statusCode = 400;
              response.end("Open this page at localhost:3000.");
              return;
            }
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.setHeader("Cache-Control", "no-store");
            response.setHeader("Clear-Site-Data", '"cache", "storage"');
            response.end(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Reset local app data</title>
<body style="font:16px system-ui;max-width:36rem;margin:4rem auto;padding:1rem">
<h1>Clearing localhost app data…</h1><p id="status">Please wait.</p>
<script>
(async () => {
  const root = document.getElementById("status");
  const ownerWindow = root.ownerDocument.defaultView;
  const attempts = [];
  try { ownerWindow.localStorage.clear(); } catch (error) { attempts.push(error); }
  try { ownerWindow.sessionStorage.clear(); } catch (error) { attempts.push(error); }
  try {
    const keys = await ownerWindow.caches.keys();
    await Promise.all(keys.map((key) => ownerWindow.caches.delete(key)));
  } catch (error) { attempts.push(error); }
  try {
    const registrations = await ownerWindow.navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch (error) { attempts.push(error); }
  try {
    const databases = await ownerWindow.indexedDB.databases();
    await Promise.all(databases.filter((database) => database.name).map((database) => new Promise((resolve) => {
      const deletion = ownerWindow.indexedDB.deleteDatabase(database.name);
      deletion.onsuccess = resolve;
      deletion.onerror = resolve;
      deletion.onblocked = resolve;
    })));
  } catch (error) { attempts.push(error); }
  root.textContent = attempts.length ? "Some browser data could not be cleared. Opening the app…" : "Local data cleared. Opening the app…";
  ownerWindow.setTimeout(() => ownerWindow.location.replace("/"), 700);
})();
</script></body></html>`);
          });
          server.middlewares.use("/sw.js", (_request, response) => {
            response.setHeader("Content-Type", "application/javascript");
            response.setHeader("Cache-Control", "no-store");
            response.end(`self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.registration.unregister().then(() =>
    self.clients.matchAll().then((clients) =>
      Promise.all(clients.map((client) => client.navigate(client.url)))
    )
  ));
});`);
          });
          server.middlewares.use("/api/pexels", async (request, response) => {
            const result = await searchPexels(
              new URL(request.url || "", "http://localhost").searchParams,
              privateEnv.PEXELS_API_KEY || process.env.PEXELS_API_KEY,
            );
            response.statusCode = result.status;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(result.body));
          });
          server.middlewares.use(
            "/api/openverse",
            async (request, response) => {
              const result = await searchOpenverse(
                new URL(request.url || "", "http://localhost").searchParams,
              );
              response.statusCode = result.status;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify(result.body));
            },
          );
          server.middlewares.use(
            "/api/wikimedia",
            async (request, response) => {
              const result = await searchWikimedia(
                new URL(request.url || "", "http://localhost").searchParams,
              );
              response.statusCode = result.status;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify(result.body));
            },
          );
          server.middlewares.use(
            "/api/smithsonian",
            async (request, response) => {
              const result = await searchSmithsonian(
                new URL(request.url || "", "http://localhost").searchParams,
                privateEnv.SMITHSONIAN_API_KEY ||
                  process.env.SMITHSONIAN_API_KEY,
              );
              response.statusCode = result.status;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify(result.body));
            },
          );
          server.middlewares.use(
            "/api/rijksmuseum",
            async (request, response) => {
              const result = await searchRijksmuseum(
                new URL(request.url || "", "http://localhost").searchParams,
              );
              response.statusCode = result.status;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify(result.body));
            },
          );
          server.middlewares.use(
            "/api/pattern-monster",
            async (request, response) => {
              const result = await patternMonsterRequest(
                new URL(request.url || "", "http://localhost").searchParams,
                privateEnv.PATTERN_MONSTER_API_KEY ||
                  process.env.PATTERN_MONSTER_API_KEY,
              );
              response.statusCode = result.status;
              response.setHeader("Content-Type", result.contentType);
              response.end(
                typeof result.body === "string"
                  ? result.body
                  : JSON.stringify(result.body),
              );
            },
          );
        },
        configurePreviewServer(server) {
          server.middlewares.use("/api/pexels", async (request, response) => {
            const result = await searchPexels(
              new URL(request.url || "", "http://localhost").searchParams,
              privateEnv.PEXELS_API_KEY || process.env.PEXELS_API_KEY,
            );
            response.statusCode = result.status;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(result.body));
          });
          server.middlewares.use(
            "/api/openverse",
            async (request, response) => {
              const result = await searchOpenverse(
                new URL(request.url || "", "http://localhost").searchParams,
              );
              response.statusCode = result.status;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify(result.body));
            },
          );
          server.middlewares.use(
            "/api/wikimedia",
            async (request, response) => {
              const result = await searchWikimedia(
                new URL(request.url || "", "http://localhost").searchParams,
              );
              response.statusCode = result.status;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify(result.body));
            },
          );
          server.middlewares.use(
            "/api/smithsonian",
            async (request, response) => {
              const result = await searchSmithsonian(
                new URL(request.url || "", "http://localhost").searchParams,
                privateEnv.SMITHSONIAN_API_KEY ||
                  process.env.SMITHSONIAN_API_KEY,
              );
              response.statusCode = result.status;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify(result.body));
            },
          );
          server.middlewares.use(
            "/api/rijksmuseum",
            async (request, response) => {
              const result = await searchRijksmuseum(
                new URL(request.url || "", "http://localhost").searchParams,
              );
              response.statusCode = result.status;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify(result.body));
            },
          );
          server.middlewares.use(
            "/api/pattern-monster",
            async (request, response) => {
              const result = await patternMonsterRequest(
                new URL(request.url || "", "http://localhost").searchParams,
                privateEnv.PATTERN_MONSTER_API_KEY ||
                  process.env.PATTERN_MONSTER_API_KEY,
              );
              response.statusCode = result.status;
              response.setHeader("Content-Type", result.contentType);
              response.end(
                typeof result.body === "string"
                  ? result.body
                  : JSON.stringify(result.body),
              );
            },
          );
        },
      },
      woff2BrowserPlugin(),
      react(),
      checker({
        typescript: true,
        eslint:
          envVars.VITE_APP_ENABLE_ESLINT === "false"
            ? undefined
            : { lintCommand: 'eslint "./**/*.{js,ts,tsx}"' },
        overlay: {
          initialIsOpen: envVars.VITE_APP_COLLAPSE_OVERLAY === "false",
          badgeStyle: "margin-bottom: 4rem; margin-left: 1rem",
        },
      }),
      svgrPlugin(),
      ViteEjsPlugin(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          /* set this flag to true to enable in Development mode */
          enabled: envVars.VITE_APP_ENABLE_PWA === "true",
        },

        workbox: {
          // don't precache fonts, locales and separate chunks
          globIgnores: [
            "fonts.css",
            "**/locales/**",
            "service-worker.js",
            "**/*.chunk-*.js",
            // CodeMirrorEditor can't be assigned a `.chunk` name via
            // manualChunks because Rollup would hoist shared deps (React)
            // via a static import from the main bundle, defeating lazy
            // loading. So we exclude it by name instead.
            "**/CodeMirrorEditor-*.js",
            // Mermaid and its graph/layout engines are optional editor tools.
            // Cache them after first use instead of adding ~1.6 MB to every
            // Gratitude Studio service-worker installation.
            "**/mermaid-to-excalidraw-*.js",
            "**/cytoscape.esm-*.js",
            "**/cose-bilkent-*.js",
            "**/*Diagram-*.js",
            "**/diagram-*.js",
            "**/chunk-*.js",
            "**/dagre-*.js",
            "**/graph-*.js",
            "**/layout-*.js",
            "**/treemap-*.js",
            "**/katex-*.js",
          ],
          runtimeCaching: [
            {
              urlPattern: new RegExp(".+.woff2"),
              handler: "CacheFirst",
              options: {
                cacheName: "fonts",
                expiration: {
                  maxEntries: 1000,
                  maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
                },
                cacheableResponse: {
                  // 0 to cache "opaque" responses from cross-origin requests (i.e. CDN)
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: new RegExp("fonts.css"),
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "fonts",
                expiration: {
                  maxEntries: 50,
                },
              },
            },
            {
              urlPattern: new RegExp("locales/[^/]+.js"),
              handler: "CacheFirst",
              options: {
                cacheName: "locales",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // <== 30 days
                },
              },
            },
            {
              urlPattern: new RegExp("(.chunk-.+|CodeMirrorEditor-.+)\\.js"),
              handler: "CacheFirst",
              options: {
                cacheName: "chunk",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 90, // <== 90 days
                },
              },
            },
            {
              urlPattern: new RegExp(
                "(mermaid-to-excalidraw|cytoscape|cose-bilkent|.+Diagram|diagram-|chunk-|dagre-|graph-|layout-|treemap-|katex-).+\\.js",
              ),
              handler: "CacheFirst",
              options: {
                cacheName: "optional-editor-tools",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
          maximumFileSizeToCacheInBytes: 2.3 * 1024 ** 2, // 2.3MB
        },
        manifest: {
          short_name: "Gratitude",
          name: "Gratitude Studio",
          description: "Create and reflect on your vision board.",
          start_url: "/",
          id: "gratitude-studio",
          display: "standalone",
          theme_color: "#f8edf2",
          background_color: "#f8edf2",
        },
      }),
      createHtmlPlugin({
        minify: true,
      }),
    ],
    publicDir: "../public",
  };
});
