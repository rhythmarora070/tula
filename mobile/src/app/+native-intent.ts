// A share from another app arrives as a deep link like tula://dataUrl=tulaShareKey.
// Send those to the capture screen instead of letting the router look for a matching route.
import { getShareExtensionKey } from 'expo-share-intent';

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) return '/capture?mode=share';
    return path;
  } catch {
    return '/';
  }
}
