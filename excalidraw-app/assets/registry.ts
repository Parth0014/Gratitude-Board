import {
  readCachedBlob,
  readCachedSearch,
  writeCachedBlob,
  writeCachedSearch,
} from "./cache";
import { normalizeGratitudeAsset } from "./contracts";
import { builtinProvider } from "./providers/builtin";
import { creativeBuiltinProvider } from "./providers/creativeBuiltin";
import { iconifyProvider } from "./providers/iconify";
import { notoEmojiProvider } from "./providers/notoEmoji";
import { openverseProvider } from "./providers/openverse";
import { pexelsProvider } from "./providers/pexels";
import { wikimediaProvider } from "./providers/wikimedia";
import { smithsonianProvider } from "./providers/smithsonian";
import { rijksmuseumProvider } from "./providers/rijksmuseum";
import { openIllustrationsProvider } from "./providers/openIllustrations";
import { kenneyProvider } from "./providers/kenney";
import { patternMonsterProvider } from "./providers/patternMonster";
import { rankAssets } from "./ranking";

import type {
  AssetPage,
  AssetProvider,
  AssetQuery,
  AssetSearchResult,
  GratitudeAsset,
} from "./contracts";

const providers = new Map<string, AssetProvider>([
  [builtinProvider.id, builtinProvider],
  [creativeBuiltinProvider.id, creativeBuiltinProvider],
  [iconifyProvider.id, iconifyProvider],
  [notoEmojiProvider.id, notoEmojiProvider],
  [openverseProvider.id, openverseProvider],
  [pexelsProvider.id, pexelsProvider],
  [wikimediaProvider.id, wikimediaProvider],
  [smithsonianProvider.id, smithsonianProvider],
  [rijksmuseumProvider.id, rijksmuseumProvider],
  [openIllustrationsProvider.id, openIllustrationsProvider],
  [kenneyProvider.id, kenneyProvider],
  [patternMonsterProvider.id, patternMonsterProvider],
]);

const isSafeAssetUrl = (
  value: string,
  provider: string,
  ownerWindow: Window & typeof globalThis,
) => {
  if (
    ["builtin", "creative-builtin"].includes(provider) &&
    value.startsWith("data:image/svg+xml,")
  ) {
    return true;
  }
  try {
    const url = new ownerWindow.URL(value, ownerWindow.location.href);
    return (
      url.protocol === "https:" || url.origin === ownerWindow.location.origin
    );
  } catch {
    return false;
  }
};

const normalizePage = (
  page: AssetPage,
  provider: AssetProvider,
  ownerWindow: Window & typeof globalThis,
): AssetPage => ({
  nextCursor: typeof page.nextCursor === "string" ? page.nextCursor : undefined,
  items: page.items
    .map(normalizeGratitudeAsset)
    .filter((asset): asset is GratitudeAsset => !!asset)
    .filter(
      (asset) =>
        asset.provider === provider.id &&
        ["A", "B", "C"].includes(asset.license.tier) &&
        isSafeAssetUrl(asset.previewUrl, asset.provider, ownerWindow) &&
        isSafeAssetUrl(asset.assetUrl, asset.provider, ownerWindow),
    ),
});

const searchProvider = async (
  provider: AssetProvider,
  query: AssetQuery,
  ownerWindow: Window & typeof globalThis,
) => {
  const cached = readCachedSearch(provider.id, query, ownerWindow);
  if (cached) {
    return normalizePage(cached, provider, ownerWindow);
  }
  const page = normalizePage(
    await provider.search(query, ownerWindow),
    provider,
    ownerWindow,
  );
  writeCachedSearch(provider.id, query, page, ownerWindow);
  return page;
};

export const registerAssetProvider = (provider: AssetProvider) => {
  if (providers.has(provider.id)) {
    throw new Error(`Asset provider already registered: ${provider.id}`);
  }
  providers.set(provider.id, provider);
};

export const getAssetProviders = () => [...providers.values()];

export const searchAssetsWithStatus = async (
  query: AssetQuery,
  ownerWindow: Window & typeof globalThis,
): Promise<AssetSearchResult> => {
  const activeProviders = getAssetProviders();
  const results = await Promise.allSettled(
    activeProviders.map(async (provider) => ({
      provider: provider.id,
      page: await searchProvider(provider, query, ownerWindow),
    })),
  );
  const failures = results.flatMap((result, index) =>
    result.status === "rejected"
      ? [
          {
            provider: activeProviders[index].id,
            message:
              result.reason instanceof Error
                ? result.reason.message
                : "Provider unavailable",
          },
        ]
      : [],
  );
  const seen = new Set<string>();
  const items = results.flatMap((result) =>
    result.status === "fulfilled"
      ? result.value.page.items.filter((asset) => {
          if (seen.has(asset.id)) {
            return false;
          }
          seen.add(asset.id);
          return true;
        })
      : [],
  );
  return { items: rankAssets(items, query.search), failures };
};

export const searchAssets = async (
  query: AssetQuery,
  ownerWindow: Window & typeof globalThis,
): Promise<GratitudeAsset[]> =>
  (await searchAssetsWithStatus(query, ownerWindow)).items;

export const resolveAsset = async (
  providerId: string,
  assetId: string,
  ownerWindow: Window & typeof globalThis,
) => {
  const provider = providers.get(providerId);
  if (!provider) {
    throw new Error(`Unknown asset provider: ${providerId}`);
  }
  const asset = await provider.resolve(assetId, ownerWindow);
  const page = normalizePage({ items: [asset] }, provider, ownerWindow);
  if (!page.items[0]) {
    throw new Error("Provider returned an unsupported asset");
  }
  return page.items[0];
};

export const fetchAsset = async (
  asset: GratitudeAsset,
  ownerWindow: Window & typeof globalThis,
) => {
  const cached = await readCachedBlob(asset, ownerWindow);
  if (cached) {
    return cached;
  }
  const provider = providers.get(asset.provider);
  if (!provider) {
    throw new Error(`Unknown asset provider: ${asset.provider}`);
  }
  const blob = await provider.fetchAsset(asset, ownerWindow);
  if (!blob.type.startsWith("image/") || blob.size > 20_000_000) {
    throw new Error("Provider returned an unsupported asset file");
  }
  await writeCachedBlob(asset, blob, ownerWindow);
  return blob;
};
