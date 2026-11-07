# Lotify Runtime Execution Pipeline

## 1. Supervisor Lifecycle State Machine

The daemon transitions through 7 strict states:

```text
    +-----------+
    |  STOPPED  |<-----------------------------------+
    +-----------+                                     |
          | (StartRequested)                          |
          v                                           |
    +-----------+     (InitFailed)     +----------+   |
    | STARTING  |--------------------->|  FAILED  |---+ (Reset)
    +-----------+                      +----------+
          | (InitializedSuccess)              ^
          v                                   |
    +-----------+                             |
    |   READY   |                             |
    +-----------+                             |
       |     ^                                |
       |     | (AppExited / LaunchFailed)     | (HeartbeatLoss)
       v     |                                |
    +-----------+                             |
    | LAUNCHING |                             |
    +-----------+                             |
          | (AppStartedSuccess)               |
          v                                   |
    +-----------+                             |
    |  RUNNING  |-----------------------------+
    +-----------+
          | (StopRequested)
          v
    +-----------+
    |  STOPPING |
    +-----------+
          | (CleanShutdown)
          v
    +-----------+
    |  STOPPED  |
    +-----------+
```

## 2. Unix Domain Socket IPC

- **Socket Path:** `$XDG_RUNTIME_DIR/lotify/daemon.sock` (typically `/run/user/1000/lotify/daemon.sock`)
- **Transport Framing:** 4-byte magic (`0x4C4F5449`), 2-byte protocol version (`0x0001`), 4-byte sequence ID, 2-byte message ID, 4-byte payload length, followed by serialized Protocol Buffer bytes.
- **Peer Credentials:** Peer UID/GID validated via `SO_PEERCRED` on Linux to enforce that only the current user session can interact with the daemon.
