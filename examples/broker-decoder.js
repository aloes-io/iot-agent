/* eslint-disable import/no-extraneous-dependencies */
import mosca from 'mosca';
import EventEmitter from 'events';
import {aloesLightEncoder, aloesLightDecoder} from 'aloes-light-handlers';
import {patternDetector, aloesClientEncoder} from '../src/index';
import {AccessTokens, accounts, devices, sensors} from './initial-data';
import {logger} from '../src/logger';

export const mqttBroker = new EventEmitter();
let moscaBroker;

mqttBroker.on('init', config => {
  moscaBroker = new mosca.Server(config.mqttBroker);

  const authenticate = (client, username, password, cb) => {
    logger(4, 'broker', 'Authenticate:req', {
      client: client.id,
      username,
      password: password.toString(),
    });
    try {
      let auth = false;
      if (!password || !username) {
        client.user = 'guest';
        auth = true;
        cb(null, auth);
        return auth;
      }
      const accessToken = AccessTokens.find(
        token => token.id === password.toString(),
      );
      if (!accessToken || accessToken === null) {
        auth = false;
        logger(4, 'mqtt-broker', 'Authenticate:res', {username, auth});
        cb(null, auth);
        return auth;
      }
      if (
        accessToken &&
        accessToken.userId &&
        accessToken.userId.toString() === username
      ) {
        auth = true;
        client.user = username;
        if (accessToken.devEui) {
          client.devEui = accessToken.devEui;
        }
      }

      logger(4, 'mqtt-broker', 'Authenticate:res', {username, auth});
      moscaBroker.publish({
        topic: `${accessToken.userId}/Auth/POST`,
        payload: auth.toString(),
        retain: false,
        qos: 1,
      });
      cb(null, auth);
      return auth;
    } catch (error) {
      logger(4, 'mqtt-broker', 'Authenticate:err', error);
      cb(null, false);
      return false;
    }
  };

  const authorizePublish = (client, topic, payload, cb) => {
    const topicParts = topic.split('/');
    let auth = false;
    if (client.user) {
      if (topicParts[0].startsWith(client.user)) {
        logger(4, 'mqtt-broker', 'authorizePublish:req', {
          account: client.user,
        });
        auth = true;
      }
      if (topicParts[0].startsWith(client.devEui)) {
        logger(4, 'mqtt-broker', 'authorizePublish:req', {
          device: client.devEui,
        });
        auth = true;
      }
    }
    logger(3, 'mqtt-broker', 'authorizePublish:res', {topic, auth});
    cb(null, auth);
  };

  const authorizeSubscribe = (client, topic, cb) => {
    const topicParts = topic.split('/');
    let auth = false;

    if (client.user) {
      if (topicParts[0].startsWith(client.user)) {
        logger(4, 'mqtt-broker', 'authorizeSubscribe:req', {
          account: client.user,
        });
        auth = true;
      }
      if (topicParts[0].startsWith(client.devEui)) {
        logger(4, 'mqtt-broker', 'authorizePublish:req', {
          device: client.devEui,
        });
        auth = true;
      }
    }
    logger(3, 'mqtt-broker', 'authorizeSubscribe:res', {topic, auth});
    cb(null, auth);
  };

  function setup() {
    moscaBroker.authenticate = authenticate;
    moscaBroker.authorizePublish = authorizePublish;
    moscaBroker.authorizeSubscribe = authorizeSubscribe;
    mqttBroker.emit('ready');
    logger(
      2,
      'mqtt-broker',
      'Setup',
      `Mosca broker ready, up and running @: ${config.mqttBrokerUrl}`,
    );
  }

  moscaBroker.on('ready', setup);

  moscaBroker.on('clientConnected', async client => {
    logger(4, 'mqtt-broker', 'clientConnected:req', client.id);
    if (client.user) {
      if (client.devEui) {
        const device = await devices.find(
          instance => instance.id.toString() === client.user,
        );
        if (device && device !== null) {
          device.status = true;
        }
      }
    }
    return null;
  });

  moscaBroker.on('clientDisconnected', async client => {
    logger(4, 'mqtt-broker', 'clientDisconnected:req', client.id);
    if (client.user) {
      if (client.devEui) {
        const device = await devices.find(
          instance => instance.id.toString() === client.user,
        );
        if (device && device !== null) {
          device.frameCounter = 0;
          device.status = false;
        }
      }
    }
    return null;
  });

  moscaBroker.on('published', async (packet, client) => {
    try {
      if (!client || !client.user) return null;
      await mqttBroker.emit('published', packet);
      return null;
    } catch (error) {
      logger(2, 'mqtt-broker', 'onPublish:err', error);
      return error;
    }
  });
});

mqttBroker.on('published', async packet => {
  const pattern = await patternDetector(packet);
  if (!pattern || pattern === null || pattern.name === 'empty') {
    return 'no pattern found';
  }
  packet.payload = JSON.parse(packet.payload);
  logger(2, 'mqtt-broker', 'onPublish:req', pattern);

  // example

  if (
    pattern.name === 'aloesClient' &&
    pattern.params.method === 'POST' &&
    pattern.params.userId === accounts[0].id.toString() &&
    pattern.params.collectionName === 'Sensor'
  ) {
    if (packet.payload.resource === 5911 && packet.payload.value) {
      // send a message to the device
      // const updatedSensor = await updateAloesSensors(
      //   payload,
      //   Number(payload.resource),
      //   payload.value,
      // );
      const encoded = await aloesLightEncoder(packet.payload, pattern.params);

      if (encoded.topic && encoded.payload) {
        return moscaBroker.publish({
          topic: encoded.topic,
          payload: encoded.payload,
          retain: false,
          qos: 1,
        });
      }
    }
  } else if (
    pattern.name === 'aloesLight' &&
    pattern.params.method === '1' &&
    pattern.params.omaObjectId === '3349' &&
    pattern.params.omaResourceId === '5911' &&
    pattern.params.sensorId === '2'
  ) {
    // send a message to the device
    return moscaBroker.publish({
      topic: packet.topic,
      payload: packet.payload,
      retain: false,
      qos: 1,
    });
  } else if (
    pattern.name === 'aloesLight' &&
    pattern.params.method === '1' &&
    pattern.params.omaObjectId === '3349' &&
    pattern.params.omaResourceId === '5910' &&
    pattern.params.sensorId === '2'
  ) {
    const decoded = await aloesLightDecoder(packet.payload, pattern.params);

    if (decoded.type && decoded.devEui) {
      //  mqttBroker.emit('decoded', packet.topic, decoded);
      const options = {
        pattern: 'aloesClient',
        userId: accounts[0].id,
        collectionName: 'Sensor',
        modelId: sensors[1].id,
        method: 'PUT',
        data: {...sensors[1], ...decoded},
      };
      const encoded = await aloesClientEncoder(options);

      logger(2, 'mqtt-broker', 'onPublish:req2', encoded.topic);

      if (encoded.topic && encoded.payload) {
        //  mqttBroker.emit('encoded', encoded.topic, encoded.payload);

        return moscaBroker.publish({
          topic: encoded.topic,
          payload: encoded.payload,
          retain: false,
          qos: 1,
        });
      }
    }
  }
  logger(2, 'mqtt-broker', 'onPublish:res1', {
    pattern,
    packet,
  });
  return {pattern, packet};
});
