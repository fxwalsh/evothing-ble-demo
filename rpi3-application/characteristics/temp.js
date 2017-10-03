var bleno = require('bleno');
var os = require('os');
var util = require('util');

var BlenoCharacteristic = bleno.Characteristic;

var TempCharacteristic = function() {

 TempCharacteristic.super_.call(this, {
    uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb99',
    properties: ['read'],
  });

 this._value = new Buffer(0);
};

TempCharacteristic.prototype.onReadRequest = function(offset, callback) {

  if(!offset) {

    this._value = new Buffer(JSON.stringify({
      'temp' : randomInt(15,25)
    }));
  }

  console.log('TempCharacteristic - onReadRequest: value = ' +
    this._value.slice(offset, offset + bleno.mtu).toString()
  );

  callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
};

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

util.inherits(TempCharacteristic, BlenoCharacteristic);
module.exports = TempCharacteristic;
