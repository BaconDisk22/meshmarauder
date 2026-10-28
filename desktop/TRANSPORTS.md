# Meshtastic transport contract

All transports must support `connect(options)`, `disconnect()`, `send(bytes)`, and emit `status`, `data`, and `error` events. No transport should report SESSION READY merely because the underlying link opened.

| Transport | Discovery | Opening | Session readiness |
| --- | --- | --- | --- |
| TCP | manual LAN host initially | port 4403 with bounded timeout | ToRadio/FromRadio config handshake |
| BLE | explicit macOS chooser | Meshtastic GATT service and characteristics | config handshake |
| USB | explicit port list/selection | serial port with permission and bounded timeout | config handshake |

## Connection states
Disconnected → Connecting → Initializing → Session Ready. Any state may transition to Needs Attention or Disconnected. Only Session Ready enables packet monitor live mode.

## Security and UX
- No automatic LAN scans or unexpected device connections.
- Mask sensitive identifiers and never export private channel keys or raw credentials by default.
- Timeouts and teardown are required; never leave duplicate radio listeners.
- Separate demo packets from real traffic and label simulated content clearly.
- Preserve upstream command-line tools unchanged.
