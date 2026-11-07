/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDexMagic,
  SAMPLE_SPOTIFY_X86_64,
  SAMPLE_SPOTIFY_ARM_ONLY,
  SAMPLE_SPOTIFY_SPLIT_BUNDLE,
} from './apkInspector';

test('validates standard DEX magic headers (035, 037, 038, 039)', () => {
  const dex035 = new Uint8Array([0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x35, 0x00]);
  const res1 = validateDexMagic(dex035);
  assert.equal(res1.valid, true);
  assert.equal(res1.version, '035');

  const dex039 = new Uint8Array([0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x39, 0x00]);
  const res2 = validateDexMagic(dex039);
  assert.equal(res2.valid, true);
  assert.equal(res2.version, '039');

  const invalid = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);
  const res3 = validateDexMagic(invalid);
  assert.equal(res3.valid, false);
});

test('sample Spotify x86-64 is classified as Supported without requiring hardcoded libspotify.so', () => {
  assert.equal(SAMPLE_SPOTIFY_X86_64.verdict, 'Supported');
  assert.equal(SAMPLE_SPOTIFY_X86_64.isX86_64Compatible, true);
  assert.equal(SAMPLE_SPOTIFY_X86_64.supportedAbis.includes('x86_64'), true);
  // Verify real Spotify libraries like liborbit-jni.so are recognized
  assert.ok(SAMPLE_SPOTIFY_X86_64.nativeLibraries.includes('liborbit-jni.so'));
});

test('sample Spotify ARM-only is classified as Unsupported with actionable explanation', () => {
  assert.equal(SAMPLE_SPOTIFY_ARM_ONLY.verdict, 'Unsupported');
  assert.equal(SAMPLE_SPOTIFY_ARM_ONLY.isX86_64Compatible, false);
  assert.match(SAMPLE_SPOTIFY_ARM_ONLY.issues[0], /MISSING_X86_64_ABI/);
});

test('sample Split APK bundle is classified as RequiresAdditionalSplits', () => {
  assert.equal(SAMPLE_SPOTIFY_SPLIT_BUNDLE.verdict, 'RequiresAdditionalSplits');
  assert.equal(SAMPLE_SPOTIFY_SPLIT_BUNDLE.isSplitApk, true);
  assert.match(SAMPLE_SPOTIFY_SPLIT_BUNDLE.issues[0], /SPLIT_BUNDLE_INCOMPLETE/);
});
