/* Copyright 2019 Edouard Maleix, read LICENSE */

const aedes = require('aedes');
const net = require('net');
const http = require('http');
const ws = require('websocket-stream');
const EventEmitter = require('events');
const {aloesLightEncoder, aloesLightDecoder} = require('aloes-light-handlers');
const {aloesClientEncoder} = require('aloes-handlers');
const logger = require('aloes-logger');
const {patternDetector} = require('../src/index');
const {AccessTokens, accounts, devices, sensors} = require('./initial-data');

let aedesBroker;

const mqttBroker = new EventEmitter();
module.exports = mqttBroker;

mqttBroker.on('init', config => {
  aedesBroker = new aedes.Server({
    concurrency: 100,
    heartbeatInterval: 60000,
    connectTimeout: 30000,
  });
  logger(2, 'broker', 'Init', config);

  const netServer = net.createServer(aedesBroker.handle);
  netServer.listen(config.mqttBroker.interfaces[0].port, () => {
    logger(
      2,
      'broker',
      'Setup',
      `MQTT broker ready, up and running @: ${
        config.mqttBroker.interfaces[0].port
      }`,
    );
  });

  const httpServer = http
    .createServer((req, res) => {
      res.write('Hello World!');
      res.end();
    })
    .listen(config.mqttBroker.interfaces[1].port);

  logger(
    2,
    'broker',
    'Setup',
    `HTTP server ready, up and running @: ${
      config.mqttBroker.interfaces[1].port
    }`,
  );
  ws.createServer(
    {
      server: httpServer,
    },
    aedesBroker.handle,
  );

  aedesBroker.authenticate = (client, username, password, cb) => {
    logger(4, 'broker', 'Authenticate:req', {
      client: client.id,
      username,
    });
    try {
      let auth = false;
      if (!password || password === null || !username || username === null) {
        const error = new Error('Auth error');
        error.returnCode = 4;
        logger.publish(4, 'broker', 'Authenticate:res', 'missing credentials');
        auth = false;
        return cb(error, auth);
      }
      const accessToken = AccessTokens.find(
        token => token.id === password.toString(),
      );
      if (!accessToken || accessToken === null) {
        const error = new Error('Auth error');
        error.returnCode = 2;
        logger(4, 'broker', 'Authenticate:res', 'invalid token');
        auth = false;
        return cb(error, auth);
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
      // aedesBroker.publish({
      //   topic: `${accessToken.userId}/Auth/POST`,
      //   payload: auth.toString(),
      //   retain: false,
      //   qos: 1,
      // });
      cb(null, auth);
      return auth;
    } catch (error) {
      logger(4, 'mqtt-broker', 'Authenticate:err', error);
      return cb(null, false);
    }
  };

  aedesBroker.authorizePublish = (client, packet, cb) => {
    try {
      const topic = packet.topic;
      const topicParts = topic.split('/');
      // allow max access with valid tls cert config
      let auth = false;
      if (client.user) {
        if (topicParts[0].startsWith(client.user)) {
          logger(3, 'broker', 'authorizePublish:req', {
            user: client.user,
            topic: topicParts,
          });
          auth = true;
        } else if (client.devEui && topicParts[0].startsWith(client.devEui)) {
          // todo limit access to device out prefix if any - / endsWith(device.outPrefix)
          logger(3, 'broker', 'authorizePublish:req', {
            device: client.devEui,
            topic: topicParts,
          });
          auth = true;
        } else if (client.appId && topicParts[0].startsWith(client.appId)) {
          logger(3, 'broker', 'authorizePublish:req', {
            application: client.appId,
            topic: topicParts,
          });
          auth = true;
        } else if (client.appEui && topicParts[0].startsWith(client.appEui)) {
          logger(3, 'broker', 'authorizePublish:req', {
            application: client.appEui,
            topic: topicParts,
          });
          auth = true;
        }
        // if (client.admin) auth = true
      }
      if (auth === false) {
        const error = new Error('authorizePublish error');
        error.returnCode = 3;
        return cb(error);
      }
      logger(3, 'broker', 'authorizePublish:res', {topic, auth});
      return cb(null);
    } catch (error) {
      cb(error, null);
      return null;
    }
  };

  aedesBroker.authorizeSubscribe = (client, sub, cb) => {
    try {
      const topic = sub.topic;
      const topicParts = topic.split('/');
      let auth = false;
      // todo leave minimum access with apikey
      // allow max access with valid tls cert config
      if (client.user) {
        if (topicParts[0].startsWith(client.user)) {
          logger(3, 'broker', 'authorizeSubscribe:req', {
            user: client.user,
          });
          auth = true;
        } else if (client.devEui && topicParts[0].startsWith(client.devEui)) {
          // todo limit access to device in prefix if any
          logger(3, 'broker', 'authorizeSubscribe:req', {
            device: client.devEui,
          });
          auth = true;
        } else if (client.devAddr && topicParts[0].startsWith(client.devAddr)) {
          // todo limit access to device in prefix if any - endsWith(device.inPrefix)
          logger(3, 'broker', 'authorizeSubscribe:req', {
            device: client.devAddr,
          });
          auth = true;
        } else if (client.appId && topicParts[0].startsWith(client.appId)) {
          logger(3, 'broker', 'authorizeSubscribe:req', {
            application: client.appId,
            topic: topicParts,
          });
          auth = true;
        } else if (client.appEui && topicParts[0].startsWith(client.appEui)) {
          logger(3, 'broker', 'authorizeSubscribe:req', {
            application: client.appEui,
          });
          auth = true;
          //  sub.qos = sub.qos + 2
        }
      }
      if (auth === false) {
        const error = new Error('authorizeSubscribe error');
        //  error.returnCode = 3;
        return cb(error, null);
      }
      logger(3, 'broker', 'authorizeSubscribe:res', {topic, auth});
      return cb(null, sub);
    } catch (error) {
      cb(error, null);
      return null;
    }
  };

  aedesBroker.on('client', async client => {
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

  aedesBroker.on('clientDisconnect', async client => {
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

  aedesBroker.on('publish', async (packet, client) => {
    try {
      if (!client || !client.user) return null;
      await mqttBroker.emit('published', packet, client);
      return null;
    } catch (error) {
      logger(2, 'mqtt-broker', 'onPublish:err', error);
      return null;
    }
  });

  mqttBroker.emit('ready');
});

mqttBroker.on('publish', async packet => {
  try {
    if (typeof packet.payload === 'boolean') {
      packet.payload = packet.payload.toString();
    } else if (typeof payload === 'number') {
      packet.payload = packet.payload.toString();
    } else if (typeof packet.payload === 'object') {
      //  console.log('publish buffer ?', payload instanceof Buffer);
      packet.payload = JSON.stringify(packet.payload);
    }
    logger(3, 'mqtt-broker', 'publish:res', packet);
    return aedesBroker.publish(packet);
  } catch (error) {
    logger(2, 'mqtt-broker', 'publish:err', error);
    return null;
  }
});

mqttBroker.on('published', async packet => {
  const pattern = await patternDetector(packet);
  if (!pattern || pattern === null || pattern.name === 'empty') {
    return 'no pattern found';
  }
  logger(2, 'mqtt-broker', 'onPublish:req', {pattern, payload: packet.payload});

  // example

  if (
    pattern.name.toLowerCase() === 'aloesclient' &&
    (pattern.params.method === 'POST' || pattern.params.method === 'PUT') &&
    pattern.params.userId === accounts[0].id.toString() &&
    pattern.params.collection === 'Sensor'
  ) {
    const payload = JSON.parse(packet.payload.toString());
    if (payload.resource === 5911 && payload.resources['5911']) {
      logger(2, 'mqtt-broker', 'image request from client', payload);

      // send a message to the device
      // const updatedSensor = await updateAloesSensors(
      //   payload,
      //   Number(payload.resource),
      //   payload.value,
      // );
      const encoded = await aloesLightEncoder(payload, pattern.params);

      if (encoded.topic && encoded.payload) {
        return mqttBroker.emit('publish', {
          topic: encoded.topic,
          payload: encoded.payload,
          retain: false,
          qos: 0,
        });
      }
    }
  } else if (
    pattern.name.toLowerCase() === 'aloeslight' &&
    pattern.params.method === '1' &&
    pattern.params.omaObjectId === '3349' &&
    pattern.params.omaResourceId === '5910' &&
    pattern.params.sensorId === '2'
  ) {
    const decoded = await aloesLightDecoder(packet.payload, pattern.params);
    logger(2, 'mqtt-broker', 'image received from device', decoded);

    if (decoded.type && decoded.devEui) {
      const options = {
        pattern: 'aloesClient',
        userId: accounts[0].id,
        collection: 'Sensor',
        modelId: sensors[1].id,
        method: 'PUT',
        data: {...sensors[1], ...decoded},
      };
      const encoded = await aloesClientEncoder(options);

      logger(2, 'mqtt-broker', 'onPublish:req2', encoded.payload);

      if (encoded.topic && encoded.payload) {
        return mqttBroker.emit('publish', {
          topic: encoded.topic,
          payload: encoded.payload,
          retain: false,
          qos: 0,
        });
      }
    }
  }
  logger(2, 'mqtt-broker', 'onPublish:res', {
    pattern,
    packet,
  });
  return {pattern, packet};
});
