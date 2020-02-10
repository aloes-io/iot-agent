/* Copyright 2019 Edouard Maleix, read LICENSE */

const {assert} = require('chai');
const {patternDetector, encode} = require('../');

// collectionPattern: '+userId/+collectionName/+method',
// instancePattern: '+userId/+collectionName/+method/+modelId',
describe('encode - MySensors - test 1', () => {
  // "pattern": "+prefixedDevEui/+nativeNodeId/+nativeSensorId/+method//+ack/+subType",
  const packet = {topic: 'MySensors123-in/0/2/0/0/4', payload: 'test'};

  const keys = [
    'name',
    'devEui',
    'transportProtocol',
    'messageProtocol',
    'nativeSensorId',
    'nativeNodeId',
    'nativeType',
    'type',
    'colors',
    'icons',
    'resources',
    'method',
    'prefix',
    // 'nativeResource',
    // 'resource',
    // 'inputPath',
    // 'outputPath',
    'inPrefix',
    'outPrefix',
    'value',
    'frameCounter',
    'lastSignal',
  ];
  const pattern = patternDetector(packet);
  const encoded = encode(packet, pattern);

  it('encoded should exist', () => {
    assert.typeOf(encoded, 'object');
  });

  it('encoded should contain Sensor instance properties', () => {
    assert.hasAllKeys(encoded, keys);
  });

  it(`encoded value should be ${packet.payload}`, () => {
    assert.strictEqual(packet.payload, encoded.value);
  });
});

describe('encode -AloesLight - test 2', () => {
  // "pattern": "+prefixedDevEui/+method/+omaObjectId/+nodeId/+sensorId/+ipsoResourceId",
  const packet = {topic: 'AloesLight123-in/0/3306/1/2/5850', payload: '1'};

  const keys = [
    'name',
    'devEui',
    'transportProtocol',
    'messageProtocol',
    'nativeSensorId',
    'nativeNodeId',
    'nativeType',
    'nativeResource',
    'type',
    'resource',
    'resources',
    'inputPath',
    'outputPath',
    'inPrefix',
    'outPrefix',
    'prefix',
    'method',
    'value',
    'colors',
    'frameCounter',
    'icons',
    'lastSignal',
    'direction',
  ];
  const pattern = patternDetector(packet);
  const encoded = encode(packet, pattern);

  it('encoded should exist', () => {
    assert.typeOf(encoded, 'object');
  });

  it('encoded should contain Sensor instance properties', () => {
    assert.hasAllKeys(encoded, keys);
  });

  it(`encoded value should be '1`, () => {
    assert.strictEqual('1', encoded.value);
  });
});

describe('encode - CayenneLPP - test 3', () => {
  // "pattern": "+appEui/+method/+gwId",
  // instancePattern: '+userId/+collectionName/+method/+modelId',
  // const LoraWANPayload = {
  //   message: {
  //     direction: 'DOWN',
  //     type: 'Unconfirmed Data Down',
  //     gateway: {
  //       mac: 'b827ebfffe6cc78d',
  //       portup: '53677',
  //       portdown: '31254',
  //       latitude: '',
  //       longitude: '',
  //     },
  //     sensor: {
  //       id: 1,
  //       transportProtocol: 'loraWan',
  //       messageProtocol: 'cayenneLPP',
  //       type: 3200,
  //       nativeType: '0',
  //       resource: 5500,
  //       resources: {'5500': 1},
  //       nativeResource: 5500,
  //       nativeNodeId: '0',
  //       nativeSensorId: '12',
  //       devAddr: '03ff0001',
  //       inPrefix: '-in',
  //       outPrefix: '-out',
  //       value: '1',
  //       packet: '800100ff0300000001461c02b695ac147a4a9d540334168034a58ac5',
  //     },
  //   },
  // };

  const payload = Buffer.from(
    '800100ff0300000001461c02b695ac147a4a9d540334168034a58ac5',
    'hex',
  );

  const packet = {
    topic: '5c635046e1fec60e6050e47b/Unconfirmed Data Up/b827ebfffe6cc78d',
    payload,
  };

  const keys = [
    'type',
    'transportProtocol',
    'messageProtocol',
    'devAddr',
    'devEui',
    'nativeSensorId',
    'nativeType',
    'nativeResource',
    'resource',
    'resources',
    'packet',
    'value',
    'colors',
    'icons',
    'name',
  ];

  const pattern = patternDetector(packet);
  const encoded = encode(packet, pattern);

  it('encoded should exist', () => {
    assert.typeOf(encoded[0], 'object');
  });

  it('encoded should contain Sensor instance properties', () => {
    assert.hasAllKeys(encoded[0], keys);
  });

  it(`encoded resource should be 5500`, () => {
    assert.strictEqual(5500, encoded[0].resource);
  });

  it(`encoded value should be 1`, () => {
    assert.strictEqual(1, encoded[0].value);
  });
});
