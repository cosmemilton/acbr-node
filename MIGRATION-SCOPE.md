# Scoped migration prepared from GitHub main

Base: 274a861101b01b94052c3a4c7f43cfe7f8fdb5ce (current remote main checked 2026-11-08).
Worktree: /home/milton/acbr-node-scope-current.
The older 0.1.2 preparation remains separately preserved and is not the current migration.

Names and versions:
- cosmemilton-acbr-node@0.2.2 -> @cosmemilton/acbr-node@0.2.2
- cosmemilton-acbr-node-linux-x64@0.2.1 -> @cosmemilton/acbr-node-linux-x64@0.2.1
- cosmemilton-acbr-node-win32-x64@0.2.1 -> @cosmemilton/acbr-node-win32-x64@0.2.1

Changed manifests, optional dependencies, generated import/generator, runtime discovery,
documentation/examples, package/release scripts and installed consumer tests. The bin
acbr-node and exported entrypoints remain unchanged. Runtime lookup prefers scoped names,
falls back to legacy only if missing, and retains contract/hash/capability checks.

Official runtime tarballs downloaded from npm with lifecycle scripts disabled:
- Linux: SHA256 029e23b5fc05e0886a9e988300ef46811db0705f687109d114d34e87500d1b5f
- Windows: SHA256 3a4f3ab038c8e9a705ac5a74f8d9c237c96aea1922b54fb2c5f844a8af445cc3
Both hashes and byte lengths match preserved release/0.2.1 and release/0.2.2 manifests.
The local preview preparer verifies these before extraction, verifies all generated
files against original provenance (allowing only the scoped import rename), and audits
native inventory, source correspondence, capabilities, licenses and Windows DLL provenance.
Native bytes, source revision, contract hash, licenses and build provenance are unchanged.
Only package metadata and the generated-index hash are updated in isolated staging.
Original official tarballs and historic release files remain unchanged.

Validation:
- Typecheck and build passed on Node 24.15.0 / WSL Linux.
- Full suite: 167 tests, 162 passed, zero failed, five skipped.
- External installed consumer: ESM and CommonJS, four synthetic fixtures each,
  24 offline operations total, without compiler or source checkout.
- Installed CLI without optional runtimes: 45/45 checks passed, including six legacy
  checks. Zero network, subprocesses, certificate/config reads or help filesystem writes.
- Scoped-first and legacy fallback regression coverage for Linux and Windows.
- Windows artifacts audited, but Windows native execution was not performed.
- git diff --check passed.

Evidence: .acbr/scope-preview/preview.json, .acbr/current-final-tests.log,
.acbr/current-consumer.log and .acbr/current-help.log. The preview manifest is not a
publication authorization. npm flattened tarball filenames overlap legacy names, so
preview artifacts are isolated from the historical release directories.

No push, publish, deprecation, fiscal transmission, printing, or native rebuild occurred.
The offline/new-scope lock has no invented registry integrity for unpublished names.
Before publishing, review exact new hashes, validate Windows, choose a separate release
approval/destination that preserves historic artifacts, and refresh registry lock metadata.
Scoped tarballs cannot reuse old unscoped publication approval: reuse checks still require
exact package identities and bytes. The existing v1/v2 approval workflow must not be used
to claim renamed runtime tarballs are byte-identical approved legacy artifacts.

