/* Copyright 2019 Edouard Maleix, read LICENSE */

const logger = require('aloes-logger');
const mqttBroker = require('./broker-decoder');
const mqttClient = require('./mqtt-client');
const wsClient = require('./ws-client');
const {AccessTokens, accounts, devices} = require('./initial-data');

const config = {
  mqttBrokerUrl: `mqtt://localhost:1883`,
  wsBrokerUrl: `ws://localhost:3000`,
  mqttBroker: {
    interfaces: [
      {type: 'mqtt', port: 1883},
      {type: 'http', port: 3000, bundle: true, static: './', stats: true},
    ],
  },
  mqttClient: {
    port: 1883,
    host: '0.0.0.0',
    username: devices[0].id,
    password: devices[0].apiKey,
  },
  wsClient: {
    port: 3000,
    host: '0.0.0.0',
    username: accounts[0].id,
    password: AccessTokens[1].id,
  },
};

mqttClient.on('publish', (topic, payload) => {
  logger(3, 'mqtt-client', 'onPublish', {topic});
  const packet = {topic, payload};
  mqttBroker.emit('published', packet);
});

wsClient.on('publish', (topic, payload) => {
  logger(3, 'ws-client', 'onPublish', topic);
  const packet = {topic, payload};
  mqttBroker.emit('published', packet);
});

// mqttClient.on('message', (topic, payload) => {
//   logger(4, 'mqtt-client', 'onMessage:req', {
//     topic,
//   });
// });

// wsClient.on('message', (topic, payload) => {
//   logger(4, 'ws-client', 'onMessage:req', {
//     topic,
//   });
// });

mqttBroker.on('ready', () => {
  mqttClient.emit('init', config);
  wsClient.emit('init', config);
});

mqttBroker.emit('init', config);
