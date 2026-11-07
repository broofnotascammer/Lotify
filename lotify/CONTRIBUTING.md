# Contributing to Lotify

Thank you for contributing to Lotify!

## Development Philosophy
- Lotify is a **Linux-native compatibility runtime**, not an Android emulator or Electron wrapper.
- All code must target x86-64 Linux directly without unnecessary abstraction penalties.
- Upstream Android Open Source Project (AOSP) ART and Bionic components are pinned source dependencies.
- Never commit proprietary Spotify APKs or binaries to the repository.

## Submitting Pull Requests
1. Ensure `cargo fmt --check` and `cargo clippy --all-targets` pass with zero warnings.
2. Run the test suite: `cargo test --workspace`.
3. Add unit tests for state machine changes or parser logic.
4. Document any new kernel or hardware assumptions in `docs/COMPATIBILITY.md`.
