#!/usr/bin/env node

/*******************************************************************************
 * Publish BLE packets.
 *
 * On:
 *  - MQTT
 ******************************************************************************/

// Allow noble and bleno to co-exist. If this is not set, noble will block
// any master's ability to see services provided by a bleno app.
process.env.NOBLE_MULTI_ROLE = 1;

var BleGateway    = require('@nabeeln7/ble-gateway');
var GatewayTopics = require('gateway-topics');

var mqtt  = require('mqtt');
var debug = require('debug')('ble-gateway-mqtt');

var argv = require('yargs')
    .help('h')
    .alias('h', 'help')
    .strict()
    .argv;

/*******************************************************************************
 * CONFIGURATION OPTIONS
 ******************************************************************************/
var MQTT_TOPIC_NAME = 'gateway-data';
var MQTT_TOPIC_NAME_LOCAL = 'gateway-local';

/*******************************************************************************
 * MAIN CODE
 ******************************************************************************/

var mqtt_client = mqtt.connect('mqtt://localhost');

mqtt_client.on('connect', function () {
    debug('Connected to MQTT');

    // Start the gateway
    BleGateway.start();

    BleGateway.on('advertisement', function (adv_obj) {
        mqtt_client.publish(MQTT_TOPIC_NAME, JSON.stringify(adv_obj));

        // Also publish on /device
        GatewayTopics.publish(adv_obj);
    });

    BleGateway.on('local', function (local_obj) {
        mqtt_client.publish(MQTT_TOPIC_NAME_LOCAL + '/' + local_obj._meta.device_id, JSON.stringify(local_obj), {retain: true});
    });
});
