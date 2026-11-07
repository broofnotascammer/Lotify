/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSearch,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  Layers,
  Shield,
  Box,
  FileText,
} from 'lucide-react';
import {
  inspectApkBuffer,
  SAMPLE_SPOTIFY_X86_64,
  SAMPLE_SPOTIFY_ARM_ONLY,
  SAMPLE_SPOTIFY_SPLIT_BUNDLE,
} from '../lib/apkInspector';
import { ApkMetadata } from '../lib/types';

interface ApkInspectorViewProps {
  currentApk: ApkMetadata;
  onSelectApk: (apk: ApkMetadata) => void;
}

export const ApkInspectorView: React.FC<ApkInspectorViewProps> = ({
  currentApk,
  onSelectApk,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setParsing(true);
    setParseError(null);
    try {
      const buffer = await file.arrayBuffer();
      const meta = await inspectApkBuffer(buffer, file.name);
      onSelectApk(meta);
    } catch (err) {
      setParseError(`Failed to parse file: ${(err as Error).message}`);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header Info */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">APK Metadata Inspector</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                crates/lotify-apk
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Statically audits Android APK archives, DEX headers, ELF dynamic libraries, and AndroidManifest.xml without executing code.
            </p>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectApk(SAMPLE_SPOTIFY_X86_64)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/40 transition cursor-pointer"
            >
              Spotify x86-64 (Valid)
            </button>
            <button
              onClick={() => onSelectApk(SAMPLE_SPOTIFY_ARM_ONLY)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800/80 hover:bg-rose-900/40 transition cursor-pointer"
            >
              ARM64 (Invalid ABI)
            </button>
            <button
              onClick={() => onSelectApk(SAMPLE_SPOTIFY_SPLIT_BUNDLE)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/80 hover:bg-amber-900/40 transition cursor-pointer"
            >
              Split Bundle (Incomplete)
            </button>
          </div>
        </div>

        {/* Upload Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            isDragging
              ? 'border-emerald-500 bg-emerald-950/20'
              : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="w-8 h-8 text-neutral-400" />
            <div className="text-xs font-medium text-neutral-200">
              {parsing ? 'Parsing APK archive...' : 'Drop official Spotify APK here or click to browse'}
            </div>
            <p className="text-[11px] text-neutral-500 max-w-sm">
              Processes `.apk` files locally in-memory. Checks DEX magic headers and native `.so` ELF slices.
            </p>
            <label className="mt-1 inline-flex items-center px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-medium cursor-pointer border border-neutral-700 transition">
              <span>Select File</span>
              <input
                type="file"
                accept=".apk,.zip"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {parseError && (
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs text-rose-300">
            {parseError}
          </div>
        )}
      </div>

      {/* Package Analysis Results */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{currentApk.packageName}</h3>
              {currentApk.verdict === 'Supported' && (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verdict: Supported (x86_64)</span>
                </span>
              )}
              {currentApk.verdict === 'RequiresAdditionalSplits' && (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Verdict: Requires Additional Splits</span>
                </span>
              )}
              {currentApk.verdict === 'Unsupported' && (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <XCircle className="w-3 h-3" />
                  <span>Verdict: Unsupported ABI</span>
                </span>
              )}
              {currentApk.verdict === 'PotentiallySupported' && (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verdict: Pure DEX (Potentially Supported)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Version: {currentApk.versionName} (Build Code: {currentApk.versionCode})
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 mr-1.5">Min SDK:</span>
              <span className="text-neutral-200">{currentApk.minSdkVersion} (Android 7.0+)</span>
            </div>
            <div className="px-3 py-1.5 rounded bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 mr-1.5">Target SDK:</span>
              <span className="text-neutral-200">{currentApk.targetSdkVersion} (Android 14)</span>
            </div>
          </div>
        </div>

        {/* Warnings or Incompatibilities */}
        {currentApk.issues.length > 0 && (
          <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-800/60 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Compatibility Notice</span>
            </div>
            {currentApk.issues.map((issue, idx) => (
              <p key={idx} className="text-xs text-amber-200/90 leading-relaxed font-mono">
                {issue}
              </p>
            ))}
          </div>
        )}

        {/* Technical Inspection Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Native Libraries & ABIs */}
          <div className="p-4 rounded-lg bg-neutral-950/70 border border-neutral-800/80 space-y-3">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold">
              <Box className="w-4 h-4 text-emerald-400" />
              <span>Native ELF Shared Objects (`lib/`)</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-neutral-400 font-medium">ABIs Found in Package:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {currentApk.supportedAbis.map((abi) => (
                    <span
                      key={abi}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        abi === 'x86_64'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}
                    >
                      {abi}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 font-medium">Dynamically Linked Libraries:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {currentApk.nativeLibraries.map((lib) => (
                    <span
                      key={lib}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 text-neutral-300 border border-neutral-800"
                    >
                      {lib}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bytecode & Dalvik Executables */}
          <div className="p-4 rounded-lg bg-neutral-950/70 border border-neutral-800/80 space-y-3">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>DEX Bytecode &amp; Subsystems</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">DEX Files Count:</span>
                <span className="font-mono text-neutral-200">{currentApk.dexCount} classes.dex</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">Total Bytecode Size:</span>
                <span className="font-mono text-neutral-200">
                  {(currentApk.dexByteSize / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">AudioTrack JNI Callpaths:</span>
                <span className="font-mono text-emerald-400">
                  {currentApk.hasAudioTrackUsage ? 'Detected (Bridge active)' : 'Not detected'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">MediaSession Subsystem:</span>
                <span className="font-mono text-emerald-400">
                  {currentApk.hasMediaSessionUsage ? 'Detected (MPRIS routed)' : 'Not detected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Declared Android Permissions */}
        <div className="p-4 rounded-lg bg-neutral-950/70 border border-neutral-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Declared Manifest Permissions</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentApk.permissions.map((perm) => (
              <span
                key={perm}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-800"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
