import {aloesClientEncoder, aloesClientPatternDetector} from 'aloes-handlers';
import {
  aloesLightPatternDetector,
  aloesLightEncoder,
  aloesLightDecoder,
} from 'aloes-light-handlers';
import {
  cayennePatternDetector,
  cayenneEncoder,
  cayenneDecoder,
} from 'cayennelpp-handlers';
import {
  mySensorsDecoder,
  mySensorsEncoder,
  mySensorsPatternDetector,
} from 'mysensors-handlers';
import {logger} from './logger';

/**
 * @module IoTAgent
 */
// const isEmpty = obj => {
//   const hasOwnProperty = Object.prototype.hasOwnProperty;
//   // null and undefined are "empty"
//   if (obj == null) return true;
//   if (obj.length > 0) return false;
//   if (obj.length === 0) return true;
//   for (let i = 0; i <= obj.length; i += 1) {
//     const key = obj[i];
//     if (hasOwnProperty.call(obj, key)) return false;
//   }
//   return true;
// };

/**
 * Retrieve routing pattern from MQTT packet.topic and supported protocols
 * @static
 * @param {object} packet - The MQTT packet.
 * @returns {object} found pattern.name and pattern.params
 */
const patternDetector = packet => {
  try {
    if (packet.payload && packet.topic) {
      let pattern = {name: 'empty', params: {}};
      if (packet.topic.split('/')[0] === '$SYS') return null;
      logger(2, 'handlers', 'patternDetector:req', packet.topic);
      pattern = aloesClientPatternDetector(packet);
      if (pattern.name === 'empty') {
        pattern = mySensorsPatternDetector(packet);
      }
      if (pattern.name === 'empty') {
        pattern = aloesLightPatternDetector(packet);
      }
      if (pattern.name === 'empty') {
        pattern = cayennePatternDetector(packet);
      }
      logger(2, 'handlers', 'patternDetector:res', pattern);
      return pattern;
    }
    return new Error('Error: Missing payload or topic inside packet');
  } catch (error) {
    logger(2, 'handlers', 'patternDetector:err', error);
    return error;
  }
};

/**
 * Decode Aloes Client incoming data to native protocol
 * pattern - "+prefixedDevEui/+nodeId/+sensorId/+method/+ack/+subType"
 * @static
 * @param {object} packet - Incoming MQTT packet.
 * @param {object} protocol - Protocol paramters ( coming from patternDetector ).
 * @returns {object} composed instance
 */
const decode = (packet, protocol) => {
  try {
    logger(4, 'handlers', 'decode:req', protocol);
    if (!packet.payload || !protocol) {
      return new Error('Error : No match found for topic');
    }
    const instance = JSON.parse(packet.payload);
    const protocolKeys = Object.getOwnPropertyNames(protocol);
    logger(4, 'handlers', 'decode:req', protocolKeys.length);
    if (protocolKeys.length === 3 || protocolKeys.length === 4) {
      let decoded;
      logger(4, 'handlers', 'decode:req', instance);
      switch (instance.messageProtocol.toLowerCase()) {
        case 'aloeslight':
          decoded = aloesLightEncoder(instance, protocol);
          break;
        case 'mysensors':
          decoded = mySensorsEncoder(instance, protocol);
          break;
        case 'cayennelpp':
          decoded = cayenneEncoder(instance, protocol);
          break;
        default:
          return new Error('Error : Unsupported protocol');
        //  decoded = 'Protocol not supported yet';
      }
      logger(4, 'handlers', 'decode:res', decoded);
      if (!decoded) return new Error('Error : no decoded message');
      return decoded;
    }
    return new Error('Error : No match found for topic');
  } catch (error) {
    logger(4, 'handlers', 'decode:err', error);
    throw error;
  }
};

/**
 * Encode IoT native protocol incoming data to Aloes Client protocol
 * pattern - "+prefixedDevEui/+nodeId/+sensorId/+method/+ack/+subType"
 * @static
 * @param {object} packet - Incoming MQTT packet.
 * @param {object} protocol - Protocol paramters ( coming from patternDetector ).
 * @param {string} protocol.pattern - transportProtocol
 * @returns {object} composed instance
 */
const encode = (packet, protocol) => {
  try {
    logger(4, 'handlers', 'encode:req', protocol);
    let encoded;
    if (!protocol.name || protocol.name === null) {
      return new Error('Error : No match found for topic');
    }
    switch (protocol.name.toLowerCase()) {
      case 'mysensors':
        encoded = mySensorsDecoder(packet, protocol.params);
        break;
      case 'aloeslight':
        encoded = aloesLightDecoder(packet, protocol.params);
        break;
      case 'cayennelpp':
        encoded = cayenneDecoder(packet, protocol.params);
        break;
      case 'aloesclient':
        encoded = JSON.parse(packet.payload);
        break;
      default:
        return new Error('Error : Unsupported protocol');
      //  encoded = 'Protocol not supported yet';
    }
    logger(4, 'handlers', 'encode:res', encoded);
    if (!encoded) return new Error('Error : no encoded message');
    return encoded;
  } catch (error) {
    logger(4, 'handlers', 'encode:err', error);
    return error;
  }
};
/**
 * Encode incoming supported protocol properties to defined transport protocol
 * @static
 * @param {object} options - data being the instance, pattern being the description of the source protocol
 * @param {string} options.pattern - transportProtocol
 * @param {any} options.data - packet.payload to publish
 * @returns {object} encoded MQTT packet, {topic, payload}
 */
const publish = options => {
  logger(4, 'handlers', 'publish:req', options);
  if (options && options.data && options.pattern) {
    if (options.pattern.toLowerCase() === 'mysensors') {
      return mySensorsEncoder(options.data, options);
    } else if (options.pattern.toLowerCase() === 'aloeslight') {
      return aloesLightEncoder(options.data, options);
    } else if (options.pattern.toLowerCase() === 'aloesclient') {
      return aloesClientEncoder(options);
    } else if (options.pattern.toLowerCase() === 'cayennelpp') {
      return cayenneEncoder(options);
    }
    return 'Protocol not supported yet';
  }
  return new Error('Error: Option must be an object type');
};

// const subscribe = (socket, options) => {
//   logger(4, 'handlers', 'subscribe:req', options);
//   if (options && !isEmpty(options)) {
//     let topic = null;
//     if (options.pattern.toLowerCase() === 'mysensors') {
//       topic = null;
//     } else if (options.pattern.toLowerCase() === 'aloesclient') {
//       const params = {
//         userId: options.userId,
//         collectionName: options.collectionName,
//         modelId: options.modelId,
//         method: options.method,
//       };
//       if (options.method === 'POST') {
//         topic = mqttPattern.fill(
//           protocolPatterns.aloesClient.collectionPattern,
//           params,
//         );
//       } else if (options.method === 'DELETE') {
//         topic = mqttPattern.fill(
//           protocolPatterns.aloesClient.collectionPattern,
//           params,
//         );
//       } else {
//         topic = mqttPattern.fill(
//           protocolPatterns.aloesClient.instancePattern,
//           params,
//         );
//       }
//     }
//     return topic;
//   }
//   return new Error('Error: Option must be an object type');
// };

module.exports = {
  patternDetector,
  publish,
  decode,
  encode,
};
