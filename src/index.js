import mqttPattern from 'mqtt-pattern';
import {aloesClientEncoder, aloesClientPatternDetector} from 'aloes-handlers';
import {
  aloesLightPatternDetector,
  aloesLightEncoder,
  aloesLightDecoder,
} from 'aloes-light-handlers';
import {
  //  cayennePatternDetector,
  cayenneEncoder,
  cayenneDecoder,
} from 'cayennelpp-handlers';
import {
  mySensorsDecoder,
  mySensorsEncoder,
  mySensorsPatternDetector,
} from 'mysensors-handlers';
import logger from 'aloes-logger';

/**
 * MQTT Pattern API
 * @external MQTT-pattern
 * @see {@link https://github.com/RangerMauve/mqtt-pattern}
 */

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
 * Retrieve routing pattern from MQTT packet.topic and supported IoT protocols
 * @static
 * @param {object} packet - The MQTT packet.
 * @returns {object} found pattern.name and pattern.params
 */
const patternDetector = packet => {
  try {
    if (packet.payload && packet.topic) {
      let pattern = {name: 'empty', params: {}};
      if (packet.topic.split('/')[0] === '$SYS') return null;
      logger(2, 'iot-agent', 'patternDetector:req', packet.topic);
      pattern = aloesClientPatternDetector(packet);
      if (!pattern || pattern === null || pattern.name === 'empty') {
        pattern = mySensorsPatternDetector(packet);
      }
      if (!pattern || pattern === null || pattern.name === 'empty') {
        pattern = aloesLightPatternDetector(packet);
      }
      // if (
      //   pattern.name === 'empty' &&
      //   typeof packet.payload === 'object' &&
      //   packet.payload instanceof Buffer
      // ) {
      //   //  pattern = cayennePatternDetector(packet);
      //   const parsedPayload = JSON.parse(packet.payload);
      //   let loraPacket;
      //   if (parsedPayload) {
      //     if (parsedPayload.packet) {
      //       loraPacket = Buffer.from(parsedPayload.packet, 'hex');
      //     } else if (parsedPayload.message) {
      //       if (
      //         parsedPayload.message.sensor &&
      //         parsedPayload.message.sensor.packet
      //       ) {
      //         loraPacket = Buffer.from(
      //           parsedPayload.message.sensor.packet,
      //           'hex',
      //         );
      //       } else if (
      //         parsedPayload.message.node &&
      //         parsedPayload.message.node.packet
      //       ) {
      //         loraPacket = Buffer.from(
      //           parsedPayload.message.node.packet,
      //           'hex',
      //         );
      //       }
      //     }
      //     if (!loraPacket) return pattern;
      //     pattern = cayennePatternDetector(loraPacket);
      //   }
      //   return pattern;
      // }
      logger(2, 'iot-agent', 'patternDetector:res', pattern.name);
      return pattern;
    }
    throw new Error('Missing payload or topic inside packet');
  } catch (error) {
    logger(2, 'iot-agent', 'patternDetector:err', error);
    return error;
  }
};

/**
 * Encode IoT native protocol incoming data to Aloes Client protocol
 *
 * @static
 * @param {object} packet - Incoming MQTT packet.
 * @param {object} protocol - Protocol paramters ( coming from patternDetector ).
 * @param {string} protocol.pattern - transportProtocol
 * @returns {object} composed instance
 */
const encode = (packet, protocol) => {
  try {
    logger(4, 'iot-agent', 'encode:req', protocol.name);
    let encoded;
    if (!protocol.name || protocol.name === null) {
      throw new Error('Missing params');
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
        if (typeof packet.payload === 'string') {
          encoded = JSON.parse(packet.payload);
        } else {
          encoded = packet.payload;
        }
        break;
      default:
        throw new Error('Unsupported protocol');
      //  encoded = 'Protocol not supported yet';
    }
    if (!encoded) throw new Error('No encoded message');
    logger(4, 'iot-agent', 'encode:res', encoded.type);
    return encoded;
  } catch (error) {
    logger(4, 'iot-agent', 'encode:err', error);
    return error;
  }
};

/**
 * Decode Aloes Client incoming data to native protocol
 *
 * @static
 * @param {object} packet - Incoming MQTT packet.
 * @param {object} protocol - Protocol paramters ( coming from patternDetector ).
 * @returns {object} packet - { topic, payload }
 */
