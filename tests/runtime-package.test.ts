import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRuntimePackage } from '../src/runtime-package.js';
for (const platform of ['linux', 'win32']) {
  test('scoped runtime wins on ' + platform, () => {
    const calls: string[] = [];
    assert.equal(resolveRuntimePackage(name => { calls.push(name); return '/scoped/package.json'; }, platform), '/scoped/package.json');
    assert.deepEqual(calls, ['@cosmemilton/acbr-node-' + platform + '-x64/package.json']);
  });
  test('legacy fallback only when scoped package is absent on ' + platform, () => {
    const calls: string[] = [];
    assert.equal(resolveRuntimePackage(name => {
      calls.push(name);
      if (name.startsWith('@')) throw Object.assign(new Error('missing'), { code: 'MODULE_NOT_FOUND' });
      return '/legacy/package.json';
    }, platform), '/legacy/package.json');
    assert.equal(calls[1], 'cosmemilton-acbr-node-' + platform + '-x64/package.json');
    assert.equal(resolveRuntimePackage(() => { throw Object.assign(new Error('missing'), { code: 'MODULE_NOT_FOUND' }); }, platform), undefined);
    assert.throws(() => resolveRuntimePackage(() => { throw Object.assign(new Error('invalid'), { code: 'ERR_INVALID_PACKAGE_CONFIG' }); }, platform), /invalid/);
  });
}
