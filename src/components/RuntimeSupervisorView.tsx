/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Terminal,
  Activity,
  Shield,
  Radio,
  Play,
  Square,
  RefreshCw,
  AlertTriangle,
  Zap,
  Lock,
} from 'lucide-react';
import { StateMachineContext } from '../lib/stateMachine';
import { IpcPacket } from '../lib/types';

interface RuntimeSupervisorViewProps {
  ctx: StateMachineContext;
  ipcPackets: IpcPacket[];
  onStartDaemon: () => void;
  onStopDaemon: () => void;
  onSendHeartbeat: () => void;
  onSimulateTimeout: () => void;
  onResetError: () => void;
}

export const RuntimeSupervisorView: React.FC<RuntimeSupervisorViewProps> = ({
  ctx,
  ipcPackets,
  onStartDaemon,
  onStopDaemon,
  onSendHeartbeat,
  onSimulateTimeout,
  onResetError,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Controller */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Runtime Supervisor Daemon (lotifyd)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                crates/lotify-supervisor
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Supervises ART execution, isolates namespaces, routes Binder nodes, and serves the GTK client over Unix domain sockets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ctx.state === 'Stopped' || ctx.state === 'Failed' ? (
              <button
                onClick={onStartDaemon}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Daemon</span>
              </button>
            ) : (
              <button
                onClick={onStopDaemon}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Daemon</span>
              </button>
            )}

            <button
              onClick={onSendHeartbeat}
              disabled={ctx.state === 'Stopped' || ctx.state === 'Failed'}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Ping Heartbeat</span>
            </button>

            <button
              onClick={onSimulateTimeout}
              disabled={ctx.state === 'Stopped' || ctx.state === 'Failed'}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-rose-300 border border-rose-500/30 transition disabled:opacity-50 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Test Timeout</span>
            </button>

            {ctx.state === 'Failed' && (
              <button
                onClick={onResetError}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800/80">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">State</span>
            <div className="text-sm font-bold text-white mt-0.5">{ctx.state}</div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800/80">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Daemon PID</span>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
              {ctx.daemonPid || 'None'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800/80">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Application PID</span>
            <div className="text-sm font-mono font-bold text-blue-400 mt-0.5">
              {ctx.appPid || 'None'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800/80">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Unix Socket</span>
            <div className="text-xs font-mono text-neutral-300 mt-1 truncate">
              {ctx.socketPath || '/run/user/1000/lotify/daemon.sock'}
            </div>
          </div>
        </div>
      </div>

      {/* IPC Protocol Buffers & Socket Framing Stream */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Unix Socket IPC Packets (Magic: 0x4C4F5449 &bull; Version: 1)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            {ipcPackets.length} frames exchanged
          </span>
        </div>

        <div className="rounded-lg bg-neutral-950/90 border border-neutral-800 p-3 space-y-2 max-h-72 overflow-y-auto font-mono text-xs">
          {ipcPackets.length === 0 ? (
            <p className="text-neutral-500 italic py-4 text-center">
              No IPC frames sent. Start the daemon to initiate handshake.
            </p>
          ) : (
            ipcPackets.slice(-10).map((packet) => {
              const isClient = packet.direction === 'client_to_daemon';
              return (
                <div
                  key={packet.id}
                  className="p-2.5 rounded bg-neutral-900/90 border border-neutral-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isClient ? 'bg-blue-900/50 text-blue-300' : 'bg-emerald-900/50 text-emerald-300'
                        }`}
                      >
                        {isClient ? 'CLIENT → DAEMON' : 'DAEMON → CLIENT'}
                      </span>
                      <span className="text-neutral-200 font-semibold">{packet.type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-500 text-[10px]">
                      <span>{packet.rawBytesLength} bytes</span>
                      <span>{new Date(packet.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <pre className="text-[11px] text-neutral-400 overflow-x-auto bg-neutral-950 p-2 rounded border border-neutral-800/60">
                    {JSON.stringify(packet.payload, null, 2)}
                  </pre>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Linux Sandbox & Security Boundaries */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
            Process Sandbox &amp; Security Boundaries
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60 space-y-1">
            <div className="flex items-center gap-1.5 text-neutral-200 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Linux Namespaces</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Unshared mount (`CLONE_NEWNS`), IPC (`CLONE_NEWIPC`), and user namespaces prevent host filesystem writes.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60 space-y-1">
            <div className="flex items-center gap-1.5 text-neutral-200 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Seccomp-BPF Syscall Filter</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Restricts access to privileged syscalls while allowing `memfd_create`, `futex`, and `epoll_pwait`.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60 space-y-1">
            <div className="flex items-center gap-1.5 text-neutral-200 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cgroups v2 Limits</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Enforces hard 768 MB memory ceiling and CPU weight to guarantee host responsiveness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
