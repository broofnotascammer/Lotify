#!/usr/bin/env bash
# ==============================================================================
# Lotify AOSP Prebuilt Extraction Script
# Target: AOSP android-14.0.0_r50 x86_64 headless runtime
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOP_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PREBUILTS_DIR="${TOP_DIR}/android-platform/prebuilts"

echo "[*] Lotify AOSP ART Build & Prebuilt Extractor"
echo "    Pinned Revision : android-14.0.0_r50"
echo "    Target ABI      : x86_64"
echo "    Target Directory: ${PREBUILTS_DIR}"

mkdir -p "${PREBUILTS_DIR}/apex/com.android.art/bin"
mkdir -p "${PREBUILTS_DIR}/apex/com.android.art/lib64"
mkdir -p "${PREBUILTS_DIR}/apex/com.android.art/javalib"
mkdir -p "${PREBUILTS_DIR}/system/bin"
mkdir -p "${PREBUILTS_DIR}/system/lib64"
mkdir -p "${PREBUILTS_DIR}/system/framework"

cat << 'EOF' > "${PREBUILTS_DIR}/README.txt"
Lotify AOSP Prebuilt Directory Layout
-------------------------------------
apex/com.android.art/
  ├── bin/
  │   ├── dalvikvm64
  │   └── dex2oat64
  ├── lib64/
  │   ├── libart.so
  │   ├── libart-compiler.so
  │   ├── libopenjdkjvm.so
  │   └── libopenjdkjvmti.so
  └── javalib/
      ├── core-oj.jar
      ├── core-libart.jar
      └── okhttp.jar
system/
  ├── bin/linker64
  ├── lib64/
  │   ├── libc.so
  │   ├── libdl.so
  │   ├── libm.so
  │   ├── liblog.so
  │   └── libbinder.so
  └── framework/
      ├── framework.jar
      └── ext.jar
EOF

echo "[+] Directory structure initialized at ${PREBUILTS_DIR}."
echo "    To compile from AOSP source root:"
echo "    1. source build/envsetup.sh"
echo "    2. lunch aosp_x86_64_lotify-userdebug"
echo "    3. m dalvikvm dex2oat com.android.art framework"
echo "    4. cp out/target/product/generic_x86_64/... ${PREBUILTS_DIR}/"
