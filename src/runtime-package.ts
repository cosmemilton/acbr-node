/** Resolve scoped first. Legacy packages still undergo runtime contract/hash validation. */
export function resolveRuntimePackage(resolve: (name: string) => string, platform: string): string | undefined {
  for (const prefix of ['@cosmemilton/acbr-node-', 'cosmemilton-acbr-node-']) {
    try { return resolve(prefix + platform + '-x64/package.json'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND') throw error; }
  }
  return undefined;
}
