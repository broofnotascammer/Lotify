/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateHostDiagnostics,
  auditBinderFeasibility,
  auditGraphicsMesa,
  negotiatePipewireAudio,
  DEFAULT_HOST_PROBE,
} from './diagnostics';

test('passes all checks on standard Arch Linux with Ivy Bridge & PipeWire', () => {
  const checks = evaluateHostDiagnostics(DEFAULT_HOST_PROBE);
  assert.equal(checks.length, 5);
  const passed = checks.filter((c) => c.status === 'passed');
  assert.equal(passed.length, 5);
});

test('CPU check passes when SSE4.2 is present even if AVX is missing', () => {
  const checks = evaluateHostDiagnostics({
    ...DEFAULT_HOST_PROBE,
    hasSse42: true,
    hasAvx: false, // AVX is optional in Phase 2
  });

  const cpuCheck = checks.find((c) => c.id === 'cpu_x86_64_isa');
  assert.ok(cpuCheck);
  assert.equal(cpuCheck?.status, 'passed');
});

test('CPU check fails if SSE4.2 is missing', () => {
  const checks = evaluateHostDiagnostics({
    ...DEFAULT_HOST_PROBE,
    hasSse42: false,
  });

  const cpuCheck = checks.find((c) => c.id === 'cpu_x86_64_isa');
  assert.ok(cpuCheck);
  assert.equal(cpuCheck?.status, 'failed');
});

test('auditBinderFeasibility detects mounted binderfs nodes', () => {
  const audit = auditBinderFeasibility(true);
  assert.equal(audit.isKernelSupported, true);
  assert.equal(audit.isBinderfsMounted, true);
  assert.equal(audit.primaryNode, '/dev/binderfs/binder');
  assert.equal(audit.serviceManagerReady, true);
});

test('auditGraphicsMesa accurately reports Intel HD 4000 ASTC limitation', () => {
  const audit = auditGraphicsMesa();
  assert.equal(audit.primaryGpu, 'Intel HD Graphics 4000 (Ivy Bridge GT2)');
  assert.equal(audit.mesaDriver, 'crocus (Mesa 24.0.7)');
  assert.equal(audit.supportsAstc, false); // Architectural reality of Ivy Bridge
  assert.equal(audit.supportsPrimeOffload, true);
});

test('negotiatePipewireAudio measures host graph rate and resampling', () => {
  const audio = negotiatePipewireAudio(44100);
  assert.equal(audio.requestedRate, 44100);
  assert.equal(audio.negotiatedRate, 48000);
  assert.equal(audio.isResampling, true);
  assert.equal(audio.pcmFormat, 'SPA_AUDIO_FORMAT_F32_LE');
  assert.ok(audio.measuredLatencyMs > 0);
});
