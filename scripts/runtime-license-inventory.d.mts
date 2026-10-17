export interface RuntimeLicenseOptions { policyDirectory?: string; }
export interface RuntimeLicenseInventory { formatVersion: number; policySha256: string; files: Record<string, unknown>; }
export function auditLicensePolicy(directory: string, options?: RuntimeLicenseOptions): Promise<string>;
export function completeRuntimeLicenses(runtime: string, options?: RuntimeLicenseOptions): Promise<RuntimeLicenseInventory>;
export function auditRuntimeLicenses(runtime: string, manifest: { files: Record<string, string>; platform?: string }, options?: RuntimeLicenseOptions): Promise<RuntimeLicenseInventory>;