const decode = (packet, protocol) => {
  try {
    logger(4, 'iot-agent', 'decode:req', protocol);
    if (!packet.payload || !protocol) {
      throw new Error('Missing params');
    }
    const instance = JSON.parse(packet.payload);
    const protocolKeys = Object.getOwnPropertyNames(protocol);
    //  logger(4, 'iot-agent', 'decode:req', protocolKeys.length);
    let decoded = {};
    if (protocolKeys.length >= 3 || protocolKeys.length <= 5) {
      logger(4, 'iot-agent', 'decode:req', instance.messageProtocol);
      switch (instance.messageProtocol.toLowerCase()) {
        case 'aloeslight':
          decoded = aloesLightEncoder(instance, protocol);
          break;
        case 'mysensors':
          decoded = mySensorsEncoder(instance, protocol);
          break;
        case 'cayennelpp':
          //  decoded = cayenneEncoder(instance, protocol);
          decoded.payload = instance;
          decoded.payload.packet = cayenneEncoder(instance).toString('hex');
          //  decoded.topic = `${protocol.appEui}/IoTAgent/${protocol.method}`;
          break;
        default:
        //  throw new Error('Unsupported protocol');
        //  decoded = 'Protocol not supported yet';
      }
      switch (instance.transportProtocol.toLowerCase()) {
        case 'lorawan':
          decoded.topic = `${protocol.appEui}/IoTAgent/${protocol.method}`;
          break;
        default:
          logger(
            4,
            'iot-agent',
            'decode:protocoltransport',
            instance.transportProtocol,
          );
      }
      if (!decoded) throw new Error('No decoded message');
      logger(4, 'iot-agent', 'decode:res', decoded.topic);
      return decoded;
    }
    throw new Error('Unsupported protocol');
  } catch (error) {
    logger(4, 'iot-agent', 'decode:err', error);
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
    throw new Error('Protocol not supported yet');
  }
  throw new Error('Option must be an object type');
};

/**
 * Check if validator contains all required properties
 * operation - value - field - field.startsWith("+") || field.startsWith("#")
 * @static
 * @param {object} rule - MQTT pattern validator.
 * @returns {boolean}
 */
const ruleIsValid = rule =>
  Object.prototype.hasOwnProperty.call(rule, 'operation') &&
  Object.prototype.hasOwnProperty.call(rule, 'value') &&
  Object.prototype.hasOwnProperty.call(rule, 'field') &&
  (rule.field.startsWith('+') || rule.field.startsWith('#'));

/**
 * Transform param value as rule.transformation method
 * @static
 * @param {string} transformation - JS method.
 * @param {any} param - MQTT pattern field detected.
 * @returns {any} - transformed param
 */
const transformProtocolKey = (transformation, param) => {
  try {
    logger(5, 'iot-agent', 'transformProtocolKey:req', {
      transformation,
      param,
    });
    switch (transformation) {
      case 'lowercase':
        if (typeof param === 'string') {
          param = param.toLowerCase();
        } else if (param instanceof Array) {
          param = param.map(key => key.toLowerCase());
        }
        break;
      case 'uppercase':
        if (typeof param === 'string') {
          param = param.toUpperCase();
        } else if (param instanceof Array) {
          param = param.map(key => key.toUpperCase());
        }
        break;
      default:
        throw new Error('Unknown transformation');
    }
    logger(4, 'iot-agent', 'transformProtocolKey:res', param);
    return param;
  } catch (error) {
    return false;
  }
};

/**
 * Apply operation(s) for each ruleValues and param corresponding to this field
 * @static
 * @param {string} operation - JS string/array operation to execute
 * @param {array} ruleValues - MQTT pattern validator rules separated by |.
 * @param {any} param - MQTT pattern field.
 * @returns {boolean}
 */
const validateProtocolKey = (operation, ruleValues, param) => {
  try {
    logger(4, 'iot-agent', 'validateProtocolKey:req', {
      operation,
      param,
      count: ruleValues.length,
    });

    let isValid = false;
    switch (operation) {
      // case 'typeof':
      //   if (ruleValues && ruleValues.length === 1) {
      //     isValid = typeof param === ruleValues[0].trim();
      //   } else if (ruleValues.length > 1) {
      //     isValid = ruleValues.some(val => typeof param === val.trim());
      //   }
      //   break;
      case 'startswith':
        if (ruleValues && ruleValues.length === 1) {
          isValid = param.startsWith(ruleValues[0].trim());
        } else if (ruleValues.length > 1) {
          if (typeof param === 'string') {
            isValid = ruleValues.some(val => param.startsWith(val.trim()));
          } else if (param instanceof Array) {
            isValid = ruleValues.some(val =>
              param.filter(par => par.startsWith(val.trim())),
            );
          }
        }
        break;
      case 'endswith':
        if (ruleValues && ruleValues.length === 1) {
          isValid = param.endsWith(ruleValues[0].trim());
        } else if (ruleValues.length > 1) {
          if (typeof param === 'string') {
            isValid = ruleValues.some(val => param.endsWith(val.trim()));
          } else if (param instanceof Array) {
            isValid = ruleValues.some(val =>
              param.filter(par => par.endsWith(val.trim())),
            );
          }
        }
        break;
      case 'equals':
        if (ruleValues && ruleValues.length === 1) {
          isValid = param === ruleValues[0].trim();
        } else if (ruleValues.length > 1) {
          if (typeof param === 'string') {
            isValid = ruleValues.some(val => param === val.trim());
          } else if (param instanceof Array) {
            isValid = ruleValues.some(val =>
              param.filter(par => par === val.trim()),
            );
          }
        }
        break;
      case 'includes':
        if (ruleValues && ruleValues.length === 1) {
          isValid = param.includes(ruleValues[0].trim());
        } else if (ruleValues.length > 1) {
          if (typeof param === 'string') {
            isValid = ruleValues.some(val => param.includes(val.trim()));
          } else if (param instanceof Array) {
            isValid = ruleValues.some(val =>
              param.filter(par => par.includes(val.trim())),
            );
          }
        }
        break;
      case 'length':
        if (ruleValues && ruleValues.length === 1) {
          isValid = Number(ruleValues[0].trim()) === param.length;
        } else if (ruleValues.length > 1) {
          if (typeof param === 'string') {
            isValid = ruleValues.some(
              val => Number(val.trim()) === param.length,
            );
          } else if (param instanceof Array) {
            isValid = ruleValues.some(val =>
              param.filter(par => Number(val.trim()) === par.length),
            );
          }
        }
        break;
      default:
        throw new Error('Unknown operation');
    }
    logger(4, 'iot-agent', 'validateProtocolKey:res', isValid);
    return isValid;
  } catch (error) {
    return false;
  }
};

