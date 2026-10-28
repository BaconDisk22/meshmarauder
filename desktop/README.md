# Mesh Marauder Desktop (rebuild)

The desktop application is a new, isolated interface for **authorized Meshtastic radio monitoring**. It builds on the upstream GPL-3.0 codebase while preserving the original command-line tools and copyright notices.

## Targets
- Intel x86_64 macOS Tahoe 26.7.1, click-to-open Electron app in DMG and ZIP
- Wi-Fi/TCP, BLE, and USB/serial transports with Meshtastic session checks
- Clear demonstration mode, operator-safe connections, diagnostics, packet monitor
- Four themes: Futuristic Neons, Mocha Mousse, Fun & Vibrant, Dusk

## Implementation order
1. Desktop shell and deterministic demo mode
2. Transport interfaces and protocol validation
3. Real radio connection workflows and device discovery
4. Packet decoding and diagnostics
5. Automated Intel Mac packaging and release verification

> **Important:** A connected socket or serial port is not evidence of a successful Meshtastic session. Show session readiness only after protocol handshake completes.

This directory is kept independent of upstream command-line scripts. Keep GPL attribution and avoid automatically activating invasive/security-testing functions.
