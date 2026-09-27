// lazy.config.ts
var config = {
  baseCacheConfig: {
    include: [
      "<rootDir>/package.json",
      "<rootDir>/yarn.lock",
      "<rootDir>/lazy.config.ts",
      "<rootDir>/internal/config/**/*",
      "<rootDir>/internal/scripts/**/*",
      "package.json"
    ],
    exclude: [
      "<allWorkspaceDirs>/coverage/**/*",
      "<allWorkspaceDirs>/dist*/**/*",
      "<allWorkspaceDirs>/.next*/**/*",
      "**/*.tsbuildinfo",
      "<rootDir>/docs/gen/**/*"
    ]
  },
  scripts: {
    build: {
      baseCommand: "exit 0",
      runsAfter: {
        prebuild: {},
        "refresh-assets": {},
        "build-i18n": {}
      },
      workspaceOverrides: {
        "apps/vscode/*": { runsAfter: { "refresh-assets": {} } },
        "packages/*": {
          runsAfter: { "build-api": { in: "self-only" }, prebuild: { in: "self-only" } },
          cache: {
            inputs: ["api/**/*", "src/**/*"]
          }
        },
        "apps/docs": {
          runsAfter: { "build-api": { in: "all-packages" } },
          cache: {
            inputs: [
              "app/**/*",
              "api/**/*",
              "components/**/*",
              "public/**/*",
              "scrips/**/*",
              "styles/**/*",
              "types/**/*",
              "utils/**/*"
            ]
          }
        }
      }
    },
    dev: {
      execution: "independent",
      runsAfter: { predev: {}, "refresh-assets": {}, "build-i18n": {} },
      cache: "none",
      workspaceOverrides: {
        "apps/vscode/*": { runsAfter: { build: { in: "self-only" } } }
      }
    },
    // predev/prebuild are the css-copy scripts. They write generated, gitignored files
    // (tldraw.css, commenting.css, ...) that lazy doesn't track as outputs, so a cache hit
    // would skip regenerating a file that's missing on disk and vite would fail to resolve it.
    // They're a few file copies, so just always run them.
    predev: {
      cache: "none"
    },
    prebuild: {
      cache: "none"
    },
    e2e: {
      cache: "none"
    },
    "e2e-x10": {
      cache: "none"
    },
    context: {
      execution: "independent",
      cache: "none"
    },
    "pack-tarball": {
      parallel: false
    },
    "refresh-assets": {
      execution: "top-level",
      baseCommand: `tsx <rootDir>/internal/scripts/refresh-assets.ts`,
      cache: {
        inputs: [
          "package.json",
          `<rootDir>/internal/scripts/refresh-assets.ts`,
          `<rootDir>/assets/**/*`,
          `<rootDir>/apps/dotcom/client/assets/**/*`,
          `<rootDir>/packages/*/package.json`
        ]
      }
    },
    "build-types": {
      execution: "top-level",
      baseCommand: `tsx <rootDir>/internal/scripts/typecheck.ts`,
      cache: {
        inputs: {
          include: ["<allWorkspaceDirs>/**/*.{ts,tsx}", "<allWorkspaceDirs>/tsconfig.json"],
          exclude: ["<allWorkspaceDirs>/dist*/**/*", "<allWorkspaceDirs>/api/**/*"]
        },
        outputs: ["<allWorkspaceDirs>/*.tsbuildinfo", "<allWorkspaceDirs>/.tsbuild/**/*"]
      },
      runsAfter: {
        "refresh-assets": {},
        "maybe-clean-tsbuildinfo": {}
      }
    },
    "build-api": {
      execution: "independent",
      cache: {
        inputs: [".tsbuild/**/*.d.ts", "tsconfig.json"],
        outputs: ["api/**/*"]
      },
      runsAfter: {
        "build-types": {
          // Because build-types is top level, if usesOutput were set to true every
          // build-api task would depend on all the .tsbuild files in the whole
          // repo. So we set this to false and configure it to use only the
          // local .tsbuild files
          usesOutput: false
        }
      }
    },
    "build-i18n": {
      execution: "independent",
      cache: {
        inputs: ["<rootDir>/apps/dotcom/client/public/tla/locales/*.json"],
        outputs: ["<rootDir>/apps/dotcom/client/public/tla/locales-compiled/*.json"]
      }
    },
    "api-check": {
      execution: "top-level",
      baseCommand: `tsx <rootDir>/internal/scripts/api-check.ts`,
      runsAfter: { "build-api": {} },
      cache: {
        inputs: [`<rootDir>/packages/*/api/public.d.ts`]
      }
    }
  }
};
var lazy_config_default = config;

