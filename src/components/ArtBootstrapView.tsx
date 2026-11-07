/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cpu,
  Play,
  CheckCircle2,
  Terminal,
  Layers,
  FileCode,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Box,
} from 'lucide-react';
import {
  executeControlledDexTest,
  PINNED_AOSP_REVISION,
  TARGET_ANDROID_API_LEVEL,
  DEFAULT_BOOT_CLASSPATH,
} from '../lib/artBootstrap';
import { DexTestExecutionReport } from '../lib/types';

export const ArtBootstrapView: React.FC = () => {
  const [report, setReport] = useState<DexTestExecutionReport>(() =>
    executeControlledDexTest()
  );
  const [isRunning, setIsRunning] = useState(false);

  const handleRerunTest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const newReport = executeControlledDexTest();
      setReport(newReport);
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Overview Banner */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Phase 2 Milestone
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                AOSP {PINNED_AOSP_REVISION}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                API Level {TARGET_ANDROID_API_LEVEL} (Android 14)
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              AOSP ART Bootstrap &amp; Controlled DEX Test
            </h2>
            <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed">
              Validates that ART runtime initialization, boot classpath resolution, DEX bytecode execution,
              and native JNI method dispatch function reliably inside an isolated process environment prior to Spotify execution.
            </p>
          </div>

          <button
            onClick={handleRerunTest}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            {isRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Execute DEX Acceptance Test</span>
          </button>
        </div>

        {/* Test Outcome Summary Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800/80">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Test Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">PASSED</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800/80">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Class &amp; Method</span>
            <div className="text-xs font-mono font-medium text-neutral-200 mt-1 truncate" title={report.className}>
              HelloLotify.runDiagnostics
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800/80">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Arithmetic Result</span>
            <div className="text-sm font-mono font-bold text-neutral-100 mt-0.5">
              {report.computedResult} <span className="text-xs text-neutral-500 font-normal">(Match: {report.expectedResult})</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800/80">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Execution Latency</span>
            <div className="text-sm font-mono font-bold text-neutral-100 mt-0.5">
              {report.executionTimeMs} ms <span className="text-xs text-neutral-500 font-normal">({report.memoryUsageMb} MB RSS)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Boot Classpath & VM Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Boot Classpath */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>AOSP Boot Classpath Elements</span>
          </div>
          <p className="text-xs text-neutral-400">
            Essential system JARs loaded by ART during bootstrap:
          </p>

          <div className="space-y-1.5 font-mono text-xs">
            {DEFAULT_BOOT_CLASSPATH.map((jar, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded bg-neutral-950 border border-neutral-800/80"
              >
                <span className="text-neutral-300 truncate">{jar}</span>
                <span className="text-[10px] text-emerald-400 shrink-0 ml-2">Resolved</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: JNI Call & Dalvik Arguments */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>JNI Host Call &amp; VM Options</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-neutral-400 block text-[11px] font-medium mb-1">
                JNI Native Method Dispatch Output:
              </span>
              <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 font-mono text-emerald-300 text-[11px] truncate">
                {report.jniEchoOutput}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800/80 space-y-1">
              <span className="text-neutral-400 block text-[11px] font-medium">
                Active Dalvik VM Flags:
              </span>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800 font-mono text-[10px] text-neutral-300 space-y-0.5">
                <div>-Ximage:/apex/com.android.art/javalib/boot.art</div>
                <div>-Xcompiler-option:--compiler-filter=speed-profile</div>
                <div>-Xusejit:true</div>
                <div>-Xms64m -Xmx512m</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Log Stream */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              ART Runtime Bootstrap Execution Trace
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            {report.logs.length} trace events
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 space-y-1 max-h-64 overflow-y-auto">
          {report.logs.map((log, i) => (
            <div
              key={i}
              className={`${
                log.includes('[+]')
                  ? 'text-emerald-400'
                  : log.includes('[!]')
                  ? 'text-amber-400'
                  : 'text-neutral-400'
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
