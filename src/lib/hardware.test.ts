import test from 'node:test';
import assert from 'node:assert/strict';
import { detectHardwareCapabilities } from './hardware.js';

test('detectHardwareCapabilities detects baseline x86-64 CPU and SSE4.2', () => {
  const profile = detectHardwareCapabilities();
  assert.equal(profile.cpu.architecture, 'x86_64');
  assert.equal(profile.cpu.hasSse4_2, true, 'SSE4.2 is mandatory for AOSP ART');
  assert.ok(profile.cpu.cores >= 1);
  assert.ok(profile.cpu.threads >= 1);
});

test('adaptively scales ART heap budget based on total host RAM', () => {
  // Constrained <=4GB machine
  const profile4G = detectHardwareCapabilities(4096);
  assert.equal(profile4G.memory.recommendedArtHeapMb, 256);
  assert.equal(profile4G.memory.recommendedHeapGrowthLimitMb, 128);

  // MacBookPro9,1 8GB baseline
  const profile8G = detectHardwareCapabilities(8192);
  assert.equal(profile8G.memory.recommendedArtHeapMb, 512);
  assert.equal(profile8G.memory.recommendedHeapGrowthLimitMb, 256);
  assert.equal(profile8G.isReferenceMacBook, true);

  // High-spec 16GB machine
  const profile16G = detectHardwareCapabilities(16384);
  assert.equal(profile16G.memory.recommendedArtHeapMb, 768);
});

test('identifies Ivy Bridge ASTC hardware limitation and enables CPU software fallback', () => {
  const profile = detectHardwareCapabilities(8192);
  assert.equal(profile.gpu.mesaDriver, 'crocus');
  assert.equal(profile.gpu.hardwareAstc, false, 'Ivy Bridge GPU lacks hardware ASTC');
  assert.equal(profile.gpu.astcFallbackMode, 'CPU_SOFTWARE_DECOMPRESSION');
  assert.equal(profile.gpu.primeOffloadCapable, true, 'MacBookPro9,1 has Intel HD 4000 + NVIDIA GT 650M');
});

test('detects PipeWire 48kHz graph rate and libspa resampler negotiation', () => {
  const profile = detectHardwareCapabilities();
  assert.equal(profile.audio.backend, 'PipeWire');
  assert.equal(profile.audio.hostGraphRateHz, 48000);
  assert.equal(profile.audio.spotifySourceRateHz, 44100);
  assert.equal(profile.audio.requiresResampling, true);
  assert.ok(profile.audio.resamplerBackend.includes('libspa'));
});

test('distinguishes container sandbox from native Arch Linux and provides remediation', () => {
  const profile = detectHardwareCapabilities();
  assert.equal(profile.kernel.isContainerSandbox, true);
  assert.ok(profile.kernel.remediationCommand.includes('binder_linux'));
  assert.ok(profile.kernel.remediationCommand.includes('mount -t binder binder /dev/binderfs'));
  assert.ok(profile.kernel.remediationCommand.includes('0660'), 'Should recommend secure group permissions, not 0666');
});

test('accurately identifies Ivy Bridge SIMD: AVX1 supported, AVX2 and FMA3 unsupported', () => {
  const profile = detectHardwareCapabilities(8192);
  assert.equal(profile.cpu.hasAvx, true, 'Ivy Bridge supports AVX1');
  assert.equal(profile.cpu.hasAvx2, false, 'Ivy Bridge does not support AVX2');
  assert.equal(profile.cpu.hasFma, false, 'Ivy Bridge does not support FMA3');
});

