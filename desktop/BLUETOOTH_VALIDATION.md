# Bluetooth validation gates

Bluetooth support is **not** production ready. The existing BLE transport requires a native adapter that is not bundled in the Intel Mac app. No UI claim of BLE connectivity is permitted until the following pass on real macOS hardware.

- [ ] Select and document a macOS BLE adapter compatible with the Meshtastic GATT service.
- [ ] Validate user-initiated discovery, explicit device selection, and permission prompts.
- [ ] Validate characteristic subscriptions, packet framing, handshake, and session-ready status.
- [ ] Confirm unexpected radio power loss, macOS Bluetooth toggles, and manual disconnect recover.
- [ ] Confirm no automatic transmission or invasive scanning; keep radio actions opt-in.
- [ ] Run the full Intel Mac workflow and record radio firmware, logs, and screenshots.

Do not merge BLE capability claims into a release until these gates are verified.
