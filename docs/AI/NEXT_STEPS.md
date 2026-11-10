# AI Context — Next Steps & Roadmap

## Immediate Next Steps (Phase 3.2 & 3.3)

1. **Milestone 3.2: Android ActivityManager Integration**:
   - Implement `android.app.IActivityManager` AIDL interface in `lotify-framework-bridge`.
   - Implement `ApplicationThread` transaction handler.
   - Model Android process initialization sequence (`Process.start()`, `ActivityThread.main()`).
   - Implement Activity lifecycle states (`onCreate`, `onStart`, `onResume`, `onPause`, `onStop`, `onDestroy`).
   - Support background Service lifecycle for media playback (`MediaBrowserService`, `Service.startForeground()`).

2. **Milestone 3.3: Android PackageManager Integration**:
   - Parse Spotify APK `AndroidManifest.xml` binary XML format.
   - Discover registered components: Activities, Services, BroadcastReceivers, ContentProviders.
   - Enforce runtime permissions (`RECORD_AUDIO`, `POST_NOTIFICATIONS`, `FOREGROUND_SERVICE`).
   - Handle implicit and explicit Intent resolution.

3. **Milestone 3.4: Spotify Execution Validation**:
   - Load Spotify x86-64 native shared libraries (`libspotify.so`).
   - Initialize JNI environment and invoke entrypoint.
   - Manage application private data directory (`/data/data/com.spotify.music/`).

4. **Milestone 3.5: Audio & MPRIS Integration**:
   - Bridge Android AudioTrack buffers directly into PipeWire stream.
   - Connect playback states to MPRIS v2 D-Bus interface.

5. **Milestone 5.1: AI Handoff Exporter**:
   - Implement `lotify handoff export` command to generate complete self-contained context archive.