/**
 * Compare received topic part with value(s) present into validators
 * @static
 * @param {object} externalApp - Application instance ( Formatted by Aloes backend )
 * @param {object} parsedProtocol - MQTT pattern parameters
 * @returns {object}
 */
const appPatternValidator = (externalApp, parsedProtocol) => {
  try {
    const patternValidators = {};
    const protocolKeys = Object.keys(parsedProtocol);
    logger(4, 'iot-agent', 'appPatternValidator:req', protocolKeys);
    protocolKeys.forEach(key => {
      if (externalApp.validators[key] && externalApp.validators[key] !== null) {
        const validator = externalApp.validators[key];
        validator.forEach(rule => {
          if (ruleIsValid(rule)) {
            if (rule.transformation && rule.transformation !== null) {
              parsedProtocol[key] = transformProtocolKey(
                rule.transformation.toLowerCase(),
                parsedProtocol[key],
              );
            }
            const ruleValues = rule.value.split('|');
            patternValidators[key] = validateProtocolKey(
              rule.operation.toLowerCase(),
              ruleValues,
              parsedProtocol[key],
            );
            return patternValidators[key];
          }
          return false;
        });
        return false;
      }
      return true;
    });
    logger(4, 'iot-agent', 'appPatternValidator:res', patternValidators);
    return patternValidators;
  } catch (error) {
    return error;
  }
};

/**
 * Verify each validator step result
 * @static
 * @param {object} validators - User defined validation steps executed on pattern fields.
 * @returns {boolean}
 */
const checkRulesAreValid = validators => {
  try {
    const successFields = [];
    const failFields = [];
    Object.keys(validators).forEach(field => {
      if (
        !validators[field] ||
        validators[field] === null ||
        validators[field] === false
      ) {
        return failFields.push(field);
      }
      return successFields.push(field);
    });
    if (successFields.length === Object.keys(validators).length) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Retrieve routing pattern from MQTT packet.topic and registered application
 * @static
 * @param {object} packet - The MQTT packet.
 * @param {object} packet.topic - MQTT topic.
 * @param {object} packet.payload - MQTT payload.
 * @param {object} externalApp - External Application instance ( from Aloes backend ).
 * @param {string} externalApp.name - External Application name.
 * @param {string} externalApp.pattern - External Application pattern  ( see mqtt pattern ).
 * @param {boolean} externalApp.status - Connection status
 * @param {object} externalApp.validators - User defined validation steps executed on pattern fields.
 * @returns {object} found pattern.name and pattern.params
 */
const appPatternDetector = (packet, externalApp) => {
  try {
    if (packet.payload && packet.topic) {
      const pattern = {name: 'empty', params: null};
      if (packet.topic.split('/')[0] === '$SYS') return null;
      logger(5, 'iot-agent', 'appPatternDetector:req', packet.topic);
      if (
        externalApp.pattern &&
        mqttPattern.matches(externalApp.pattern, packet.topic)
      ) {
        logger(
          5,
          'iot-agent',
          'appPatternDetector:req',
          `reading ${externalApp.name} API ...`,
        );
        const parsedProtocol = mqttPattern.exec(
          externalApp.pattern,
          packet.topic,
        );

        const patternValidators = appPatternValidator(
          externalApp,
          parsedProtocol,
        );
        //  console.log('patternValidators', patternValidators);
        const protocolIsValid = checkRulesAreValid(patternValidators);

        pattern.name = externalApp.name;
        pattern.value = externalApp.pattern;
        if (protocolIsValid) {
          pattern.params = parsedProtocol;
          pattern.params.transportProtocol = externalApp.transportProtocol;
          pattern.params.appEui = externalApp.appEui;
          logger(4, 'iot-agent', 'appPatternDetector:res', pattern);
          // todo : pass payload validators check
          return pattern;
        }
        return pattern;
      }
      return pattern;
    }
    throw new Error('Missing payload or topic inside packet');
  } catch (error) {
    logger(2, 'iot-agent', 'appPatternDetector:err', error);
    return error;
  }
};

module.exports = {
  patternDetector,
  publish,
  decode,
  encode,
  appPatternDetector,
  appPatternValidator,
};
