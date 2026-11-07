import test from 'node:test';
import assert from 'node:assert/strict';
import {
  runFrameworkBootstrap,
  negotiateAudioStream,
  getVirtualDisplayConfig,
  getNetworkBridgeState,
  DEFAULT_AOSP14_PROPERTIES,
} from './systemBootstrap.js';

test('Android 14 system properties validate API 34 and ro.* read-only immutability', () => {
  const report = runFrameworkBootstrap();
  assert.equal(report.propertiesStatus, 'PASS');
  assert.equal(report.apiLevel, 34);
  assert.equal(report.aospRelease, '14');
  assert.ok(report.propertiesCount >= 10);

  // Check ro.* properties are marked read-only
  const sdkProp = DEFAULT_AOSP14_PROPERTIES.find(p => p.key === 'ro.build.version.sdk');
  assert.equal(sdkProp?.isReadOnly, true);
});

test('Accurately reports BLOCKED when kernel Binder driver node is absent (no false success)', () => {
  const report = runFrameworkBootstrap(undefined, false, false);
  assert.equal(report.binderDriverFound, false);
  assert.equal(report.binderDriverStatus, 'BLOCKED');
  assert.equal(report.serviceManagerStatus, 'BLOCKED');
  assert.equal(report.overallStatus, 'BLOCKED');
  assert.ok(report.blockers.some(b => b.includes('CONFIG_ANDROID_BINDER_IPC')));

  // All services should be marked BLOCKED, never fabricated as PASS
  for (const svc of report.services) {
    assert.equal(svc.status, 'BLOCKED');
    assert.equal(svc.remotelyDiscovered, false);
    assert.equal(svc.pingVerified, false);
  }
});

test('Separates locally configured, remotely discovered, ping verified, and AIDL implemented', () => {
  const report = runFrameworkBootstrap(undefined, false, false);
  const displaySvc = report.services.find(s => s.name === 'display');
  assert.ok(displaySvc);
  assert.equal(displaySvc.locallyConfigured, true);
  assert.equal(displaySvc.remotelyDiscovered, false);
  assert.equal(displaySvc.pingVerified, false);
  assert.equal(displaySvc.aidlImplemented, true); // Display bridge exists

  const pkgSvc = report.services.find(s => s.name === 'package');
  assert.ok(pkgSvc);
  assert.equal(pkgSvc.aidlImplemented, false); // No full package manager in Phase 3.1
});

test('Simulation mode is explicitly classified as SIMULATION and NEVER as PASS', () => {
  const report = runFrameworkBootstrap(undefined, true, false);
  assert.equal(report.isSimulationMode, true);
  assert.equal(report.overallStatus, 'SIMULATION');
  assert.notEqual(report.overallStatus, 'PASS');

  for (const svc of report.services) {
    assert.equal(svc.status, 'SIMULATION');
  }
});

test('PipeWire audio negotiation sets active resampling for 44.1kHz Spotify stream', () => {
  const audio = negotiateAudioStream(44100, 48000);
  assert.equal(audio.sourceSampleRateHz, 44100);
  assert.equal(audio.hostPipeWireRateHz, 48000);
  assert.equal(audio.resamplingActive, true);
  assert.ok(audio.resamplerBackend.includes('PipeWire'));
});

test('Display bridge config reflects Ivy Bridge ASTC hardware limitation', () => {
  const disp = getVirtualDisplayConfig();
  assert.equal(disp.resolution.width, 1440);
  assert.equal(disp.resolution.height, 900);
  assert.equal(disp.astcHardwareSupport, false, 'Ivy Bridge GPU lacks ASTC hardware decompression');
  assert.equal(disp.astcSoftwareFallback, true, 'Software ASTC fallback must be active');
});

test('System bootstrap rejects incompatible non-34 API levels with FAIL status', () => {
  const report = runFrameworkBootstrap({ 'ro.build.version.sdk': '33' });
  assert.equal(report.propertiesStatus, 'FAIL');
  assert.equal(report.overallStatus, 'FAIL');
  assert.equal(report.apiLevel, 33);
});
