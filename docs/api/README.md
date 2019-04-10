## Modules

<dl>
<dt><a href="#module_IoTAgent">IoTAgent</a></dt>
<dd></dd>
<dt><a href="#module_logger">logger</a></dt>
<dd></dd>
</dl>

## External

<dl>
<dt><a href="#external_MQTT-pattern">MQTT-pattern</a></dt>
<dd><p>MQTT Pattern API</p>
</dd>
</dl>

<a name="module_IoTAgent"></a>

## IoTAgent

* [IoTAgent](#module_IoTAgent)
    * [.patternDetector(packet)](#module_IoTAgent.patternDetector) ⇒ <code>object</code>
    * [.encode(packet, protocol)](#module_IoTAgent.encode) ⇒ <code>object</code>
    * [.decode(packet, protocol)](#module_IoTAgent.decode) ⇒ <code>object</code>
    * [.publish(options)](#module_IoTAgent.publish) ⇒ <code>object</code>
    * [.ruleIsValid(rule)](#module_IoTAgent.ruleIsValid) ⇒ <code>boolean</code>
    * [.transformProtocolKey(transformation, param)](#module_IoTAgent.transformProtocolKey) ⇒ <code>any</code>
    * [.validateProtocolKey(operation, ruleValues, param)](#module_IoTAgent.validateProtocolKey) ⇒ <code>boolean</code>
    * [.appPatternValidator(externalApp, parsedProtocol)](#module_IoTAgent.appPatternValidator) ⇒ <code>object</code>
    * [.checkRulesAreValid(validators)](#module_IoTAgent.checkRulesAreValid) ⇒ <code>boolean</code>
    * [.appPatternDetector(packet, externalApp)](#module_IoTAgent.appPatternDetector) ⇒ <code>object</code>

<a name="module_IoTAgent.patternDetector"></a>

### IoTAgent.patternDetector(packet) ⇒ <code>object</code>
Retrieve routing pattern from MQTT packet.topic and supported IoT protocols

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  
**Returns**: <code>object</code> - found pattern.name and pattern.params  

| Param | Type | Description |
| --- | --- | --- |
| packet | <code>object</code> | The MQTT packet. |

<a name="module_IoTAgent.encode"></a>

### IoTAgent.encode(packet, protocol) ⇒ <code>object</code>
Encode IoT native protocol incoming data to Aloes Client protocol

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  
**Returns**: <code>object</code> - composed instance  

| Param | Type | Description |
| --- | --- | --- |
| packet | <code>object</code> | Incoming MQTT packet. |
| protocol | <code>object</code> | Protocol paramters ( coming from patternDetector ). |
| protocol.pattern | <code>string</code> | transportProtocol |

<a name="module_IoTAgent.decode"></a>

### IoTAgent.decode(packet, protocol) ⇒ <code>object</code>
Decode Aloes Client incoming data to native protocol

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  
**Returns**: <code>object</code> - packet - { topic, payload }  

| Param | Type | Description |
| --- | --- | --- |
| packet | <code>object</code> | Incoming MQTT packet. |
| protocol | <code>object</code> | Protocol paramters ( coming from patternDetector ). |

<a name="module_IoTAgent.publish"></a>

### IoTAgent.publish(options) ⇒ <code>object</code>
Encode incoming supported protocol properties to defined transport protocol

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  
**Returns**: <code>object</code> - encoded MQTT packet, {topic, payload}  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | data being the instance, pattern being the description of the source protocol |
| options.pattern | <code>string</code> | transportProtocol |
| options.data | <code>any</code> | packet.payload to publish |

<a name="module_IoTAgent.ruleIsValid"></a>

### IoTAgent.ruleIsValid(rule) ⇒ <code>boolean</code>
Check if validator contains all required properties
operation - value - field - field.startsWith("+") || field.startsWith("#")

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  

| Param | Type | Description |
| --- | --- | --- |
| rule | <code>object</code> | MQTT pattern validator. |

<a name="module_IoTAgent.transformProtocolKey"></a>

### IoTAgent.transformProtocolKey(transformation, param) ⇒ <code>any</code>
Transform param value as rule.transformation method

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  
**Returns**: <code>any</code> - - transformed param  

| Param | Type | Description |
| --- | --- | --- |
| transformation | <code>string</code> | JS method. |
| param | <code>any</code> | MQTT pattern field detected. |

<a name="module_IoTAgent.validateProtocolKey"></a>

### IoTAgent.validateProtocolKey(operation, ruleValues, param) ⇒ <code>boolean</code>
Apply operation(s) for each ruleValues and param corresponding to this field

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  

| Param | Type | Description |
| --- | --- | --- |
| operation | <code>string</code> | JS string/array operation to execute |
| ruleValues | <code>array</code> | MQTT pattern validator rules separated by |. |
| param | <code>any</code> | MQTT pattern field. |

<a name="module_IoTAgent.appPatternValidator"></a>

### IoTAgent.appPatternValidator(externalApp, parsedProtocol) ⇒ <code>object</code>
Compare received topic part with value(s) present into validators

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  

| Param | Type | Description |
| --- | --- | --- |
| externalApp | <code>object</code> | Application instance ( Formatted by Aloes backend ) |
| parsedProtocol | <code>object</code> | MQTT pattern parameters |

<a name="module_IoTAgent.checkRulesAreValid"></a>

### IoTAgent.checkRulesAreValid(validators) ⇒ <code>boolean</code>
Verify each validator step result

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  

| Param | Type | Description |
| --- | --- | --- |
| validators | <code>object</code> | User defined validation steps executed on pattern fields. |

<a name="module_IoTAgent.appPatternDetector"></a>

### IoTAgent.appPatternDetector(packet, externalApp) ⇒ <code>object</code>
Retrieve routing pattern from MQTT packet.topic and registered application

**Kind**: static method of [<code>IoTAgent</code>](#module_IoTAgent)  
**Returns**: <code>object</code> - found pattern.name and pattern.params  

| Param | Type | Description |
| --- | --- | --- |
| packet | <code>object</code> | The MQTT packet. |
| packet.topic | <code>object</code> | MQTT topic. |
| packet.payload | <code>object</code> | MQTT payload. |
| externalApp | <code>object</code> | External Application instance ( from Aloes backend ). |
| externalApp.name | <code>string</code> | External Application name. |
| externalApp.pattern | <code>string</code> | External Application pattern  ( see mqtt pattern ). |
| externalApp.status | <code>boolean</code> | Connection status |
| externalApp.validators | <code>object</code> | User defined validation steps executed on pattern fields. |

<a name="module_logger"></a>

## logger

| Param | Type | Description |
| --- | --- | --- |
| priority | <code>int</code> | Logger mode. |
| collectionName | <code>string</code> | service name. |
| command | <code>string</code> | service command to log. |
| content | <code>string</code> | log content. |

<a name="external_MQTT-pattern"></a>

## MQTT-pattern
MQTT Pattern API

**Kind**: global external  
**See**: [https://github.com/RangerMauve/mqtt-pattern](https://github.com/RangerMauve/mqtt-pattern)  
