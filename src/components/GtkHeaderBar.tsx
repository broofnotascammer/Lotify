/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Layers,
  Cpu,
  Terminal,
  FileSearch,
  Activity,
  Settings,
  Code2,
  Circle,
  Play,
  Square,
  Sparkles,
  Server,
  Gauge,
} from 'lucide-react';
import { RuntimeState } from '../lib/types';

interface GtkHeaderBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  state: RuntimeState;
  onStartDaemon: () => void;
  onStopDaemon: () => void;
}

export const GtkHeaderBar: React.FC<GtkHeaderBarProps> = ({
  activeTab,
  setActiveTab,
  state,
  onStartDaemon,
  onStopDaemon,
}) => {
  const getStatusColor = (s: RuntimeState) => {
    switch (s) {
      case 'Running':
        return 'bg-emerald-500 text-emerald-300 ring-emerald-500/30';
      case 'Ready':
        return 'bg-blue-500 text-blue-300 ring-blue-500/30';
      case 'Launching':
      case 'Starting':
      case 'Stopping':
        return 'bg-amber-500 text-amber-300 ring-amber-500/30';
      case 'Failed':
        return 'bg-rose-500 text-rose-300 ring-rose-500/30';
      case 'Stopped':
      default:
        return 'bg-neutral-500 text-neutral-400 ring-neutral-500/20';
    }
  };

  const navItems = [
    { id: 'home', label: 'Overview', icon: Layers },
    { id: 'benchmarks', label: 'Benchmarks', icon: Gauge },
    { id: 'system', label: 'System Bootstrap', icon: Server },
    { id: 'art', label: 'ART Bootstrap', icon: Cpu },
    { id: 'runtime', label: 'Supervisor', icon: Terminal },
    { id: 'apk', label: 'APK Inspector', icon: FileSearch },
    { id: 'diagnostics', label: 'Host Doctor', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'code', label: 'Repository', icon: Code2 },
  ];

  return (
    <header className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur px-4 py-2.5 select-none shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Left: Window Controls + Brand */}
      <div className="flex items-center gap-3">
        {/* Linux Desktop Window Buttons */}
        <div className="flex items-center gap-1.5 mr-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600/50" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/50" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/50" />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-inner">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-neutral-100 tracking-tight">Lotify</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                v0.1.0-alpha
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 hidden sm:block">
              Android Spotify x86-64 Compatibility Platform
            </p>
          </div>
        </div>
      </div>

      {/* Center: Adwaita ViewSwitcher */}
      <nav aria-label="Main Navigation" className="flex items-center bg-neutral-950/80 p-0.5 rounded-lg border border-neutral-800/80 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Runtime State Badge & Quick Action */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium ring-1 bg-opacity-10 ${getStatusColor(
            state
          )}`}
        >
          <Circle className="w-2 h-2 fill-current animate-pulse" />
          <span>{state.toUpperCase()}</span>
        </div>

        {state === 'Stopped' || state === 'Failed' ? (
          <button
            onClick={onStartDaemon}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Start Daemon</span>
          </button>
        ) : (
          <button
            onClick={onStopDaemon}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-rose-600/80 hover:bg-rose-500 text-white font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop Daemon</span>
          </button>
        )}
      </div>
    </header>
  );
};
