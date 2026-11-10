# Lotify 1.0 — Engineering Rules & Integrity Constitution

## 1. Zero-Simulation Policy
1. **Never fabricate functionality**: A passing unit test does not prove Android framework compatibility. A mocked status badge is not proof of Binder communication.
2. **Explicit Classifications**:
   - `PASS`: Verified through actual runtime execution against genuine infrastructure.
   - `PARTIAL`: Implemented in source code, but runtime verification is incomplete.
   - `BLOCKED`: Cannot proceed because of a verified external environment or dependency limitation.
   - `SIMULATION`: Explicitly simulated behavior.
   - `NOT IMPLEMENTED`: No implementation exists in the codebase.
   - `NOT MEASURED`: No reliable, repeatable empirical measurement exists.
3. **No False Success**: A diagnostic test confirming that the Binder driver is absent in a container sandbox passes as a diagnostic, but the underlying Binder subsystem MUST be classified as `BLOCKED`.

## 2. Resource & Performance Rules
1. **No Busy-Waiting**: Event-driven operation only. Looper steps must use non-blocking kernel `poll(2)` with explicit timeouts.
2. **Memory Discipline**: Measure Resident Set Size (RSS) and Proportional Set Size (PSS) separately. Never ignore memory leaks in C shims.
3. **IPC Framing**: Separate in-process function overhead, Unix domain socket round-trips, and genuine Binder driver latency.
4. **Audio Latency vs Buffer Duration**: Never report buffer duration (e.g. 5.33 ms for 256 frames @ 48kHz) as "end-to-end audio latency". End-to-end latency must be measured through the actual hardware DAC DMA path.

## 3. Security Guidelines
1. **No World-Writable Permissions**: Never recommend or set `chmod 0666 /dev/binderfs/binder`. Use dedicated desktop user groups (e.g., `chown root:lotify /dev/binderfs/binder && chmod 0660 /dev/binderfs/binder`).
2. **Namespace Isolation**: Run Android processes under Linux mount, pid, and ipc namespaces.
3. **Immutability**: Enforce read-only property immutability (`ro.*`) post-boot with `errno = EACCES`.
