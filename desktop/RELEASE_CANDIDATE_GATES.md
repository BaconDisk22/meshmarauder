# MeshMarauder release-candidate gates

This checklist does **not** authorize publishing a release.

- [ ] All PRs merged intentionally after review; Intel Mac CI green on final main.
- [ ] Intel x86_64 DMG and ZIP downloaded and launched on a real Intel Mac.
- [ ] Wi-Fi/TCP session handshake and packet monitor verified on authorized radio.
- [ ] TCP disconnect, reconnect, and session teardown tested with radio power loss.
- [ ] USB session verified on supported physical radio and cable, or explicitly marked experimental.
- [ ] Bluetooth support verified with native adapter and real radio, or explicitly marked unsupported.
- [ ] Demo packets always labeled and never presented as live data.
- [ ] Security, privacy, dependency, and GPL-3.0 attribution review completed.
- [ ] Signing/notarization requirements and macOS warnings documented.
- [ ] Explicit owner approval received before publishing any release.

Record test evidence and failures before checking a box.