// .lazy/config.source.mjs
var config_source_default = lazy_config_default;
export {
  config_source_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbGF6eS5jb25maWcudHMiLCAiY29uZmlnLnNvdXJjZS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IExhenlDb25maWcgfSBmcm9tICdsYXp5cmVwbydcclxuXHJcbmNvbnN0IGNvbmZpZyA9IHtcclxuXHRiYXNlQ2FjaGVDb25maWc6IHtcclxuXHRcdGluY2x1ZGU6IFtcclxuXHRcdFx0Jzxyb290RGlyPi9wYWNrYWdlLmpzb24nLFxyXG5cdFx0XHQnPHJvb3REaXI+L3lhcm4ubG9jaycsXHJcblx0XHRcdCc8cm9vdERpcj4vbGF6eS5jb25maWcudHMnLFxyXG5cdFx0XHQnPHJvb3REaXI+L2ludGVybmFsL2NvbmZpZy8qKi8qJyxcclxuXHRcdFx0Jzxyb290RGlyPi9pbnRlcm5hbC9zY3JpcHRzLyoqLyonLFxyXG5cdFx0XHQncGFja2FnZS5qc29uJyxcclxuXHRcdF0sXHJcblx0XHRleGNsdWRlOiBbXHJcblx0XHRcdCc8YWxsV29ya3NwYWNlRGlycz4vY292ZXJhZ2UvKiovKicsXHJcblx0XHRcdCc8YWxsV29ya3NwYWNlRGlycz4vZGlzdCovKiovKicsXHJcblx0XHRcdCc8YWxsV29ya3NwYWNlRGlycz4vLm5leHQqLyoqLyonLFxyXG5cdFx0XHQnKiovKi50c2J1aWxkaW5mbycsXHJcblx0XHRcdCc8cm9vdERpcj4vZG9jcy9nZW4vKiovKicsXHJcblx0XHRdLFxyXG5cdH0sXHJcblx0c2NyaXB0czoge1xyXG5cdFx0YnVpbGQ6IHtcclxuXHRcdFx0YmFzZUNvbW1hbmQ6ICdleGl0IDAnLFxyXG5cdFx0XHRydW5zQWZ0ZXI6IHtcclxuXHRcdFx0XHRwcmVidWlsZDoge30sXHJcblx0XHRcdFx0J3JlZnJlc2gtYXNzZXRzJzoge30sXHJcblx0XHRcdFx0J2J1aWxkLWkxOG4nOiB7fSxcclxuXHRcdFx0fSxcclxuXHRcdFx0d29ya3NwYWNlT3ZlcnJpZGVzOiB7XHJcblx0XHRcdFx0J2FwcHMvdnNjb2RlLyonOiB7IHJ1bnNBZnRlcjogeyAncmVmcmVzaC1hc3NldHMnOiB7fSB9IH0sXHJcblx0XHRcdFx0J3BhY2thZ2VzLyonOiB7XHJcblx0XHRcdFx0XHRydW5zQWZ0ZXI6IHsgJ2J1aWxkLWFwaSc6IHsgaW46ICdzZWxmLW9ubHknIH0sIHByZWJ1aWxkOiB7IGluOiAnc2VsZi1vbmx5JyB9IH0sXHJcblx0XHRcdFx0XHRjYWNoZToge1xyXG5cdFx0XHRcdFx0XHRpbnB1dHM6IFsnYXBpLyoqLyonLCAnc3JjLyoqLyonXSxcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHQnYXBwcy9kb2NzJzoge1xyXG5cdFx0XHRcdFx0cnVuc0FmdGVyOiB7ICdidWlsZC1hcGknOiB7IGluOiAnYWxsLXBhY2thZ2VzJyB9IH0sXHJcblx0XHRcdFx0XHRjYWNoZToge1xyXG5cdFx0XHRcdFx0XHRpbnB1dHM6IFtcclxuXHRcdFx0XHRcdFx0XHQnYXBwLyoqLyonLFxyXG5cdFx0XHRcdFx0XHRcdCdhcGkvKiovKicsXHJcblx0XHRcdFx0XHRcdFx0J2NvbXBvbmVudHMvKiovKicsXHJcblx0XHRcdFx0XHRcdFx0J3B1YmxpYy8qKi8qJyxcclxuXHRcdFx0XHRcdFx0XHQnc2NyaXBzLyoqLyonLFxyXG5cdFx0XHRcdFx0XHRcdCdzdHlsZXMvKiovKicsXHJcblx0XHRcdFx0XHRcdFx0J3R5cGVzLyoqLyonLFxyXG5cdFx0XHRcdFx0XHRcdCd1dGlscy8qKi8qJyxcclxuXHRcdFx0XHRcdFx0XSxcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSxcclxuXHRcdH0sXHJcblx0XHRkZXY6IHtcclxuXHRcdFx0ZXhlY3V0aW9uOiAnaW5kZXBlbmRlbnQnLFxyXG5cdFx0XHRydW5zQWZ0ZXI6IHsgcHJlZGV2OiB7fSwgJ3JlZnJlc2gtYXNzZXRzJzoge30sICdidWlsZC1pMThuJzoge30gfSxcclxuXHRcdFx0Y2FjaGU6ICdub25lJyxcclxuXHRcdFx0d29ya3NwYWNlT3ZlcnJpZGVzOiB7XHJcblx0XHRcdFx0J2FwcHMvdnNjb2RlLyonOiB7IHJ1bnNBZnRlcjogeyBidWlsZDogeyBpbjogJ3NlbGYtb25seScgfSB9IH0sXHJcblx0XHRcdH0sXHJcblx0XHR9LFxyXG5cdFx0Ly8gcHJlZGV2L3ByZWJ1aWxkIGFyZSB0aGUgY3NzLWNvcHkgc2NyaXB0cy4gVGhleSB3cml0ZSBnZW5lcmF0ZWQsIGdpdGlnbm9yZWQgZmlsZXNcclxuXHRcdC8vICh0bGRyYXcuY3NzLCBjb21tZW50aW5nLmNzcywgLi4uKSB0aGF0IGxhenkgZG9lc24ndCB0cmFjayBhcyBvdXRwdXRzLCBzbyBhIGNhY2hlIGhpdFxyXG5cdFx0Ly8gd291bGQgc2tpcCByZWdlbmVyYXRpbmcgYSBmaWxlIHRoYXQncyBtaXNzaW5nIG9uIGRpc2sgYW5kIHZpdGUgd291bGQgZmFpbCB0byByZXNvbHZlIGl0LlxyXG5cdFx0Ly8gVGhleSdyZSBhIGZldyBmaWxlIGNvcGllcywgc28ganVzdCBhbHdheXMgcnVuIHRoZW0uXHJcblx0XHRwcmVkZXY6IHtcclxuXHRcdFx0Y2FjaGU6ICdub25lJyxcclxuXHRcdH0sXHJcblx0XHRwcmVidWlsZDoge1xyXG5cdFx0XHRjYWNoZTogJ25vbmUnLFxyXG5cdFx0fSxcclxuXHRcdGUyZToge1xyXG5cdFx0XHRjYWNoZTogJ25vbmUnLFxyXG5cdFx0fSxcclxuXHRcdCdlMmUteDEwJzoge1xyXG5cdFx0XHRjYWNoZTogJ25vbmUnLFxyXG5cdFx0fSxcclxuXHRcdGNvbnRleHQ6IHtcclxuXHRcdFx0ZXhlY3V0aW9uOiAnaW5kZXBlbmRlbnQnLFxyXG5cdFx0XHRjYWNoZTogJ25vbmUnLFxyXG5cdFx0fSxcclxuXHRcdCdwYWNrLXRhcmJhbGwnOiB7XHJcblx0XHRcdHBhcmFsbGVsOiBmYWxzZSxcclxuXHRcdH0sXHJcblx0XHQncmVmcmVzaC1hc3NldHMnOiB7XHJcblx0XHRcdGV4ZWN1dGlvbjogJ3RvcC1sZXZlbCcsXHJcblx0XHRcdGJhc2VDb21tYW5kOiBgdHN4IDxyb290RGlyPi9pbnRlcm5hbC9zY3JpcHRzL3JlZnJlc2gtYXNzZXRzLnRzYCxcclxuXHRcdFx0Y2FjaGU6IHtcclxuXHRcdFx0XHRpbnB1dHM6IFtcclxuXHRcdFx0XHRcdCdwYWNrYWdlLmpzb24nLFxyXG5cdFx0XHRcdFx0YDxyb290RGlyPi9pbnRlcm5hbC9zY3JpcHRzL3JlZnJlc2gtYXNzZXRzLnRzYCxcclxuXHRcdFx0XHRcdGA8cm9vdERpcj4vYXNzZXRzLyoqLypgLFxyXG5cdFx0XHRcdFx0YDxyb290RGlyPi9hcHBzL2RvdGNvbS9jbGllbnQvYXNzZXRzLyoqLypgLFxyXG5cdFx0XHRcdFx0YDxyb290RGlyPi9wYWNrYWdlcy8qL3BhY2thZ2UuanNvbmAsXHJcblx0XHRcdFx0XSxcclxuXHRcdFx0fSxcclxuXHRcdH0sXHJcblx0XHQnYnVpbGQtdHlwZXMnOiB7XHJcblx0XHRcdGV4ZWN1dGlvbjogJ3RvcC1sZXZlbCcsXHJcblx0XHRcdGJhc2VDb21tYW5kOiBgdHN4IDxyb290RGlyPi9pbnRlcm5hbC9zY3JpcHRzL3R5cGVjaGVjay50c2AsXHJcblx0XHRcdGNhY2hlOiB7XHJcblx0XHRcdFx0aW5wdXRzOiB7XHJcblx0XHRcdFx0XHRpbmNsdWRlOiBbJzxhbGxXb3Jrc3BhY2VEaXJzPi8qKi8qLnt0cyx0c3h9JywgJzxhbGxXb3Jrc3BhY2VEaXJzPi90c2NvbmZpZy5qc29uJ10sXHJcblx0XHRcdFx0XHRleGNsdWRlOiBbJzxhbGxXb3Jrc3BhY2VEaXJzPi9kaXN0Ki8qKi8qJywgJzxhbGxXb3Jrc3BhY2VEaXJzPi9hcGkvKiovKiddLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0b3V0cHV0czogWyc8YWxsV29ya3NwYWNlRGlycz4vKi50c2J1aWxkaW5mbycsICc8YWxsV29ya3NwYWNlRGlycz4vLnRzYnVpbGQvKiovKiddLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRydW5zQWZ0ZXI6IHtcclxuXHRcdFx0XHQncmVmcmVzaC1hc3NldHMnOiB7fSxcclxuXHRcdFx0XHQnbWF5YmUtY2xlYW4tdHNidWlsZGluZm8nOiB7fSxcclxuXHRcdFx0fSxcclxuXHRcdH0sXHJcblx0XHQnYnVpbGQtYXBpJzoge1xyXG5cdFx0XHRleGVjdXRpb246ICdpbmRlcGVuZGVudCcsXHJcblx0XHRcdGNhY2hlOiB7XHJcblx0XHRcdFx0aW5wdXRzOiBbJy50c2J1aWxkLyoqLyouZC50cycsICd0c2NvbmZpZy5qc29uJ10sXHJcblx0XHRcdFx0b3V0cHV0czogWydhcGkvKiovKiddLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRydW5zQWZ0ZXI6IHtcclxuXHRcdFx0XHQnYnVpbGQtdHlwZXMnOiB7XHJcblx0XHRcdFx0XHQvLyBCZWNhdXNlIGJ1aWxkLXR5cGVzIGlzIHRvcCBsZXZlbCwgaWYgdXNlc091dHB1dCB3ZXJlIHNldCB0byB0cnVlIGV2ZXJ5XHJcblx0XHRcdFx0XHQvLyBidWlsZC1hcGkgdGFzayB3b3VsZCBkZXBlbmQgb24gYWxsIHRoZSAudHNidWlsZCBmaWxlcyBpbiB0aGUgd2hvbGVcclxuXHRcdFx0XHRcdC8vIHJlcG8uIFNvIHdlIHNldCB0aGlzIHRvIGZhbHNlIGFuZCBjb25maWd1cmUgaXQgdG8gdXNlIG9ubHkgdGhlXHJcblx0XHRcdFx0XHQvLyBsb2NhbCAudHNidWlsZCBmaWxlc1xyXG5cdFx0XHRcdFx0dXNlc091dHB1dDogZmFsc2UsXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSxcclxuXHRcdH0sXHJcblx0XHQnYnVpbGQtaTE4bic6IHtcclxuXHRcdFx0ZXhlY3V0aW9uOiAnaW5kZXBlbmRlbnQnLFxyXG5cdFx0XHRjYWNoZToge1xyXG5cdFx0XHRcdGlucHV0czogWyc8cm9vdERpcj4vYXBwcy9kb3Rjb20vY2xpZW50L3B1YmxpYy90bGEvbG9jYWxlcy8qLmpzb24nXSxcclxuXHRcdFx0XHRvdXRwdXRzOiBbJzxyb290RGlyPi9hcHBzL2RvdGNvbS9jbGllbnQvcHVibGljL3RsYS9sb2NhbGVzLWNvbXBpbGVkLyouanNvbiddLFxyXG5cdFx0XHR9LFxyXG5cdFx0fSxcclxuXHRcdCdhcGktY2hlY2snOiB7XHJcblx0XHRcdGV4ZWN1dGlvbjogJ3RvcC1sZXZlbCcsXHJcblx0XHRcdGJhc2VDb21tYW5kOiBgdHN4IDxyb290RGlyPi9pbnRlcm5hbC9zY3JpcHRzL2FwaS1jaGVjay50c2AsXHJcblx0XHRcdHJ1bnNBZnRlcjogeyAnYnVpbGQtYXBpJzoge30gfSxcclxuXHRcdFx0Y2FjaGU6IHtcclxuXHRcdFx0XHRpbnB1dHM6IFtgPHJvb3REaXI+L3BhY2thZ2VzLyovYXBpL3B1YmxpYy5kLnRzYF0sXHJcblx0XHRcdH0sXHJcblx0XHR9LFxyXG5cdH0sXHJcbn0gc2F0aXNmaWVzIExhenlDb25maWdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNvbmZpZ1xyXG4iLCAiaW1wb3J0IGNvbmZpZyBmcm9tICdDOi9Vc2Vycy9qYXlwYS9PbmVEcml2ZS9QaWN0dXJlcy9ncmF0aXR1ZGVCb2FyZC92ZW5kb3IvdGxkcmF3L2xhenkuY29uZmlnLnRzJzsgZXhwb3J0IGRlZmF1bHQgY29uZmlnIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLElBQU0sU0FBUztBQUFBLEVBQ2QsaUJBQWlCO0FBQUEsSUFDaEIsU0FBUztBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Q7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUixPQUFPO0FBQUEsTUFDTixhQUFhO0FBQUEsTUFDYixXQUFXO0FBQUEsUUFDVixVQUFVLENBQUM7QUFBQSxRQUNYLGtCQUFrQixDQUFDO0FBQUEsUUFDbkIsY0FBYyxDQUFDO0FBQUEsTUFDaEI7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ25CLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLEVBQUU7QUFBQSxRQUN2RCxjQUFjO0FBQUEsVUFDYixXQUFX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
