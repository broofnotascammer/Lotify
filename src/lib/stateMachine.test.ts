/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialContext, transition } from './stateMachine';

test('initial state defaults to Stopped', () => {
  const ctx = createInitialContext();
  assert.equal(ctx.state, 'Stopped');
  assert.equal(ctx.daemonPid, null);
  assert.equal(ctx.appPid, null);
});

test('handles full lifecycle: Stopped -> Starting -> Ready -> Launching -> Running -> Exited -> Stopping -> Stopped', () => {
  let ctx = createInitialContext();

  // 1. Request start
  ctx = transition(ctx, { type: 'START_REQUESTED' });
  assert.equal(ctx.state, 'Starting');

  // 2. Daemon initializes
  ctx = transition(ctx, {
    type: 'INITIALIZED_SUCCESS',
    pid: 48210,
    socketPath: '/run/user/1000/lotify/daemon.sock',
  });
  assert.equal(ctx.state, 'Ready');
  assert.equal(ctx.daemonPid, 48210);
  assert.equal(ctx.socketPath, '/run/user/1000/lotify/daemon.sock');

  // 3. Launch App
  ctx = transition(ctx, {
    type: 'LAUNCH_APP_REQUESTED',
    appId: 'com.spotify.music',
    apkPath: '/var/lib/lotify/apps/spotify.apk',
  });
  assert.equal(ctx.state, 'Launching');
  assert.equal(ctx.activeAppId, 'com.spotify.music');

  // 4. App running
  ctx = transition(ctx, {
    type: 'APP_STARTED_SUCCESS',
    appPid: 48299,
  });
  assert.equal(ctx.state, 'Running');
  assert.equal(ctx.appPid, 48299);

  // 5. App exits
  ctx = transition(ctx, { type: 'APP_EXITED', exitCode: 0 });
  assert.equal(ctx.state, 'Ready');
  assert.equal(ctx.appPid, null);
  assert.equal(ctx.activeAppId, null);

  // 6. Stop daemon
  ctx = transition(ctx, { type: 'STOP_REQUESTED' });
  assert.equal(ctx.state, 'Stopping');

  ctx = transition(ctx, { type: 'STOPPED_CLEANLY' });
  assert.equal(ctx.state, 'Stopped');
  assert.equal(ctx.daemonPid, null);
});

test('transitions to Failed on initialization failure with error code', () => {
  let ctx = createInitialContext();
  ctx = transition(ctx, { type: 'START_REQUESTED' });
  ctx = transition(ctx, {
    type: 'INITIALIZATION_FAILED',
    reason: 'Binder IPC node /dev/binder not accessible',
    errorCode: 'ERR_BINDER_UNAVAILABLE',
  });

  assert.equal(ctx.state, 'Failed');
  assert.equal(ctx.errorCode, 'ERR_BINDER_UNAVAILABLE');
  assert.match(ctx.lastError ?? '', /Binder IPC/);

  // Reset recovers to Stopped
  ctx = transition(ctx, { type: 'RESET' });
  assert.equal(ctx.state, 'Stopped');
  assert.equal(ctx.lastError, null);
});

test('handles app launch failure gracefully without killing daemon', () => {
  let ctx = createInitialContext('Ready');
  ctx.daemonPid = 1234;

  ctx = transition(ctx, {
    type: 'LAUNCH_APP_REQUESTED',
    appId: 'com.spotify.music',
    apkPath: 'invalid.apk',
  });
  assert.equal(ctx.state, 'Launching');

  ctx = transition(ctx, {
    type: 'APP_LAUNCH_FAILED',
    reason: 'APK lacks x86_64 native libraries',
  });
  // Must return to Ready state
  assert.equal(ctx.state, 'Ready');
  assert.equal(ctx.activeAppId, null);
  assert.match(ctx.lastError ?? '', /x86_64/);
});
