const test = require('node:test');
const assert = require('node:assert/strict');
const { createMeshtasticCodec } = require('../meshtastic-codec.cjs');

async function libs() {
  const [buf, protobufs] = await Promise.all([
    import('@bufbuild/protobuf'),
    import('@meshtastic/protobufs'),
  ]);
  return { ...buf, protobufs };
}

test('encodeWantConfig produces a decodable ToRadio want_config_id', async () => {
  const codec = await createMeshtasticCodec();
  const { fromBinary, protobufs } = await libs();
  const nonce = 0x1234abcd;
  const bytes = codec.encodeWantConfig(nonce);
  assert.ok(Buffer.isBuffer(bytes));
  const toRadio = fromBinary(protobufs.Mesh.ToRadioSchema, Uint8Array.from(bytes));
  assert.equal(toRadio.payloadVariant.case, 'wantConfigId');
  assert.equal(toRadio.payloadVariant.value >>> 0, nonce >>> 0);
});

test('encodeWantConfig rejects a zero nonce', async () => {
  const codec = await createMeshtasticCodec();
  assert.throws(() => codec.encodeWantConfig(0), /non-zero/);
});

test('decodeFromRadio surfaces configCompleteId for the handshake', async () => {
  const codec = await createMeshtasticCodec();
  const { create, toBinary, protobufs } = await libs();
  const nonce = 987654321;
  const fromRadio = create(protobufs.Mesh.FromRadioSchema, {
    payloadVariant: { case: 'configCompleteId', value: nonce },
  });
  const decoded = codec.decodeFromRadio(toBinary(protobufs.Mesh.FromRadioSchema, fromRadio));
  assert.equal(decoded.variant, 'configCompleteId');
  assert.equal(decoded.configCompleteId, nonce >>> 0);
});

test('decodeFromRadio describes a mesh packet with metadata', async () => {
  const codec = await createMeshtasticCodec();
  const { create, toBinary, protobufs } = await libs();
  const packet = create(protobufs.Mesh.MeshPacketSchema, {
    from: 0xdeadbeef, to: 0xffffffff, channel: 2, id: 42,
    payloadVariant: {
      case: 'decoded',
      value: { portnum: protobufs.Portnums.PortNum.TEXT_MESSAGE_APP },
    },
  });
  const fromRadio = create(protobufs.Mesh.FromRadioSchema, {
    payloadVariant: { case: 'packet', value: packet },
  });
  const decoded = codec.decodeFromRadio(toBinary(protobufs.Mesh.FromRadioSchema, fromRadio));
  assert.equal(decoded.variant, 'packet');
  assert.equal(decoded.meta.from, 0xdeadbeef);
  assert.equal(decoded.meta.to, 0xffffffff);
  assert.equal(decoded.meta.channel, 2);
  assert.equal(decoded.meta.encrypted, false);
  assert.equal(decoded.meta.portnum, 'TEXT_MESSAGE_APP');
  assert.match(decoded.summary, /TEXT_MESSAGE_APP/);
});

test('decodeFromRadio marks an encrypted packet without claiming to read it', async () => {
  const codec = await createMeshtasticCodec();
  const { create, toBinary, protobufs } = await libs();
  const packet = create(protobufs.Mesh.MeshPacketSchema, {
    from: 1, to: 2, channel: 0,
    payloadVariant: { case: 'encrypted', value: new Uint8Array([9, 9, 9]) },
  });
  const fromRadio = create(protobufs.Mesh.FromRadioSchema, {
    payloadVariant: { case: 'packet', value: packet },
  });
  const decoded = codec.decodeFromRadio(toBinary(protobufs.Mesh.FromRadioSchema, fromRadio));
  assert.equal(decoded.meta.encrypted, true);
  assert.match(decoded.summary, /encrypted/);
});
