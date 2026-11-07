/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Play,
  Square,
  Music2,
  Cpu,
  Layers,
  Radio,
  ExternalLink,
  ShieldCheck,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { RuntimeState } from '../lib/types';
import { StateMachineContext } from '../lib/stateMachine';

interface HomePageViewProps {
  ctx: StateMachineContext;
  onStartDaemon: () => void;
  onStopDaemon: () => void;
  onLaunchSpotify: () => void;
  onSimulateAppExit: () => void;
  onResetError: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HomePageView: React.FC<HomePageViewProps> = ({
  ctx,
  onStartDaemon,
  onStopDaemon,
  onLaunchSpotify,
  onSimulateAppExit,
  onResetError,
  onNavigateTab,
}) => {
  const isRunning = ctx.state === 'Running';
  const isReady = ctx.state === 'Ready';
  const isLaunching = ctx.state === 'Launching';
  const isFailed = ctx.state === 'Failed';

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Banner / Architectural Identity */}
      <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-emerald-950/40 p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Specialised Android Compatibility Runtime
              </span>
              <span className="px-2 py-0.5 text-[11px] font-mono rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                Arch Linux x86-64 Target
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Lotify Desktop Launcher
            </h1>
            <p className="text-xs md:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              Executes the genuine Android version of Spotify on Linux using pinned AOSP ART, Bionic shims,
              and direct PipeWire &amp; Mesa EGL bridges without a virtual machine emulator or web wrapper.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('benchmarks')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition cursor-pointer"
            >
              <span>Performance Benchmarks</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('system')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition cursor-pointer"
            >
              <span>Milestone 3.1 Bootstrap</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('art')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition cursor-pointer"
            >
              <span>Run DEX Test</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Spotify Application Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1DB954] flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Music2 className="w-8 h-8 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">Spotify for Android</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Official x86-64 Package
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">com.spotify.music (v8.9.74.568)</p>
            </div>
          </div>

          {/* Action Button Set */}
          <div className="flex items-center gap-2">
            {isFailed && (
              <button
                onClick={onResetError}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-medium border border-amber-500/30 transition cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Reset Failure</span>
              </button>
            )}

            {isRunning ? (
              <button
                onClick={onSimulateAppExit}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Terminate Spotify</span>
              </button>
            ) : isLaunching ? (
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 text-white text-xs font-semibold opacity-80 cursor-wait"
              >
                <Flame className="w-4 h-4 animate-spin" />
                <span>Launching Application...</span>
              </button>
            ) : isReady ? (
              <button
                onClick={onLaunchSpotify}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold shadow-lg shadow-emerald-950/60 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Spotify</span>
              </button>
            ) : (
              <button
                onClick={onStartDaemon}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Daemon &amp; Launch</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80 space-y-1">
            <span className="text-[11px] text-neutral-400 font-medium">Supervisor Daemon</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                {ctx.state === 'Stopped' ? 'Not Running' : 'lotifyd (Active)'}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {ctx.daemonPid ? `PID: ${ctx.daemonPid}` : 'PID: —'}
              </span>
            </div>
            <p className="text-[10px] font-mono text-neutral-500 truncate">
              {ctx.socketPath || '/run/user/1000/lotify/daemon.sock'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80 space-y-1">
            <span className="text-[11px] text-neutral-400 font-medium">Audio Pipeline (PipeWire 48k Host)</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-cyan-400">AudioTrack → PipeWire</span>
              <span className="text-xs font-mono text-neutral-400">44.1k → 48kHz</span>
            </div>
            <p className="text-[10px] text-neutral-400">libspa speexresample rate negotiation</p>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80 space-y-1">
            <span className="text-[11px] text-neutral-400 font-medium">Graphics Acceleration</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-200">EGL &amp; OpenGL ES 3.0</span>
              <span className="text-xs font-mono text-emerald-400">Mesa DRI</span>
            </div>
            <p className="text-[10px] text-neutral-400">Target: Intel HD 4000 (Ivy Bridge)</p>
          </div>
        </div>

        {/* Failure alert banner if in Failed state */}
        {isFailed && (
          <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/50 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <div className="font-semibold text-rose-300">
                Runtime Error [{ctx.errorCode || 'ERR_RUNTIME_FAULT'}]
              </div>
              <p className="text-rose-200/90">{ctx.lastError || 'An unexpected runtime condition occurred.'}</p>
            </div>
          </div>
        )}

        {/* Runtime State Details / Technical Subsystems Matrix */}
        <div className="border-t border-neutral-800 pt-4 space-y-3">
          <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Android Compatibility Subsystems (v0.1.0)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded bg-neutral-950/40 border border-neutral-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-medium text-neutral-200">ART &amp; DEX</div>
                <div className="text-[10px] text-neutral-500">x86-64 native</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-neutral-950/40 border border-neutral-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-medium text-neutral-200">Bionic Libc</div>
                <div className="text-[10px] text-neutral-500">Isolated linker</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-neutral-950/40 border border-neutral-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-medium text-neutral-200">Binder IPC</div>
                <div className="text-[10px] text-neutral-500">/dev/binderfs</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-neutral-950/40 border border-neutral-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-medium text-neutral-200">MPRIS v2</div>
                <div className="text-[10px] text-neutral-500">D-Bus session</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transition History / Log Feed */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Supervisor State Machine Log
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            {ctx.transitionHistory.length} events recorded
          </span>
        </div>

        {ctx.transitionHistory.length === 0 ? (
          <p className="text-xs text-neutral-500 italic py-2">
            No state transitions yet. Start daemon or launch application to trigger events.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs pr-1">
            {ctx.transitionHistory.slice(-6).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded bg-neutral-950/60 border border-neutral-800/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold">{item.event}</span>
                  <span className="text-neutral-500">→</span>
                  <span className="text-neutral-200">{item.to}</span>
                </div>
                <span className="text-[10px] text-neutral-500">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
