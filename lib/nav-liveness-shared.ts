// Client-safe half of the nav-liveness helper. Consumes the serialised
// signals shape (arrays of strings) produced by lib/nav-liveness.ts on
// the server, and answers "is this nav href pointing at anything live?"
// without importing anything that touches Prisma / the DB.
//
// Unknown paths (locales, /novidades, /historia, one-off marketing
// routes) default to LIVE so we never hide something we don't
// understand.

export interface LiveNavSignalsSerialized {
  categories: string[];
  collections: string[];
  types: string[];
  genders: string[];
  usages: string[];
}

// Convenience alias for the resolved-set form used inside the checker.
interface Sets {
  categories: Set<string>;
  collections: Set<string>;
  types: Set<string>;
  genders: Set<string>;
  usages: Set<string>;
}

function toSets(s: LiveNavSignalsSerialized): Sets {
  return {
    categories: new Set(s.categories),
    collections: new Set(s.collections),
    types: new Set(s.types),
    genders: new Set(s.genders),
    usages: new Set(s.usages),
  };
}

const CATEGORY_ALIASES: Record<string, string> = {
  lighters: "isqueiros",
  writing: "escrita",
  leather: "pele",
  accessories: "acessorios",
};
const KNOWN_CATEGORIES = new Set(["isqueiros", "escrita", "pele", "acessorios"]);

export function isNavPathLive(href: string, signals: LiveNavSignalsSerialized): boolean {
  const s = toSets(signals);
  const qMark = href.indexOf("?");
  const path = qMark >= 0 ? href.slice(0, qMark) : href;
  const query = qMark >= 0 ? href.slice(qMark + 1) : "";
  const params = new URLSearchParams(query);

  const catMatch = /(?:^|\/)c\/([^/?]+)/.exec(path);
  if (catMatch) {
    const raw = catMatch[1];
    const canonical = CATEGORY_ALIASES[raw] ?? raw;
    if (!KNOWN_CATEGORIES.has(canonical)) return true;
    if (!s.categories.has(canonical)) return false;
    const col = params.get("col");
    if (col && !s.collections.has(col)) return false;
    const usage = params.get("usage");
    if (usage && !s.usages.has(usage)) return false;
    return true;
  }

  const groupMatch = /(?:^|\/)t\/([^/?]+)/.exec(path);
  if (groupMatch) {
    const gid = groupMatch[1];
    const type = params.get("type");
    const key = type ? `${gid}:${type}` : gid;
    // We only prune known groups — if a group id isn't in the signals
    // at all (no ":typeKey" either) we treat it as unknown → live.
    const knownAtAll = s.types.has(gid) || [...s.types].some((t) => t.startsWith(`${gid}:`));
    if (!knownAtAll) return true;
    if (!s.types.has(key)) return false;
    // Deliberately no gender filter: our slug-heuristic gender
    // inference is unreliable (defaults to "men" so "-women" bag
    // entries would disappear the moment a slug convention drifts).
    // The category page renders empty gracefully when a gender has
    // no matches, per editorial direction.
    return true;
  }

  return true;
}
