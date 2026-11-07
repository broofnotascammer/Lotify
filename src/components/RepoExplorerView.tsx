/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Code2,
  FolderTree,
  Download,
  Copy,
  Check,
  FileText,
  FileCode,
  FileCog,
  CheckCircle2,
} from 'lucide-react';
import JSZip from 'jszip';
import { LOTIFY_REPO_FILES, RepoFile } from '../lib/lotifyRepoData';

export const RepoExplorerView: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>(LOTIFY_REPO_FILES[0].path);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const activeFile =
    LOTIFY_REPO_FILES.find((f) => f.path === selectedPath) || LOTIFY_REPO_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('lotify') || zip;

      for (const file of LOTIFY_REPO_FILES) {
        rootFolder.file(file.path, file.content);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lotify-v0.1.0-monorepo.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (file: RepoFile) => {
    switch (file.category) {
      case 'config':
        return <FileCog className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'rust':
        return <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'proto':
        return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'docs':
      default:
        return <FileText className="w-4 h-4 text-neutral-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header Bar */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">Monorepo Codebase &amp; Architecture Files</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
              Lotify v0.1.0
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Rust workspace crates, Meson build config, Protocol Buffers schemas, application profiles, and systemd units.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={downloading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Packing ZIP...' : 'Download Monorepo (.zip)'}</span>
        </button>
      </div>

      {/* Explorer 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Tree Navigator */}
        <div className="md:col-span-4 rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 space-y-1 max-h-[600px] overflow-y-auto">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1.5">
            Repository Files
          </div>
          {LOTIFY_REPO_FILES.map((file) => {
            const isSelected = file.path === selectedPath;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedPath(file.path)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800 text-emerald-300 font-semibold border border-neutral-700/80'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/60'
                }`}
              >
                {getFileIcon(file)}
                <span className="truncate">{file.path}</span>
              </button>
            );
          })}
        </div>

        {/* Right Code Viewer */}
        <div className="md:col-span-8 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col max-h-[600px]">
          {/* File Tab Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/90 rounded-t-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-neutral-200">{activeFile.path}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                {activeFile.language}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer Body */}
          <div className="p-4 overflow-auto flex-1 font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre selection:bg-emerald-950 selection:text-emerald-200">
            {activeFile.content}
          </div>
        </div>
      </div>
    </div>
  );
};
