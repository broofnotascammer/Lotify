/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GtkHeaderBar } from './components/GtkHeaderBar';
import { HomePageView } from './components/HomePageView';
import { RuntimeSupervisorView } from './components/RuntimeSupervisorView';
import { ApkInspectorView } from './components/ApkInspectorView';
import { HostDoctorView } from './components/HostDoctorView';
import { ArtBootstrapView } from './components/ArtBootstrapView';
import { SystemBootstrapView } from './components/SystemBootstrapView';
import { SettingsView } from './components/SettingsView';
import { RepoExplorerView } from './components/RepoExplorerView';
import { BenchmarkView } from './components/BenchmarkView';

import {
  createInitialContext,
  StateMachineContext,
  transition,
} from './lib/stateMachine';
import { ApkMetadata, IpcPacket, LotifyConfig } from './lib/types';
import { SAMPLE_SPOTIFY_X86_64 } from './lib/apkInspector';

const DEFAULT_CONFIG: LotifyConfig = {
  general: {
    logLevel: 'info',
    dataDir: '/var/lib/lotify',
    socketPath: '/run/user/1000/lotify/daemon.sock',
    autoStartDaemon: true,
  },
  runtime: {
    artHeapLimitMb: 512,
    binderDevice: '/dev/binderfs/binder',
    enableBionicInterp: false,
    useIsolatedNamespaces: true,
    pinnedAospRevision: 'android-14.0.0_r50',
  },
  graphics: {
    backend: 'egl_gles_crocus',
    glesVersion: '3.0',
    vsync: true,
    enablePrimeOffload: true,
  },
  audio: {
    backend: 'pipewire',
    sampleRate: 44100,
    bufferSizeFrames: 1024,
    preserveSampleRate: true,
  },
  desktop: {
    enableMpris: true,
    enableKdeMediaKeys: true,
    enableNotifications: true,
    minimizeToTray: true,
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [ctx, setCtx] = useState<StateMachineContext>(createInitialContext());
  const [currentApk, setCurrentApk] = useState<ApkMetadata>(SAMPLE_SPOTIFY_X86_64);
  const [config, setConfig] = useState<LotifyConfig>(DEFAULT_CONFIG);
  const [ipcPackets, setIpcPackets] = useState<IpcPacket[]>([]);
  const [packetSeq, setPacketSeq] = useState<number>(1);

  // Helper to append IPC packet
  const pushIpcPacket = (
    direction: 'client_to_daemon' | 'daemon_to_client',
    type: IpcPacket['type'],
    payload: Record<string, unknown>
  ) => {
    const packet: IpcPacket = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      direction,
      type,
      payload,
      rawBytesLength: 16 + JSON.stringify(payload).length,
    };
    setIpcPackets((prev) => [...prev, packet]);
    setPacketSeq((s) => s + 1);
  };

  const handleStartDaemon = () => {
    let next = transition(ctx, { type: 'START_REQUESTED' });
    setCtx(next);

    pushIpcPacket('client_to_daemon', 'HANDSHAKE_REQ', {
      client: 'lotify-gtk',
      pid: 48102,
      protocolVersion: 1,
    });

    setTimeout(() => {
      pushIpcPacket('daemon_to_client', 'HANDSHAKE_RESP', {
        daemon: 'lotifyd',
        version: '0.1.0',
        pid: 48210,
        socketPath: config.general.socketPath,
      });

      next = transition(next, {
        type: 'INITIALIZED_SUCCESS',
        pid: 48210,
        socketPath: config.general.socketPath,
      });
      setCtx(next);

      pushIpcPacket('daemon_to_client', 'GET_STATE_RESP', {
        state: 'Ready',
        uptimeSeconds: 1,
        activeApp: null,
      });
    }, 400);
  };

  const handleStopDaemon = () => {
    let next = transition(ctx, { type: 'STOP_REQUESTED' });
    setCtx(next);

    pushIpcPacket('client_to_daemon', 'STOP_RUNTIME_REQ', { force: false });

    setTimeout(() => {
      pushIpcPacket('daemon_to_client', 'STOP_RUNTIME_RESP', { success: true });
      next = transition(next, { type: 'STOPPED_CLEANLY' });
      setCtx(next);
    }, 300);
  };

  const handleLaunchSpotify = () => {
    if (!currentApk.isX86_64Compatible) {
      let next = transition(ctx, {
        type: 'LAUNCH_APP_REQUESTED',
        appId: currentApk.packageName,
        apkPath: '/var/lib/lotify/apps/spotify.apk',
      });
      setCtx(next);

      setTimeout(() => {
        next = transition(next, {
          type: 'APP_LAUNCH_FAILED',
          reason: 'Incompatible APK architecture: missing x86_64 native libraries slice.',
        });
        setCtx(next);
        pushIpcPacket('daemon_to_client', 'LAUNCH_APP_RESP', {
          success: false,
          error: 'MISSING_X86_64_ABI',
        });
      }, 500);
      return;
    }

    let next = transition(ctx, {
      type: 'LAUNCH_APP_REQUESTED',
      appId: currentApk.packageName,
      apkPath: '/var/lib/lotify/apps/spotify.apk',
    });
    setCtx(next);

    pushIpcPacket('client_to_daemon', 'LAUNCH_APP_REQ', {
      packageName: currentApk.packageName,
      targetSdk: currentApk.targetSdkVersion,
      artHeapLimitMb: config.runtime.artHeapLimitMb,
    });

    setTimeout(() => {
      const appPid = 48299;
      pushIpcPacket('daemon_to_client', 'LAUNCH_APP_RESP', {
        success: true,
        appPid,
        audioStreamId: 'pipewire-audio-track-0',
      });

      next = transition(next, {
        type: 'APP_STARTED_SUCCESS',
        appPid,
      });
      setCtx(next);
    }, 600);
  };

  const handleSimulateAppExit = () => {
    let next = transition(ctx, { type: 'APP_EXITED', exitCode: 0 });
    setCtx(next);
    pushIpcPacket('daemon_to_client', 'LOG_STREAM_EVENT', {
      event: 'ProcessExit',
      code: 0,
      message: 'Spotify application terminated cleanly',
    });
  };

  const handleSendHeartbeat = () => {
    pushIpcPacket('client_to_daemon', 'GET_STATE_REQ', { seq: packetSeq });
    setTimeout(() => {
      pushIpcPacket('daemon_to_client', 'GET_STATE_RESP', {
        state: ctx.state,
        uptimeSeconds: ctx.uptimeStart ? Math.floor((Date.now() - ctx.uptimeStart) / 1000) : 0,
        activeAppPid: ctx.appPid,
      });
    }, 200);
  };

  const handleSimulateTimeout = () => {
    let next = transition(ctx, { type: 'HEARTBEAT_TIMEOUT' });
    setCtx(next);
    pushIpcPacket('daemon_to_client', 'LOG_STREAM_EVENT', {
      event: 'HeartbeatLoss',
      error: 'ERR_IPC_TIMEOUT',
    });
  };

  const handleResetError = () => {
    let next = transition(ctx, { type: 'RESET' });
    setCtx(next);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-900 selection:text-emerald-100 antialiased">
      {/* GTK 4 Desktop Libadwaita Window Frame */}
      <div className="flex-1 flex flex-col bg-neutral-950">
        <GtkHeaderBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          state={ctx.state}
          onStartDaemon={handleStartDaemon}
          onStopDaemon={handleStopDaemon}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === 'home' && (
            <HomePageView
              ctx={ctx}
              onStartDaemon={handleStartDaemon}
              onStopDaemon={handleStopDaemon}
              onLaunchSpotify={handleLaunchSpotify}
              onSimulateAppExit={handleSimulateAppExit}
              onResetError={handleResetError}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'art' && <ArtBootstrapView />}

          {activeTab === 'system' && <SystemBootstrapView />}

          {activeTab === 'runtime' && (
            <RuntimeSupervisorView
              ctx={ctx}
              ipcPackets={ipcPackets}
              onStartDaemon={handleStartDaemon}
              onStopDaemon={handleStopDaemon}
              onSendHeartbeat={handleSendHeartbeat}
              onSimulateTimeout={handleSimulateTimeout}
              onResetError={handleResetError}
            />
          )}

          {activeTab === 'apk' && (
            <ApkInspectorView
              currentApk={currentApk}
              onSelectApk={setCurrentApk}
            />
          )}

          {activeTab === 'diagnostics' && <HostDoctorView />}

          {activeTab === 'benchmarks' && <BenchmarkView runtimeState={ctx.state} />}

          {activeTab === 'settings' && (
            <SettingsView
              config={config}
              onChangeConfig={setConfig}
              onResetDefaults={() => setConfig(DEFAULT_CONFIG)}
            />
          )}

          {activeTab === 'code' && <RepoExplorerView />}
        </main>
      </div>

      {/* Linux Desktop Status Footer Bar */}
      <footer className="border-t border-neutral-900 bg-neutral-950 px-4 py-2 text-[11px] text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Lotify Platform v0.1.0
          </span>
          <span className="text-neutral-500">|</span>
          <span className="font-mono text-neutral-400">Target: Arch Linux (x86-64)</span>
          <span className="text-neutral-500 hidden md:inline">|</span>
          <span className="text-neutral-400 hidden md:inline">
            PipeWire AudioTrack &bull; Mesa EGL 3.0 &bull; D-Bus MPRIS
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400">
          <span>ART JIT: x86-64</span>
          <span>&bull;</span>
          <span>IPC: /run/user/1000/lotify/daemon.sock</span>
        </div>
      </footer>
    </div>
  );
}
