/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */

import mqtt from 'async-mqtt';
import EventEmitter from 'events';
import {updateAloesSensors} from 'aloes-handlers';
import {logger} from '../src/logger';
import {patternDetector} from '../src/index';
import {accounts, sensors} from './initial-data';

// Mocking a web browser working on AloesClient protocol
// '+userId/+collectionName/+method',

export const wsClient = new EventEmitter();
let client;

wsClient.on('init', config => {
  logger(3, 'ws-client', 'init', config.wsClient);
  client = mqtt.connect(config.wsBrokerUrl, config.wsClient);

  client.on('error', err => {
    wsClient.emit('error', err);
  });

  client.on('connect', async state => {
    wsClient.emit('status', state);
    wsClient.user = client._client.options.username;
    if (client && wsClient.user) {
      await client.subscribe(`${wsClient.user}/Sensor/#`);
      await client.subscribe(`${wsClient.user}/Device/#`);
    }
    return null;
  });

  client.on('disconnect', state => {
    delete wsClient.user;
    wsClient.emit('status', state);
  });

  client.on('message', (topic, message) => {
    try {
      // if (!wsClient.user) {
      //   return new Error('Error: Invalid mqtt client');
      // }
      return wsClient.emit('message', topic, message);
    } catch (error) {
      logger(4, 'ws-client', 'publish:err', error);
      return error;
    }
  });
});

wsClient.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message);
    const packet = {topic, payload};

    const pattern = await patternDetector(packet);
    logger(4, 'ws-client', 'onMessage:req', {pattern});

    if (!pattern) return null;
    if (
      pattern.name === 'aloesClient' &&
      pattern.params.method === 'POST' &&
      pattern.params.userId === accounts[0].id.toString() &&
      pattern.params.collectionName === 'Sensor' &&
      payload
    ) {
      if (payload.resource === 5911 && payload.value) {
        //  update instance and send it to broker`,
        const updatedSensor = await updateAloesSensors(
          sensors[1],
          Number(payload.resource),
          payload.value,
        );

        const newTopic = `${updatedSensor.devEui}-in/1/${updatedSensor.type}/${
          updatedSensor.nativeSensorId
        }/5911`;

        if (newTopic && updatedSensor && updatedSensor !== null) {
          // await wsClient.emit('publish', newTopic, updatedSensor);
          return client.publish(newTopic, payload.value.toString());
        }
      }
    }

    logger(4, 'ws-client', 'onMessage:res', {pattern});
    return null;
  } catch (error) {
    return error;
  }
});
