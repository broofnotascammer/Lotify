/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Tv,
  Volume2,
  Terminal,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import {
  evaluateHostDiagnostics,
  DEFAULT_HOST_PROBE,
  HostEnvironmentInput,
} from '../lib/diagnostics';
import { DiagnosticStatus } from '../lib/types';

export const HostDoctorView: React.FC = () => {
  const [probeInput, setProbeInput] = useState<HostEnvironmentInput>(DEFAULT_HOST_PROBE);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const checks = evaluateHostDiagnostics(probeInput);
  const allPassed = checks.every((c) => c.status === 'passed');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: DiagnosticStatus) => {
    switch (status) {
      case 'passed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PASSED</span>
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>WARNING</span>
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>FAILED</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Overview Banner */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Host Capability Diagnostics (`lotify-doctor`)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                tools/lotify-doctor
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Audits the host Linux kernel, CPU instruction sets, graphics drivers, audio daemon, and IPC nodes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
                allPassed
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                  : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
              }`}
            >
              {allPassed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Host Ready for Execution</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Action Required</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Environment Simulation Controls (Testing Doctor Responses) */}
        <div className="pt-3 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-300">
              Interactive Hardware &amp; Driver Simulation
            </span>
            <button
              onClick={() => setProbeInput(DEFAULT_HOST_PROBE)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer"
            >
              Reset to Recommended Defaults
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              onClick={() =>
                setProbeInput((p) => ({ ...p, hasBinderNode: !p.hasBinderNode }))
              }
              className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                probeInput.hasBinderNode
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                  : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
              }`}
            >
              <div className="text-[10px] text-neutral-500 uppercase font-mono">Kernel Binder</div>
              <div className="font-medium mt-0.5">
                {probeInput.hasBinderNode ? '✓ /dev/binderfs' : '✗ Missing Binder'}
              </div>
            </button>

            <button
              onClick={() =>
                setProbeInput((p) => ({ ...p, hasPipewire: !p.hasPipewire }))
              }
              className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                probeInput.hasPipewire
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                  : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
              }`}
            >
              <div className="text-[10px] text-neutral-500 uppercase font-mono">Audio Server</div>
              <div className="font-medium mt-0.5">
                {probeInput.hasPipewire ? '✓ PipeWire 1.0' : '✗ PipeWire Inactive'}
              </div>
            </button>

            <button
              onClick={() =>
                setProbeInput((p) => ({
                  ...p,
                  gpuRenderer: p.gpuRenderer?.includes('NVIDIA')
                    ? 'Mesa Intel(R) HD Graphics 4000 (IVB GT2)'
                    : 'NVIDIA GeForce GT 650M (PRIME Offload)',
                }))
              }
              className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-left hover:border-neutral-700 transition cursor-pointer"
            >
              <div className="text-[10px] text-neutral-500 uppercase font-mono">Graphics Adapter</div>
              <div className="font-medium text-neutral-200 mt-0.5 truncate">
                {probeInput.gpuRenderer?.includes('NVIDIA') ? 'NVIDIA GT 650M' : 'Intel HD 4000'}
              </div>
            </button>

            <button
              onClick={() =>
                setProbeInput((p) => ({
                  ...p,
                  displayServer: p.displayServer === 'X11' ? 'Wayland' : 'X11',
                }))
              }
              className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-left hover:border-neutral-700 transition cursor-pointer"
            >
              <div className="text-[10px] text-neutral-500 uppercase font-mono">Display Server</div>
              <div className="font-medium text-neutral-200 mt-0.5">
                {probeInput.displayServer} (KDE Plasma)
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics Check List */}
      <div className="space-y-3">
        {checks.map((check) => (
          <div
            key={check.id}
            className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  {check.category === 'cpu' && <Cpu className="w-4 h-4 text-emerald-400" />}
                  {check.category === 'graphics' && <Tv className="w-4 h-4 text-blue-400" />}
                  {check.category === 'audio' && <Volume2 className="w-4 h-4 text-amber-400" />}
                  {check.category === 'kernel' && <Terminal className="w-4 h-4 text-purple-400" />}
                  {check.category === 'desktop' && <Activity className="w-4 h-4 text-teal-400" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{check.name}</h3>
                  <p className="text-xs text-neutral-400">{check.description}</p>
                </div>
              </div>

              <div>{getStatusBadge(check.status)}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/80 font-mono">
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-sans">
                  Detected Current Value:
                </span>
                <span className="text-neutral-200">{check.currentValue}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-sans">
                  Required Value:
                </span>
                <span className="text-neutral-400">{check.requiredValue}</span>
              </div>
            </div>

            {check.fixRecommendation && (
              <div className="rounded-lg bg-neutral-950 p-3 border border-amber-900/50 space-y-1.5">
                <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Arch Linux Fix Command</span>
                </span>
                <div className="flex items-center justify-between gap-2 bg-neutral-900/90 px-2.5 py-1.5 rounded border border-neutral-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                  <code>{check.fixRecommendation}</code>
                  <button
                    onClick={() => copyToClipboard(check.fixRecommendation!, check.id)}
                    className="text-neutral-400 hover:text-white shrink-0 p-1 cursor-pointer"
                    title="Copy command"
                  >
                    {copiedId === check.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MacBookPro9,1 Hardware & Architecture Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mesa Crocus & GLES 3.0 Realities */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Tv className="w-4 h-4 text-emerald-400" />
            <span>Mesa Ivy Bridge (Crocus) Capabilities</span>
          </div>
          <div className="space-y-2 text-xs text-neutral-300">
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="font-semibold text-neutral-200">OpenGL ES 3.0: Supported</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Mesa's modern `crocus` gallium driver exposes GLES 3.0 on Gen 7 Intel HD Graphics 4000.
              </p>
            </div>
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="font-semibold text-amber-300">ASTC Hardware Compression: Missing</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Gen 7 hardware lacks silicon for ASTC texture decompression. Lotify routes ASTC textures to CPU software decompression.
              </p>
            </div>
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="font-semibold text-neutral-200">Linux PRIME Offload: Supported</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Optional NVIDIA GeForce GT 650M is dispatched via `DRI_PRIME=1` without requiring Bumblebee daemon.
              </p>
            </div>
          </div>
        </div>

        {/* Binder IPC Feasibility Report */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Binder IPC Feasibility Report</span>
          </div>
          <div className="space-y-2 text-xs text-neutral-300">
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="font-semibold text-neutral-200">Device Node: /dev/binderfs/binder</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Kernel Binder driver provides ioctl IPC (`BINDER_WRITE_READ`). Standard Arch Linux kernel packages include binderfs support.
              </p>
            </div>
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="font-semibold text-neutral-200">AOSP ServiceManager: Ready</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Context manager token (handle 0) is bound when ServiceManager initializes.
              </p>
            </div>
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="font-semibold text-neutral-400">Security: SO_PEERCRED Authentication</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Host supervisor validates socket peer credentials before issuing binder transactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
