const repositoryImages = import.meta.glob(
  "@/assets/repository/**/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" }
) as Record<string, string>;

const hashedNamePattern = /\.([a-f0-9]{6,})\.(png|jpe?g|webp)$/i;

const assetLookup = new Map<string, string>();

const addKey = (key: string, value: string) => {
  if (!key) return;
  const normalized = key.replace(/^\.\//, "");
  assetLookup.set(normalized, value);
  assetLookup.set(normalized.toLowerCase(), value);
};

// Debug: Log all available repository images
// console.log("🖼️ Repository Images Available:", Object.keys(repositoryImages));

Object.entries(repositoryImages).forEach(([path, assetSrc]) => {
  const cleanedPath = path.replace(/^\.\//,"").replace(/^src\//,"");
  const withoutLeadingSlash = assetSrc.startsWith("/") ? assetSrc.slice(1) : assetSrc;

  addKey(assetSrc, assetSrc);
  addKey(withoutLeadingSlash, assetSrc);
  addKey(cleanedPath, assetSrc);

  const repoIndex = cleanedPath.indexOf("repository/");
  if (repoIndex >= 0) {
    const repoPath = cleanedPath.slice(repoIndex);
    addKey(repoPath, assetSrc);
    addKey(repoPath.replace(/^repository\//, ""), assetSrc);
  }

  const segments = cleanedPath.split("/");
  const filename = segments[segments.length - 1] ?? "";
  addKey(filename, assetSrc);

  const normalizedFilename = filename.replace(hashedNamePattern, ".$2");
  if (normalizedFilename !== filename) {
    addKey(normalizedFilename, assetSrc);
  }
  
  // Add additional filename variations for better matching
  const filenameWithoutExt = filename.replace(/\.[^.]+$/, "");
  addKey(filenameWithoutExt, assetSrc);
});

// Debug: Log the asset lookup map
// console.log("🗺️ Asset Lookup Map:", Array.from(assetLookup.entries()));

const buildCandidates = (input: string) => {
  const candidates = new Set<string>();
  const cleaned = input.split("?")[0].replace(/\\/g, "/");
  const withoutLeadingSlash = cleaned.startsWith("/") ? cleaned.slice(1) : cleaned;

  const push = (value: string | undefined) => {
    if (!value) return;
    const trimmed = value.replace(/^\.\//, "");
    candidates.add(trimmed);
    candidates.add(trimmed.toLowerCase());
  };

  push(cleaned);
  push(withoutLeadingSlash);

  if (withoutLeadingSlash.startsWith("assets/")) {
    push(withoutLeadingSlash.slice("assets/".length));
  }

  const normalizedHash = withoutLeadingSlash.replace(hashedNamePattern, ".$2");
  push(normalizedHash);

  const repoIndex = withoutLeadingSlash.indexOf("repository/");
  if (repoIndex >= 0) {
    const repoPath = withoutLeadingSlash.slice(repoIndex);
    push(repoPath);
    push(repoPath.replace(/^repository\//, ""));
    push(repoPath.replace(hashedNamePattern, ".$2"));
  }

  const segments = withoutLeadingSlash.split("/").filter(Boolean);
  if (segments.length > 0) {
    const filename = segments[segments.length - 1];
    push(filename);
    push(filename.replace(hashedNamePattern, ".$2"));

    if (segments.length >= 2) {
      const lastTwo = `${segments[segments.length - 2]}/${segments[segments.length - 1]}`;
      push(lastTwo);
      push(lastTwo.replace(hashedNamePattern, ".$2"));
    }
  }

  return Array.from(candidates);
};

const isExternalOrDataUrl = (url: string) => {
  // Check for HTTP/HTTPS URLs, data URLs, and Supabase Storage URLs
  return /^(?:https?:|data:image)/i.test(url) || url.includes('supabase.co/storage/');
};

export const resolveRepositoryAsset = (path?: string | null) => {
  // console.log("🔍 [resolveRepositoryAsset] Input path:", path);
  
  if (!path) {
    // console.log("❌ [resolveRepositoryAsset] No path provided");
    return undefined;
  }

  if (isExternalOrDataUrl(path)) {
    // console.log("🌐 [resolveRepositoryAsset] External URL detected:", path);
    return path;
  }

  // console.log("🔄 [resolveRepositoryAsset] Attempting to resolve:", path);
  
  const candidates = buildCandidates(path);
  // console.log("📋 [resolveRepositoryAsset] Generated candidates:", candidates);

  for (const candidate of candidates) {
    if (assetLookup.has(candidate)) {
      const resolved = assetLookup.get(candidate);
      // console.log("✅ [resolveRepositoryAsset] Match found:", candidate, "->", resolved);
      return resolved;
    }
  }

  // Enhanced fallback: try to find matches by filename
  // console.log("🔍 [resolveRepositoryAsset] No direct match, trying filename matches...");
  const filename = path.split('/').pop() || path;
  
  for (const [key, value] of assetLookup.entries()) {
    const keyFilename = key.split('/').pop() || key;
    if (keyFilename === filename) {
      // console.log("🎯 [resolveRepositoryAsset] Filename match found:", key, "->", value);
      return value;
    }
  }

  // Last resort: partial matches
  // console.log("🔍 [resolveRepositoryAsset] Trying partial matches...");
  for (const [key, value] of assetLookup.entries()) {
    if (key.includes(path) || path.includes(key.split('/').pop() || '')) {
      // console.log("🎯 [resolveRepositoryAsset] Partial match found:", key, "->", value);
      return value;
    }
  }

  // console.log("❌ [resolveRepositoryAsset] No match found for:", path);
  return undefined;
};

export const resolveRepositoryAssets = (paths?: (string | null | undefined)[]) => {
  if (!paths) {
    console.log("🚫 resolveRepositoryAssets: No paths provided");
    return [] as string[];
  }
  
  console.log("🔍 resolveRepositoryAssets: Resolving paths:", paths);
  
  const resolved = paths
    .map((item) => resolveRepositoryAsset(item))
    .filter((value): value is string => Boolean(value));
    
  console.log("✅ resolveRepositoryAssets: Resolved to:", resolved);
  
  return resolved;
};
