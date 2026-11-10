# AI Context — Known Issues & Limitations

1. **gVisor Sandbox Binder Limitation**:
   - **Symptom**: `open("/dev/binderfs/binder")` fails with `ENOENT`.
   - **Root Cause**: AI Studio development container runs under gVisor kernel without `CONFIG_ANDROID_BINDER_IPC`.
   - **Workaround/Resolution**: Genuine bare-metal Arch Linux running standard kernel (`linux` or `linux-zen`) has native `binder_linux` module and mounts `binderfs`.

2. **Standalone JVM Missing AOSP Framework**:
   - **Symptom**: `FrameworkBootstrapTest.java` exits with code 2 (`BLOCKED`).
   - **Root Cause**: Standalone host OpenJDK lacks AOSP `framework.jar` and `core-oj.jar` on bootclasspath.
   - **Workaround/Resolution**: Will link against compiled AOSP 14 jar artifacts in Milestone 3.2.

3. **Ivy Bridge ASTC Hardware Absence**:
   - **Symptom**: OpenGL ES applications loading ASTC textures fail to render or crash on Intel HD 4000 without emulation.
   - **Root Cause**: Intel Gen7 Ivy Bridge lacks hardware ASTC decompression blocks.
   - **Workaround/Resolution**: Handled via `CPU_SOFTWARE_DECOMPRESSION` fallback mode.
