# AI Context — Architecture Decision Records (ADRs)

## ADR-001: Pinned AOSP Android 14 Baseline
- **Decision**: Pin AOSP source tree to tag `android-14.0.0_r50` (API 34).
- **Rationale**: Spotify for Android requires modern SDK 34 targets. Android 14 provides clean 64-bit userspace, Rust-based ServiceManager, and stable Binder UAPI.

## ADR-002: ServiceManager Coexistence Model
- **Decision**: In full runtime, AOSP `/system/bin/servicemanager` owns Handle 0. Lotify acts as a client.
- **Rationale**: Attempting to register Lotify as context manager when AOSP `servicemanager` runs returns `EBUSY`. Standalone host looper is used strictly for unit testing.

## ADR-003: Hardware ASTC Decompression Fallback
- **Decision**: Route ASTC compressed texture decompression through CPU software decoding on Intel Gen7 (HD 4000).
- **Rationale**: Ivy Bridge silicon lacks hardware ASTC decompression. Rejecting it would break baseline compatibility; CPU software fallback enables rendering without modern GPU requirements.

## ADR-004: PipeWire Direct AudioTrack Bridge
- **Decision**: Direct AudioTrack buffer negotiation into host PipeWire graph with `libspa-speexresample`.
- **Rationale**: Prevents double-resampling jitter and keeps buffer duration at 5.33 ms (256 frames @ 48kHz).

## ADR-005: Secure Binderfs Permissions
- **Decision**: Recommend `chown root:lotify /dev/binderfs/binder && chmod 0660 /dev/binderfs/binder`.
- **Rationale**: Eliminates world-writable (`0666`) security hazards while allowing non-root desktop launcher access.
