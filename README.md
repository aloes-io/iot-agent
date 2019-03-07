# Aloes - Handlers

- Encode / decode MQTT stream from IoT devices to Web browsers.
- Use [Open Mobile Alliance](http://www.openmobilealliance.org/wp/OMNA/LwM2M/LwM2MRegistry.html) standards as main target / source protocol.

[Full Docs](https://aloes.frama.io/aloes-handlers/)

Next :

- Octoprint HTTP / MQTT Connector
- Snip handler ?

---

## Installation

With npm :

```bash
$ npm install aloes-handlers --save
```

Via script tag :

```html
<script src="https://unpkg.com/aloes-handlers"></script>
```

## Linting

With ESLint

```bash
$ npm run lint
```

## Test

With Mocha

```bash
$ npm run test
```

## Generate documentation

With JSDoc and Vuepress

```bash
$ npm run docs:dev
```

```bash
$ npm run docs:build
$ npm run docs:serve
```

## Build

With Babel

```bash
$ npm run build-lib
```

## Example

_/ Still buggy /_

Simulating the use case where MQTT Broker is communicating with a browser and an example_device ( here a simulated camera ) :

- Native Browser and Broker format is AloesClient
  aloesClient_topic : `+userId/+collectionName/+method/#model`
  aloesClient_payload : `Object`

- Native example_device format is AloesLight
  aloesLight_topic : `+prefixedDevEui/+method/+omaObjectId/+sensorId/+omaResourceId`
  aloesLight_payload : `String`

- verifying which client is connecting and which accesses are granted

- detecting patterns from MQTT packet.topic & packet.payload

if `{aloesLight_topic}` detected ( received from example_device ), `{aloesLight_payload}` :

    -> decoding aloesLight
    -> sending `{aloesClient_payload}` to browser

if `{aloesClient_topic}` detected ( received from browser ), `{aloesClient_payload}` :

    -> encoding to aloesLight
    -> sending `{aloesLight_payload}` to example_device

- Run this example ( with mqtt.js cli or any other mqtt client ) to publish a camera capture request and subscribe to the stream response.

```bash
$ npm run example
```

Example receiving a camera capture :

- by mocking a device MQTT subscription ({aloesLight_topic})

```bash

$ mqtt sub -t '2894413-out/1/3349/#' -h 'localhost' -p 1883 -u '5c2657ad36bb1052f87cf417' -P 'ACSk0JG16GGBudI1CW4fYIYeVsUGTFOpyXxTckamKdznED1CGEBcYLLm7SrCNo6g'
```

- by mocking a browser MQTT subscription ({aloesClient_topic} )

```bash
$ mqtt sub -t '5c24e1514a603a651d1ddfd5/Sensor/POST' -h 'localhost' -p 1883 -u '5c24e1514a603a651d1ddfd5' -P 'DregdyAV9eE5WLQtUl82mVh6uzcYSsJjXx0Kf8TcXB7SSYRpysEJ1OfPuWUlNiyZ'
```

Example requesting a camera capture :

- by mocking a device MQTT packet ({aloesLight_topic}{aloesLight_payload})

```bash
$ mqtt pub -t '2894413-in/1/3349/2/5911' -h 'localhost' -p 1883 -m "1" -u '5c2657ad36bb1052f87cf417' -P 'ACSk0JG16GGBudI1CW4fYIYeVsUGTFOpyXxTckamKdznED1CGEBcYLLm7SrCNo6g'
```

- by mocking a browser MQTT packet ({aloesClient_topic}{aloesClient_payload} )

```bash
$ mqtt pub -t '5c24e1514a603a651d1ddfd5/Sensor/POST' -h 'localhost' -p 1883 -m '{"id": "5c62c4de3c6d59223afdf891","name": "Bitmap", "type": 3349, "devEui": "2894413", "resources": { "5750": "app-name", "5910": null, "5911": true, "5912": "" }, "value": true, "resource": 5911, "frameCounter": 248, "transportProtocol": "aloesLight", "messageProtocol": "aloesLight", "protocolVersion": "", "nativeSensorId": "2", "nativeNodeId": "", "nativeType": 3349, "nativeResource": 5910, "accountId": "5c24e1514a603a651d1ddfd5", "deviceId": "5c2657ad36bb1052f87cf417", "inPrefix": "-in", "outPrefix": "-out"}' -u '5c24e1514a603a651d1ddfd5' -P 'DregdyAV9eE5WLQtUl82mVh6uzcYSsJjXx0Kf8TcXB7SSYRpysEJ1OfPuWUlNiyZ'

```
