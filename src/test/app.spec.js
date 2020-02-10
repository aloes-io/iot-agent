/* Copyright 2019 Edouard Maleix, read LICENSE */

const {assert} = require('chai');
const {appPatternDetector} = require('../');

describe('detect app pattern - test 1', () => {
  const packet = {
    topic:
      'IDYKS1CFDI73FWKLCTWSKJTBDD8GB7BC/Device/PIYKS1CFDI73FWKLCTWSKJTBDD8GB7BC/RX',
    payload: Buffer.from(
      JSON.stringify({
        message: {
          gateway: {mac: 'ZXYKS1CFDI73FWKLCTWSKJTBDD8GB7BC'},
          sensor: {
            transportProtocol: 'loraWan',
            messageProtocol: 'aloesLight',
            devEui: '3322321',
            type: 3300,
            nativeNodeId: '0',
            nativeSensorId: '4',
            resource: 5700,
            resources: {'5700': 1},
            inPrefix: '-in',
            outPrefix: '-out',
            value: 5,
          },
        },
      }),
    ),
  };

  const externalApp = {
    name: 'test1',
    description: null,
    icon: '/icons/image-placeholder.png',
    accessPointUrl: '192.168.1.63',
    transportProtocol: 'loraWan',
    transportProtocolVersion: null,
    appEui: 'IDYKS1CFDI73FWKLCTWSKJTBDD8GB7BC',
    apiKey: 'Maac6MSXucaNhgaTv2oruCsA2rssR1a0Q1ZYkr0VoLQhjumPftCtJevp4xYdlViN',
    pattern: '+appEui/+collection/+modelId/#device',
    validators: {
      appEui: [
        {
          field: '+appEui',
          value: '32',
          transformation: null,
          operation: 'length',
          registered: false,
        },
      ],
      collection: [
        {
          field: '+collection',
          value: 'device | sensor',
          operation: 'equals',
          transformation: 'lowercase',
          registered: true,
        },
      ],
      modelId: [
        {
          field: '+modelId',
          value: '32',
          transformation: null,
          operation: 'length',
          registered: false,
        },
      ],
      device: [
        {
          field: '#device',
          value: 'rx | tx',
          transformation: 'lowercase',
          operation: 'includes',
          registered: true,
        },
      ],
    },
    public: false,
    id: '5c89375b8bbd1420cc2217b6',
    accountId: '5c24e1514a603a651d1ddfd5',
  };
  const keys = [
    'appEui',
    'collection',
    'modelId',
    'transportProtocol',
    'device',
  ];
  const pattern = appPatternDetector(packet, externalApp);
  const params = pattern.params;

  it('params should exist', () => {
    assert.typeOf(params, 'object');
  });

  it(`params should contain ${keys} properties`, () => {
    assert.hasAllKeys(params, keys);
  });

  it(`pattern.name should be ${externalApp.name}`, () => {
    assert.strictEqual(pattern.name, externalApp.name);
  });
});

describe('detect app pattern - test 2', () => {
  const packet = {
    topic:
      'IDYKS1CFDI73FWKLCTWSKJTBDD8GB7BC/SensorPIYKS1CFDI73FWKLCTWSKJTBDD8GB7BC/ConfirmedRX',
    payload: Buffer.from(
      JSON.stringify({
        message: {
          gateway: {mac: 'ZXYKS1CFDI73FWKLCTWSKJTBDD8GB7BC'},
          sensor: {
            transportProtocol: 'loraWan',
            messageProtocol: 'aloesLight',
            devEui: '3322321',
            type: 3300,
            nativeNodeId: '0',
            nativeSensorId: '4',
            resource: 5700,
            resources: {'5700': 1},
            inPrefix: '-in',
            outPrefix: '-out',
            value: 5,
          },
        },
      }),
    ),
  };

  const externalApp = {
    name: 'test2',
    description: null,
    icon: '/icons/image-placeholder.png',
    accessPointUrl: '192.168.1.63',
    transportProtocol: 'loraWan',
    transportProtocolVersion: null,
    appEui: 'IDYKS1CFDI73FWKLCTWSKJTBDD8GB7BC',
    apiKey: 'Maac6MSXucaNhgaTv2oruCsA2rssR1a0Q1ZYkr0VoLQhjumPftCtJevp4xYdlViN',
    pattern: '+appEui/+collection/+direction',
    validators: {
      appEui: [
        {
          field: '+appEui',
          value: '32',
          transformation: null,
          operation: 'length',
          registered: false,
        },
      ],
      collection: [
        {
          field: '+collection',
          value: 'device | sensor',
          operation: 'startswith',
          transformation: 'lowercase',
          registered: true,
        },
      ],
      direction: [
        {
          field: '+direction',
          value: 'RX | TX',
          transformation: 'uppercase',
          operation: 'endswith',
          registered: true,
        },
      ],
    },
    public: false,
    id: '5c89375b8bbd1420cc2217b6',
    accountId: '5c24e1514a603a651d1ddfd5',
  };
  const keys = ['appEui', 'collection', 'transportProtocol', 'direction'];
  const pattern = appPatternDetector(packet, externalApp);
  const params = pattern.params;

  it('params should exist', () => {
    assert.typeOf(params, 'object');
  });

  it(`params should contain ${keys} properties`, () => {
    assert.hasAllKeys(params, keys);
  });

  it(`pattern.name should be ${externalApp.name}`, () => {
    assert.strictEqual(pattern.name, externalApp.name);
  });
});

describe('detect app pattern - test 3', () => {
  const packet = {
    topic: 'testinvalid/invalidKey/ConfirmedRX',
    payload: Buffer.from(
      JSON.stringify({
        message: {
          gateway: {mac: 'ZXYKS1CFDI73FWKLCTWSKJTBDD8GB7BC'},
          sensor: {
            transportProtocol: 'loraWan',
            messageProtocol: 'aloesLight',
            devEui: '3322321',
            type: 3300,
            nativeNodeId: '0',
            nativeSensorId: '4',
            resource: 5700,
            resources: {'5700': 1},
            inPrefix: '-in',
            outPrefix: '-out',
            value: 5,
          },
        },
      }),
    ),
  };

  const externalApp = {
    name: 'test3',
    description: null,
    icon: '/icons/image-placeholder.png',
    accessPointUrl: '192.168.1.63',
    transportProtocol: 'loraWan',
    transportProtocolVersion: null,
    appEui: 'IDYKS1CFDI73FWKLCTWSKJTBDD8GB7BC',
    apiKey: 'Maac6MSXucaNhgaTv2oruCsA2rssR1a0Q1ZYkr0VoLQhjumPftCtJevp4xYdlViN',
    pattern: '+appEui/+collection/+direction',
    validators: {
      appEui: [
        {
          field: '+appEui',
          value: '32',
          transformation: null,
          operation: 'length',
          registered: false,
        },
      ],
      collection: [
        {
          field: '+collection',
          value: 'device | sensor',
          operation: 'startswith',
          transformation: 'lowercase',
          registered: true,
        },
      ],
      direction: [
        {
          field: '+direction',
          value: 'RX | TX',
          transformation: 'uppercase',
          operation: 'endswith',
          registered: true,
        },
      ],
    },
    public: false,
    id: '5c89375b8bbd1420cc2217b6',
    accountId: '5c24e1514a603a651d1ddfd5',
  };

  const pattern = appPatternDetector(packet, externalApp);
  const params = pattern.params;

  it('params should be null', () => {
    assert.strictEqual(params, null);
  });

  it(`pattern.name should be ${externalApp.name}`, () => {
    assert.strictEqual(pattern.name, externalApp.name);
  });
});
