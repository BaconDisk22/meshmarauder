# MeshMarauder — Intel Mac Desktop & Original CLI

> **Development build — not yet hardware-verified or published as a release.** This fork adds a separate Electron desktop interface for authorized Meshtastic radio monitoring. Original upstream CLI tools remain available below.

[![Intel Mac Desktop](https://github.com/BaconDisk22/meshmarauder/actions/workflows/desktop-intel.yml/badge.svg)](https://github.com/BaconDisk22/meshmarauder/actions/workflows/desktop-intel.yml)

## Intel Mac desktop app

The new dark operations workspace includes a navigation sidebar, Wi-Fi/TCP and USB connection controls, a live packet monitor, connection diagnostics, theme selection, and clearly marked simulated demonstration packets. A node intelligence view is proposed in [PR #41](https://github.com/BaconDisk22/meshmarauder/pull/41) and is **not yet part of main**. Bluetooth transport scaffolding exists, but native BLE discovery/connection is not yet available in the desktop UI.

### Download a development build

1. Open [Intel Mac Desktop Actions](https://github.com/BaconDisk22/meshmarauder/actions/workflows/desktop-intel.yml) and select a successful run on `main`.
2. Under **Artifacts**, download `mesh-marauder-macos-intel` (GitHub sign-in may be required).
3. Extract the artifact and open the x86_64 DMG or ZIP on an Intel Mac. This development app is not yet signed/notarized; macOS may warn about an unidentified developer. Only run builds you trust.
4. Connect an authorized Meshtastic radio over Wi-Fi/TCP (typically port `4403`) or USB. **Transport open** is not the same as **session ready**; wait for the Meshtastic handshake.
5. Inspect LIVE packet entries. DEMO / SIMULATED packets are never radio observations.

### Desktop screenshots

The desktop CI workflow attempts to capture an **actual Electron UI screenshot** and, when available, uploads it as the `mesh-marauder-ui-screenshot` workflow artifact. Download it from the same Actions run. Screenshot capture is best-effort on hosted macOS runners; an absent artifact means capture was unsuccessful, not that a screenshot was verified. Once a screenshot is reviewed, it can be committed to `docs/screenshots/` for display directly in this README.

### Current limitations

- Physical radio handshake, packet fidelity, USB reconnect, and unexpected disconnect behavior still require Intel Mac/radio verification.
- Bluetooth LE is not fully integrated; do not treat its informational card as a working connection method.
- Build success is not evidence of signing, notarization, or a successful hardware session.
- No public release is published as part of this documentation update.

See [desktop documentation](desktop/README.md) and [release gates](desktop/RELEASE_CANDIDATE_GATES.md) for the development checklist.

## Upstream MeshMarauder CLI

The following documentation describes the original Dataparty LLC project and its security-research command-line tools. Those capabilities are separate from the new desktop monitoring interface. Retain upstream copyright and GPL-3.0 attribution.

---

# mesh marauder

 * Documentation - [meshmarauder.net](https://meshmarauder.net)
 * Code - [github.com/datapartyjs/meshmarauder](https://github.com/datapartyjs/meshmarauder)
 * Support - [ko-fi/nullagent](https://ko-fi.com/nullagent)

Features

 - packet capture
   * single channel
   * scanning
   * multiple devices (coming soon)
 - packet decoding
   * protocol header
   * unencrypted packets
   * encrypted symmetric channel messages
   * encrypted asymmetric DM messages (partial)
 - PKI poisoning
 - User profile tampering
 - public channel impersonation 
 - MITM private messages (partial)
 - Location spoofing (coming soon)
 - Webapp (coming soon)

## Join the fun

 * Flash [MeshTNC](https://github.com/datapartyjs/MeshTNC) to your favorite lora mesh device
 * Install this repo
 * Run `./lora-scanner.sh` to listen for lora traffic
 * Run `./meshmarauder.sh` to start marauding (coming soon)

## Installing

You must install using this command:

`npx jsr add @meshtastic/protobufs`

If you use `npm i` it probably won't install.

## Disclaimer

This is a demonstration for DEFCON 33 and not recommended to be used on public default meshes.

## Follow & Support

 * Support - [ko-fi.com/nullagent](https://ko-fi.com/nullagent)
 * Follow - [partyon.xyz/@nullagent](https://partyon.xyz/@nullagent)

## Example


### Log and decode meshtastic
 
 `./bin/lora-scanner -D /dev/tty_lorapipe0 -p 917.25,500,7,8,2b | ./bin/lora-decoder`

Log meshcore

`./bin/lora-scanner -D /dev/tty_lorapipe0 -p 910.525,62.5,7,5,12`

