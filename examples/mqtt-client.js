/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */

import mqtt from 'async-mqtt';
import EventEmitter from 'events';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
import {logger} from '../src/logger';
import {patternDetector} from '../src/index';
import {devices} from './initial-data';

// Mocking a camera device working on AloesLight protocol
// ('+prefixedDevEui/+method/+omaObjectId/+sensorId/+omaResourceId')

const readFile = promisify(fs.readFile);

export const mqttClient = new EventEmitter();
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
      await client.subscribe(`${devices[0].devEui}-in/+/+/+/+`);
    }
    await client.publish(`${devices[0].devEui}-out/0/3306/1/5850`, '1');
    return client.publish(`${devices[0].devEui}-out/0/3349/2/5910`, '1');
  });

  client.on('disconnect', state => {
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
      return error;
    }
  });
});

mqttClient.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message);
    const packet = {topic, payload};
    const pattern = await patternDetector(packet);
    logger(4, 'mqtt-client', 'onMessage:req1', {pattern});
    //       2894413-in/1/3349/2/5911
    if (!pattern) return null;
    if (
      pattern.name === 'aloesLight' &&
      pattern.params.method === '1' &&
      pattern.params.omaObjectId === '3349' &&
      pattern.params.omaResourceId === '5911' &&
      pattern.params.sensorId === '2' &&
      payload
    ) {
      const img = await readFile(`${path.resolve('.')}/src/assets/feuer.png`);

      if (img && img instanceof Buffer) {
        const newTopic = `${devices[0].devEui}-out/1/${
          pattern.params.omaObjectId
        }/${pattern.params.sensorId}/5910`;
        //  await mqttClient.emit('publish', newTopic, img);
        return client.publish(newTopic, img);
      }
    }

    logger(4, 'mqtt-client', 'onMessage:res', {pattern});
    return null;
  } catch (error) {
    return error;
  }
});
