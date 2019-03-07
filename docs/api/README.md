## Modules

<dl>
<dt><a href="#module_IoTAgent">IoTAgent</a></dt>
<dd></dd>
<dt><a href="#module_logger">logger</a></dt>
<dd></dd>
</dl>

<a name="module_IoTAgent"></a>

## IoTAgent

* [IoTAgent](#module_IoTAgent)
    * [.patternDetector(packet)](#module_IoTAgent.patternDetector) ⇒ <code>object</code>
    * [.decode(packet, protocol)](#module_IoTAgent.decode) ⇒ <code>object</code>
    * [.publish(options)](#module_IoTAgent.publish) ⇒ <code>object</code>

<a name="module_IoTAgent.patternDetector"></a>

### IoTAgent.patternDetector(packet) ⇒ <code>object</code>
Retrieve routing pattern from MQTT packet.topic and supported protocols

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  
**Returns**: <code>object</code> - found pattern.name and pattern.params  

| Param | Type | Description |
| --- | --- | --- |
| packet | <code>object</code> | The MQTT packet. |

<a name="module_IoTAgent.decode"></a>

### IoTAgent.decode(packet, protocol) ⇒ <code>object</code>
Decode incoming data to Aloes Client
pattern - "+prefixedDevEui/+nodeId/+sensorId/+method/+ack/+subType"

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  
**Returns**: <code>object</code> - composed instance  

| Param | Type | Description |
| --- | --- | --- |
| packet | <code>object</code> | Incoming MQTT packet. |
| protocol | <code>object</code> | Protocol paramters ( coming from patternDetector ). |

<a name="module_IoTAgent.publish"></a>

### IoTAgent.publish(options) ⇒ <code>object</code>
Encode incoming supported protocol properties

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  
**Returns**: <code>object</code> - encoded MQTT route  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | .data being the instance, pattern being the description of the source protocol |

<a name="module_logger"></a>

## logger

| Param | Type | Description |
| --- | --- | --- |
| priority | <code>int</code> | Logger mode. |
| collectionName | <code>string</code> | service name. |
| command | <code>string</code> | service command to log. |
| content | <code>string</code> | log content. |

