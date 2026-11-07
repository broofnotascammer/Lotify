/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lotify Runtime Supervisor State Machine
 * Deterministic transition handler mirroring Rust's `lotify-core::state`
 */

import { DaemonEvent, RuntimeState } from './types';

export interface StateMachineContext {
  state: RuntimeState;
  daemonPid: number | null;
  appPid: number | null;
  activeAppId: string | null;
  socketPath: string | null;
  lastError: string | null;
  errorCode: string | null;
  uptimeStart: number | null;
  transitionHistory: Array<{
    from: RuntimeState;
    to: RuntimeState;
    event: string;
    timestamp: number;
  }>;
}

export function createInitialContext(initialState: RuntimeState = 'Stopped'): StateMachineContext {
  return {
    state: initialState,
    daemonPid: null,
    appPid: null,
    activeAppId: null,
    socketPath: null,
    lastError: null,
    errorCode: null,
    uptimeStart: null,
    transitionHistory: [],
  };
}

export function transition(
  current: StateMachineContext,
  event: DaemonEvent
): StateMachineContext {
  const next: StateMachineContext = {
    ...current,
    transitionHistory: [...current.transitionHistory],
  };

  const recordTransition = (to: RuntimeState, eventName: string) => {
    next.transitionHistory.push({
      from: current.state,
      to,
      event: eventName,
      timestamp: Date.now(),
    });
    next.state = to;
  };

  switch (current.state) {
    case 'Stopped':
      if (event.type === 'START_REQUESTED') {
        recordTransition('Starting', event.type);
        next.lastError = null;
        next.errorCode = null;
      }
      break;

    case 'Starting':
      if (event.type === 'INITIALIZED_SUCCESS') {
        recordTransition('Ready', event.type);
        next.daemonPid = event.pid;
        next.socketPath = event.socketPath;
        next.uptimeStart = Date.now();
      } else if (event.type === 'INITIALIZATION_FAILED') {
        recordTransition('Failed', event.type);
        next.lastError = event.reason;
        next.errorCode = event.errorCode;
      } else if (event.type === 'STOP_REQUESTED') {
        recordTransition('Stopping', event.type);
      }
      break;

    case 'Ready':
      if (event.type === 'LAUNCH_APP_REQUESTED') {
        recordTransition('Launching', event.type);
        next.activeAppId = event.appId;
      } else if (event.type === 'STOP_REQUESTED') {
        recordTransition('Stopping', event.type);
      } else if (event.type === 'HEARTBEAT_TIMEOUT') {
        recordTransition('Failed', event.type);
        next.lastError = 'Daemon IPC heartbeat timed out (no response in 5000ms)';
        next.errorCode = 'ERR_IPC_TIMEOUT';
      }
      break;

    case 'Launching':
      if (event.type === 'APP_STARTED_SUCCESS') {
        recordTransition('Running', event.type);
        next.appPid = event.appPid;
      } else if (event.type === 'APP_LAUNCH_FAILED') {
        // Recover back to Ready so daemon stays alive
        recordTransition('Ready', event.type);
        next.lastError = event.reason;
        next.activeAppId = null;
      } else if (event.type === 'STOP_REQUESTED') {
        recordTransition('Stopping', event.type);
      }
      break;

    case 'Running':
      if (event.type === 'APP_EXITED') {
        recordTransition('Ready', event.type);
        next.appPid = null;
        next.activeAppId = null;
      } else if (event.type === 'STOP_REQUESTED') {
        recordTransition('Stopping', event.type);
      } else if (event.type === 'HEARTBEAT_TIMEOUT') {
        recordTransition('Failed', event.type);
        next.lastError = 'Heartbeat loss during application execution';
        next.errorCode = 'ERR_IPC_DROPPED';
      }
      break;

    case 'Stopping':
      if (event.type === 'STOPPED_CLEANLY' || event.type === 'STOP_REQUESTED') {
        recordTransition('Stopped', event.type);
        next.daemonPid = null;
        next.appPid = null;
        next.activeAppId = null;
        next.socketPath = null;
        next.uptimeStart = null;
      }
      break;

    case 'Failed':
      if (event.type === 'RESET' || event.type === 'START_REQUESTED') {
        recordTransition('Stopped', event.type);
        next.lastError = null;
        next.errorCode = null;
      }
      break;

    default:
      break;
  }

  return next;
}
