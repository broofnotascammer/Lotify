import test from 'node:test';
import assert from 'node:assert/strict';
import { runBenchmarkSuite, measureLocalIpcLatencyUs } from './benchmarks.js';

test('measureLocalIpcLatencyUs measures microsecond latency without error', () => {
  const latency = measureLocalIpcLatencyUs();
  assert.ok(latency >= 0);
  assert.ok(latency < 100, `IPC framing latency should be well under 100µs, got ${latency}µs`);
});

test('runBenchmarkSuite evaluates all 5 required runtime states', () => {
  const suite = runBenchmarkSuite('Stopped');
  assert.equal(suite.states.length, 5);
  const stateIds = suite.states.map(s => s.stateId);
  assert.deepEqual(stateIds, ['stopped', 'idle', 'launched', 'playing', 'backgrounded']);
});

test('State 1 (Stopped) has measured zero CPU and memory values', () => {
  const suite = runBenchmarkSuite('Stopped');
  const stopped = suite.states.find(s => s.stateId === 'stopped')!;
  assert.equal(stopped.isCurrentState, true);
  assert.equal(stopped.metrics.idleCpuHost.value, '0.0');
  assert.equal(stopped.metrics.idleMemoryHost.value, '0.0');
});

test('State 2 (Initialized Idle) measures host RSS and idle CPU without busy-waiting', () => {
  const suite = runBenchmarkSuite('Ready');
  const idle = suite.states.find(s => s.stateId === 'idle')!;
  assert.equal(idle.isCurrentState, true);
  assert.equal(idle.metrics.idleCpuHost.value, '< 0.1');
  assert.ok(parseFloat(idle.metrics.idleMemoryHost.value) > 0);
  assert.equal(idle.metrics.audioLatency.classification, 'MEASURED');
});

test('States 3, 4, and 5 strictly mark unreached metrics as NOT MEASURED', () => {
  const suite = runBenchmarkSuite('Ready');
  const unreachedStates = suite.states.filter(s =>
    ['launched', 'playing', 'backgrounded'].includes(s.stateId)
  );

  for (const s of unreachedStates) {
    assert.equal(s.metrics.idleCpuHost.classification, 'NOT_MEASURED');
    assert.equal(s.metrics.idleCpuHost.value, 'NOT MEASURED');
    assert.equal(s.metrics.playbackCpu.classification, 'NOT_MEASURED');
    assert.equal(s.metrics.playbackMemory.classification, 'NOT_MEASURED');
    assert.equal(s.metrics.audioLatency.classification, 'NOT_MEASURED');
  }
});

test('accurately breaks down IPC latency and reports buffer duration rather than end-to-end latency', () => {
  const suite = runBenchmarkSuite('Ready');
  assert.ok(suite.ipcBreakdown.inProcessFramingUs >= 0);
  assert.ok(suite.ipcBreakdown.unixSocketRoundtripUs > 0);
  assert.ok(suite.ipcBreakdown.binderIpcStatus.includes('BLOCKED'));

  assert.equal(suite.audioMetrics.bufferDurationMs, 5.33);
  assert.ok(suite.audioMetrics.endToEndLatency.includes('NOT MEASURED'));
});

