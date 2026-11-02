'use strict';
// Real Meshtastic protobuf codec for the desktop client.
//
// @bufbuild/protobuf and @meshtastic/protobufs are ESM-only packages, so this
// CommonJS module loads them through a one-time dynamic import() and hands back
// a codec shaped exactly like the mock in meshtastic-session.test.cjs:
//   encodeWantConfig(nonce) -> Buffer   (a serialized ToRadio.want_config_id)
//   decodeFromRadio(bytes)  -> object   (always carries configCompleteId when
//                                         the radio reports the handshake done)
let loader = null;
function loadProtobufs() {
  if (!loader) {
    loader = Promise.all([
      import('@bufbuild/protobuf'),
      import('@meshtastic/protobufs'),
    ]).then(([buf, protobufs]) => ({
      fromBinary: buf.fromBinary,
      toBinary: buf.toBinary,
      create: buf.create,
      protobufs,
    }));
  }
  return loader;
}

function portName(protobufs, portnum) {
  const name = protobufs.Portnums && protobufs.Portnums.PortNum
    ? protobufs.Portnums.PortNum[portnum]
    : undefined;
  return typeof name === 'string' ? name : `PORT_${portnum >>> 0}`;
}

function describePacket(protobufs, packet) {
  const from = (packet.from >>> 0).toString(16);
  const to = (packet.to >>> 0).toString(16);
  const channel = packet.channel >>> 0;
  const meta = {
    from: packet.from >>> 0,
    to: packet.to >>> 0,
    channel,
    id: packet.id >>> 0,
    rxTime: packet.rxTime >>> 0,
    rxSnr: packet.rxSnr,
    rxRssi: packet.rxRssi,
    hopLimit: packet.hopLimit >>> 0,
  };
  const inner = packet.payloadVariant;
  if (inner && inner.case === 'decoded') {
    const port = portName(protobufs, inner.value.portnum);
    meta.encrypted = false;
    meta.portnum = port;
    return { meta, summary: `pkt ${from}->${to} ch${channel} ${port}` };
  }
  meta.encrypted = true;
  return { meta, summary: `pkt ${from}->${to} ch${channel} encrypted` };
}

async function createMeshtasticCodec() {
  const { fromBinary, toBinary, create, protobufs } = await loadProtobufs();
  const ToRadioSchema = protobufs.Mesh.ToRadioSchema;
  const FromRadioSchema = protobufs.Mesh.FromRadioSchema;
  return {
    encodeWantConfig(nonce) {
      const id = nonce >>> 0;
      if (id === 0) throw new RangeError('want_config id must be non-zero');
      const message = create(ToRadioSchema, {
        payloadVariant: { case: 'wantConfigId', value: id },
      });
      return Buffer.from(toBinary(ToRadioSchema, message));
    },
    decodeFromRadio(bytes) {
      const input = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes);
      const message = fromBinary(FromRadioSchema, input);
      const variant = message.payloadVariant;
      const out = { variant: (variant && variant.case) || 'unknown' };
      if (variant && variant.case === 'configCompleteId') {
        out.configCompleteId = variant.value >>> 0;
        out.summary = 'config-complete';
      } else if (variant && variant.case === 'packet') {
        const described = describePacket(protobufs, variant.value);
        out.meta = described.meta;
        out.summary = described.summary;
      } else if (variant && variant.case === 'myInfo') {
        out.summary = `my-info node ${(variant.value.myNodeNum >>> 0).toString(16)}`;
      } else if (variant && variant.case === 'nodeInfo') {
        out.summary = `node-info ${(variant.value.num >>> 0).toString(16)}`;
      } else {
        out.summary = out.variant;
      }
      return out;
    },
  };
}

module.exports = { createMeshtasticCodec };
