/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  executeControlledDexTest,
  PINNED_AOSP_REVISION,
  TARGET_ANDROID_API_LEVEL,
} from './artBootstrap';

test('pins AOSP to android-14.0.0_r50 and API level 34', () => {
  assert.equal(PINNED_AOSP_REVISION, 'android-14.0.0_r50');
  assert.equal(TARGET_ANDROID_API_LEVEL, 34);
});

test('executes controlled DEX test calculation correctly (100 * 2 + 42 = 242)', () => {
  const dex039Header = new Uint8Array([0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x39, 0x00]);
  const report = executeControlledDexTest(dex039Header);

  assert.equal(report.success, true);
  assert.equal(report.computedResult, 242);
  assert.equal(report.expectedResult, 242);
  assert.equal(report.className, 'org.lotify.test.HelloLotify');
  assert.match(report.jniEchoOutput, /x86_64 AOSP ART 14/);
  assert.ok(report.bootClasspathCount >= 4);
  assert.ok(report.logs.some((l) => l.includes('DestroyJavaVM')));
});
