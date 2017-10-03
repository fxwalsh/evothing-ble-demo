var bleno = require('bleno');
var util = require('util');

var TempCharacteristic = require('./characteristics/temp');

function TempService() {

  bleno.PrimaryService.call(this, {
    uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb07',
    characteristics: [
      new TempCharacteristic()
    ]
  });
};

util.inherits(TempService, bleno.PrimaryService);
module.exports = TempService;
