/* Copyright 2019 Edouard Maleix, read LICENSE */

/* eslint-disable no-underscore-dangle */
const mqtt = require('async-mqtt');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const logger = require('aloes-logger');
const {promisify} = require('util');
const {patternDetector} = require('../src/index');
const {devices} = require('./initial-data');

// Mocking a camera device working on AloesLight protocol
// ('+prefixedDevEui/+method/+omaObjectId/+nodeId/+sensorId/+omaResourceId')

const readFile = promisify(fs.readFile);

const mqttClient = new EventEmitter();
module.exports = mqttClient;

let client;

mqttClient.on('init', config => {
  logger(3, 'mqtt-client', 'init', config.mqttClient);
  client = mqtt.connect(config.mqttBrokerUrl, config.mqttClient);

  client.on('error', err => {
    mqttClient.emit('error', err);
  });

  client.on('connect', async state => {
    mqttClient.emit('status', state);
    mqttClient.user = client._client.options.username;
    mqttClient.devEui = client._client.options.devEui;
    if (client && mqttClient.user) {
      await client.subscribe(`${devices[0].devEui}-in/+/+/+/+/+`);
    }
    // await client.publish(`${devices[0].devEui}-out/0/3306/0/1/5850`, '1');
    // return client.publish(`${devices[0].devEui}-out/0/3349/0/2/5910`, '1');
    return state;
  });

  client.on('offline', state => {
    delete mqttClient.user;
    delete mqttClient.devEui;
    mqttClient.emit('status', state);
  });

  client.on('message', (topic, message) => {
    try {
      // if (!mqttClient.user) {
      //   return new Error('Error: Invalid mqtt client');
      // }
      return mqttClient.emit('message', topic, message);
    } catch (error) {
      logger(4, 'mqtt-client', 'publish:err', error);
      return null;
    }
  });
});

mqttClient.on('message', async (topic, message) => {
  try {
    // const payload = JSON.parse(message);
    const payload = message.toString();
    const packet = {topic, payload};
    const pattern = await patternDetector(packet);
    logger(4, 'mqtt-client', 'onMessage:req', {pattern});
    if (!pattern) return null;
    if (
      pattern.name.toLowerCase() === 'aloeslight' &&
      pattern.params.method === '1' &&
      pattern.params.omaObjectId === '3349' &&
      pattern.params.omaResourceId === '5911' &&
      pattern.params.nodeId === '0' &&
      pattern.params.sensorId === '2' &&
      payload
    ) {
      // topic =  2894413-in/1/3349/0/2/5911
      logger(2, 'mqtt-client', 'image request from broker', payload);

      const img = await readFile(`${path.resolve('.')}/src/assets/feuer.png`);

      if (img && img instanceof Buffer) {
        const newTopic = `${devices[0].devEui}-out/1/${
          pattern.params.omaObjectId
        }/${pattern.params.nodeId}/${pattern.params.sensorId}/5910`;
        //  await mqttClient.emit('publish', newTopic, img);
        return client.publish(newTopic, img);
      }
    }

    logger(4, 'mqtt-client', 'onMessage:res', {pattern});
    return null;
  } catch (error) {
    return null;
  }
});
