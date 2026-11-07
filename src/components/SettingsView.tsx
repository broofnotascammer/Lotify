/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings, Volume2, Tv, Cpu, Radio, Save, RotateCcw } from 'lucide-react';
import { LotifyConfig } from '../lib/types';

interface SettingsViewProps {
  config: LotifyConfig;
  onChangeConfig: (newConfig: LotifyConfig) => void;
  onResetDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onChangeConfig,
  onResetDefaults,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Settings Header */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">Runtime &amp; Hardware Preferences</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
              crates/lotify-config
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configures PipeWire audio buffers, Mesa EGL graphics contexts, ART heap limits, and MPRIS integration.
          </p>
        </div>

        <button
          onClick={onResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Graphics Section */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-neutral-800 pb-2">
            <Tv className="w-4 h-4 text-emerald-400" />
            <span>Graphics Acceleration &amp; EGL</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-neutral-300 font-medium">Renderer Backend</label>
              <select
                value={config.graphics.backend}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    graphics: {
                      ...config.graphics,
                      backend: e.target.value as any,
                    },
                  })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 font-medium focus:border-emerald-500 focus:outline-none"
              >
                <option value="egl_gles_crocus">Intel HD Graphics 4000 (Mesa Crocus EGL / GLES 3.0)</option>
                <option value="nvidia_prime">NVIDIA GeForce GT 650M (PRIME DRI Offload)</option>
                <option value="mesa_software">llvmpipe (Mesa Software Rasterizer Fallback)</option>
              </select>
              <p className="text-[11px] text-neutral-500">
                Prioritizes Intel Ivy Bridge hardware acceleration without requiring proprietary NVIDIA drivers.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-300 font-medium">GLES Version Constraint</label>
              <select
                value={config.graphics.glesVersion}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    graphics: {
                      ...config.graphics,
                      glesVersion: e.target.value as any,
                    },
                  })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 font-medium focus:border-emerald-500 focus:outline-none"
              >
                <option value="3.0">OpenGL ES 3.0 (Recommended for Spotify)</option>
                <option value="3.1">OpenGL ES 3.1</option>
                <option value="3.2">OpenGL ES 3.2</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audio Section */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-neutral-800 pb-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>PipeWire Audio Routing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-neutral-300 font-medium">Sample Rate Passthrough</label>
              <select
                value={config.audio.sampleRate}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    audio: {
                      ...config.audio,
                      sampleRate: Number(e.target.value),
                    },
                  })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 font-medium focus:border-emerald-500 focus:outline-none"
              >
                <option value={44100}>44.1 kHz (Spotify Native CD Audio Standard)</option>
                <option value={48000}>48.0 kHz (Linux PipeWire Default)</option>
              </select>
              <p className="text-[11px] text-neutral-500">
                Preserves original Spotify PCM sample rate to avoid audio artifacting.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-300 font-medium">PipeWire Buffer Size (Frames)</label>
              <input
                type="number"
                value={config.audio.bufferSizeFrames}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    audio: {
                      ...config.audio,
                      bufferSizeFrames: Number(e.target.value),
                    },
                  })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 font-mono focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-neutral-500">
                Default 1024 frames (~21ms latency) prevents buffer underruns during background tasks.
              </p>
            </div>
          </div>
        </div>

        {/* Runtime & Memory Section */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-neutral-800 pb-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>AOSP ART Runtime &amp; Kernel</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-neutral-300 font-medium">ART Heap Maximum Limit</label>
                <span className="font-mono text-emerald-400 font-semibold">
                  {config.runtime.artHeapLimitMb} MB
                </span>
              </div>
              <input
                type="range"
                min={256}
                max={2048}
                step={128}
                value={config.runtime.artHeapLimitMb}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    runtime: {
                      ...config.runtime,
                      artHeapLimitMb: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-emerald-500"
              />
              <p className="text-[11px] text-neutral-500">
                Limits memory footprint inside the cgroup container to preserve host RAM.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-300 font-medium">Binder Driver Node</label>
              <input
                type="text"
                value={config.runtime.binderDevice}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    runtime: {
                      ...config.runtime,
                      binderDevice: e.target.value,
                    },
                  })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 font-mono text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Desktop Integration */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-neutral-800 pb-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Desktop &amp; MPRIS Integration</span>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.desktop.enableMpris}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    desktop: { ...config.desktop, enableMpris: e.target.checked },
                  })
                }
                className="rounded accent-emerald-500 w-4 h-4"
              />
              <div>
                <div className="font-medium text-neutral-200">
                  Register `org.mpris.MediaPlayer2.Lotify` on D-Bus Session Bus
                </div>
                <div className="text-[11px] text-neutral-500">
                  Allows KDE Plasma media controller widget, lock screen controls, and playerctl to control playback.
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.desktop.enableKdeMediaKeys}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    desktop: { ...config.desktop, enableKdeMediaKeys: e.target.checked },
                  })
                }
                className="rounded accent-emerald-500 w-4 h-4"
              />
              <div>
                <div className="font-medium text-neutral-200">Intercept Global Hardware Media Keys</div>
                <div className="text-[11px] text-neutral-500">
                  Handles Play/Pause, Next Track, and Previous Track keyboard multimedia buttons.
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
