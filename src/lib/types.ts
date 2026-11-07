/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lotify Protocol & Type Definitions (Phase 2 Architectural Corrections)
 */

export type RuntimeState =
  | 'Stopped'
  | 'Starting'
  | 'Ready'
  | 'Launching'
  | 'Running'
  | 'Stopping'
  | 'Failed';

export type DaemonEvent =
  | { type: 'START_REQUESTED'; configPath?: string }
  | { type: 'INITIALIZED_SUCCESS'; pid: number; socketPath: string }
  | { type: 'INITIALIZATION_FAILED'; reason: string; errorCode: string }
  | { type: 'LAUNCH_APP_REQUESTED'; appId: string; apkPath: string }
  | { type: 'APP_STARTED_SUCCESS'; appPid: number; runtimeProcessPid?: number }
  | { type: 'APP_LAUNCH_FAILED'; reason: string }
  | { type: 'APP_EXITED'; exitCode: number }
  | { type: 'STOP_REQUESTED'; force?: boolean }
  | { type: 'STOPPED_CLEANLY' }
  | { type: 'HEARTBEAT_TIMEOUT' }
  | { type: 'RESET' };

export type IpcMessageType =
  | 'HANDSHAKE_REQ'
  | 'HANDSHAKE_RESP'
  | 'GET_STATE_REQ'
  | 'GET_STATE_RESP'
  | 'START_RUNTIME_REQ'
  | 'START_RUNTIME_RESP'
  | 'STOP_RUNTIME_REQ'
  | 'STOP_RUNTIME_RESP'
  | 'LAUNCH_APP_REQ'
  | 'LAUNCH_APP_RESP'
  | 'LOG_STREAM_EVENT'
  | 'DIAGNOSTICS_REQ'
  | 'DIAGNOSTICS_RESP'
  | 'DEX_TEST_RUN_REQ'
  | 'DEX_TEST_RUN_RESP';

export interface IpcPacket {
  id: string;
  timestamp: number;
  direction: 'client_to_daemon' | 'daemon_to_client';
  type: IpcMessageType;
  payload: Record<string, unknown>;
  rawBytesLength: number;
}

export type PackageVerdict =
  | 'Supported'
  | 'PotentiallySupported'
  | 'RequiresAdditionalSplits'
  | 'Unsupported';

export interface ApkMetadata {
  packageName: string;
  versionCode: number;
  versionName: string;
  minSdkVersion: number;
  targetSdkVersion: number;
  supportedAbis: string[];
  isX86_64Compatible: boolean;
  nativeLibraries: string[];
  permissions: string[];
  activities: string[];
  services: string[];
  dexCount: number;
  dexByteSize: number;
  isSplitApk: boolean;
  splitNames: string[];
  verdict: PackageVerdict;
  hasAudioTrackUsage: boolean;
  hasMediaSessionUsage: boolean;
  issues: string[];
}

export type DiagnosticStatus = 'passed' | 'warning' | 'failed';

export interface DiagnosticCheck {
  id: string;
  name: string;
  category: 'cpu' | 'graphics' | 'audio' | 'kernel' | 'desktop';
  status: DiagnosticStatus;
  currentValue: string;
  requiredValue: string;
  description: string;
  fixRecommendation?: string;
}

export interface DexTestExecutionReport {
  success: boolean;
  aospRevision: string;
  dexPath: string;
  className: string;
  methodCalled: string;
  computedResult: number;
  expectedResult: number;
  jniEchoOutput: string;
  executionTimeMs: number;
  memoryUsageMb: number;
  bootClasspathCount: number;
  logs: string[];
}

export interface BinderFeasibilityAudit {
  isKernelSupported: boolean;
  isBinderfsMounted: boolean;
  primaryNode: string | null;
  secondaryNodes: string[];
  hasReadWriteAccess: boolean;
  serviceManagerReady: boolean;
  remediationCmd?: string;
  limitations: string[];
}

export interface GraphicsMesaAudit {
  primaryGpu: string;
  secondaryGpu: string;
  mesaDriver: string;
  eglVersion: string;
  glesVersion: string;
  supportsGles30: boolean;
  supportsAstc: boolean;
  supportsPrimeOffload: boolean;
  activeBackend: string;
  architecturalNotes: string[];
}

export interface NegotiatedAudioState {
  requestedRate: number;
  negotiatedRate: number;
  channels: number;
  pcmFormat: string;
  measuredLatencyMs: number;
  bufferSizeFrames: number;
  isResampling: boolean;
  audioFocus: string;
}

export interface LotifyConfig {
  general: {
    logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error';
    dataDir: string;
    socketPath: string;
    autoStartDaemon: boolean;
  };
  runtime: {
    artHeapLimitMb: number;
    binderDevice: string;
    enableBionicInterp: boolean;
    useIsolatedNamespaces: boolean;
    pinnedAospRevision: string;
  };
  graphics: {
    backend: 'egl_gles_crocus' | 'mesa_software' | 'nvidia_prime';
    glesVersion: '3.0' | '3.1' | '3.2';
    vsync: boolean;
    enablePrimeOffload: boolean;
  };
  audio: {
    backend: 'pipewire' | 'pulseaudio_fallback';
    sampleRate: number;
    bufferSizeFrames: number;
    preserveSampleRate: boolean;
  };
  desktop: {
    enableMpris: boolean;
    enableKdeMediaKeys: boolean;
    enableNotifications: boolean;
    minimizeToTray: boolean;
  };
}
