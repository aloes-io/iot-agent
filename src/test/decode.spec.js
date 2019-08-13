require('@babel/register');

import {assert} from 'chai';
import {patternDetector, decode} from '../';

// collectionPattern: '+userId/+collectionName/+method',
// instancePattern: '+userId/+collectionName/+method/+modelId',

describe('decode - test 1', () => {
  const packet = {
    topic: '1/Sensor/POST',
    payload: Buffer.from(
      JSON.stringify({
        transportProtocol: 'aloesLight',
        messageProtocol: 'aloesLight',
        devEui: '3322321',
        type: 3300,
        nativeSensorId: '4',
        nativeNodeId: '1',
        resource: 5700,
        resources: {'5700': 1},
        inputPath: `3322321-in/1/3300/1/4/5700`,
        outputPath: `3322321-out/1/3300/1/4/5700`,
        inPrefix: '-in',
        outPrefix: '-out',
        value: 5,
      }),
    ),
  };

  const pattern = patternDetector(packet);
  const params = pattern.params;
  const decoded = decode(packet, params);

  it('decoded should exist', () => {
    assert.typeOf(decoded, 'object');
  });

  it('decoded payload should contain topic and payload properties', () => {
    assert.hasAllKeys(decoded, ['topic', 'payload']);
  });

  it(`decoded payload should be 5`, () => {
    assert.strictEqual(5, decoded.payload);
  });

  it(`decoded topic should be 3322321-in/1/3300/1/4/5700`, () => {
    assert.strictEqual('3322321-in/1/3300/1/4/5700', decoded.topic);
  });
});

describe('decode - test 2', () => {
  const packet = {
    topic: '1/Sensor/PUT/1',
    payload: Buffer.from(
      JSON.stringify({
        id: 1,
        transportProtocol: 'aloesLight',
        messageProtocol: 'aloesLight',
        devEui: '3322321',
        type: 3306,
        nativeSensorId: '4',
        nativeNodeId: '1',
        resource: 5850,
        resources: {'5850': 1},
        inputPath: `3322321-in/1/3306/1/4/5850`,
        outputPath: `3322321-out/1/3306/1/4/5850`,
        inPrefix: '-in',
        outPrefix: '-out',
        value: 10,
      }),
    ),
  };

  const pattern = patternDetector(packet);
  const params = pattern.params;
  const decoded = decode(packet, params);

  it('decoded should exist', () => {
    assert.typeOf(decoded, 'object');
  });

  it('decoded payload should contain topic and payload properties', () => {
    assert.hasAllKeys(decoded, ['topic', 'payload']);
  });

  it(`decoded payload should be 10`, () => {
    assert.strictEqual(10, decoded.payload);
  });

  it(`decoded topic should be 3322321-in/1/3306/1/4/5850`, () => {
    assert.strictEqual('3322321-in/1/3306/1/4/5850', decoded.topic);
  });
});

describe('decode - test 3', () => {
  const packet = {
    topic: '1/Sensor/PUT/1',
    payload: Buffer.from(
      JSON.stringify({
        id: 1,
        transportProtocol: 'mySensors',
        messageProtocol: 'mySensors',
        devEui: '3322321',
        type: 3300,
        nativeNodeId: '3',
        nativeSensorId: '4',
        nativeResource: 48,
        resource: 5700,
        resources: {'5700': 1},
        inputPath: `3322321-in/3/4/1/0/48`,
        outputPath: `3322321-out/3/4/1/0/48`,
        inPrefix: '-in',
        outPrefix: '-out',
        value: 5,
      }),
    ),
  };

  const pattern = patternDetector(packet);
  const params = pattern.params;
  const decoded = decode(packet, params);

  it('decoded should exist', () => {
    assert.typeOf(decoded, 'object');
  });

  it('decoded payload should contain topic and payload properties', () => {
    assert.hasAllKeys(decoded, ['topic', 'payload']);
  });

  it(`decoded payload should be 5`, () => {
    assert.strictEqual(5, decoded.payload);
  });

  it(`decoded topic should be 3322321-in/3/4/1/0/48`, () => {
    assert.strictEqual('3322321-in/3/4/1/0/48', decoded.topic);
  });
});

describe('decode - test 4', () => {
  const packet = {
    topic: '1/IoTAgent/PUT',
    payload: Buffer.from(
      JSON.stringify({
        deviceId: '5c2657ad36bb1052f87cf417',
        transportProtocol: 'mySensors',
        messageProtocol: 'mySensors',
        devEui: '3322321',
        type: 3306,
        nativeSensorId: '4',
        nativeNodeId: '4',
        nativeResource: 2,
        resource: 5850,
        resources: {'5850': 5},
        inputPath: `3322321-in/4/4/1/0/2`,
        outputPath: `3322321-out/4/4/1/0/2`,
        inPrefix: '-in',
        outPrefix: '-out',
        value: 15,
      }),
    ),
  };
  const pattern = patternDetector(packet);
  const params = pattern.params;
  const decoded = decode(packet, params);

  it('decoded should exist', () => {
    assert.typeOf(decoded, 'object');
  });

  it('decoded payload should contain topic and payload properties', () => {
    assert.hasAllKeys(decoded, ['topic', 'payload']);
  });

  it(`decoded payload should be 15`, () => {
    assert.strictEqual(15, decoded.payload);
  });

  it(`decoded topic should be 3322321-in/4/4/1/0/2`, () => {
    assert.strictEqual('3322321-in/4/4/1/0/2', decoded.topic);
  });
});

describe('decode - test 5', () => {
  const topic = '5c635046e1fec60e6050e47b/IoTAgent/POST';
  const packet = {
    //  topic: '1/IoTAgent/PUT/1',
    topic:
      '5c635046e1fec60e6050e47b/Unconfirmed Data Up/b827ebfffe6cc78d/03ff0001',
    payload: Buffer.from(
      JSON.stringify({
        id: 1,
        transportProtocol: 'loraWan',
        messageProtocol: 'cayenneLPP',
        type: 3200,
        nativeType: '0',
        resource: 5500,
        resources: {'5500': 1},
        nativeResource: 5500,
        nativeSensorId: '12',
        devAddr: '03ff0001',
        inPrefix: '-in',
        outPrefix: '-out',
        value: '1',
        packet: '800100ff0300000001461c02b695ac147a4a9d540334168034a58ac5',
      }),
    ),
  };

  const pattern = patternDetector(packet);
  const params = pattern.params;
  params.method = 'POST';
  params.appEui = '5c635046e1fec60e6050e47b';
  const decoded = decode(packet, params);

  it('decoded should exist', () => {
    assert.typeOf(decoded, 'object');
  });

  it('decoded payload should contain topic and payload properties', () => {
    assert.hasAllKeys(decoded, ['topic', 'payload']);
  });

  it(`decoded payload packet should be 000c00`, () => {
    assert.strictEqual('000c00', decoded.payload.packet);
  });

  it(`decoded topic should be ${topic}`, () => {
    assert.strictEqual(topic, decoded.topic);
  });
});
