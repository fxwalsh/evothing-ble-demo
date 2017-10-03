//
// Copyright 2016, Evothings AB
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Raspberry Pi 3 - System Information
// version: 0.1 - 2016-04-04
//

document.addEventListener(
	'deviceready',
	function() { evothings.scriptsLoaded(app.initialize) },
	false);

var app = {};

app.SYSTEMINFORMATIONSERVICE = 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb07';

app.CHARACTERISTICS = {
	'ff51b30e-d7e2-4d93-8842-a7c4a57dfb99' : printTemp
						};


app.initialize = function() {

	app.connected = false;
};

app.startScan = function() {

	app.disconnect();

	console.log('Scanning started..');

	app.devices = {};

	var htmlString =
		'<img src="img/loader_small.gif" style="display:inline; vertical-align:middle">' +
		'<p style="display:inline">   Scanning...</p>';

	$('#scanResultView').append($(htmlString));

	$('#scanResultView').show();

	function onScanSuccess(device) {

		if (device.name != null) {

			app.devices[device.address] = device;

			console.log('Found: ' + device.name + ', ' + device.address + ', ' + device.rssi);

			var htmlString =
				'<div class="deviceContainer" onclick="app.connectTo(\'' +
					device.address + '\')">' +
				'<p class="deviceName">' + device.name + '</p>' +
				'<p class="deviceAddress">' + device.address + '</p>' +
				'</div>';

			$('#scanResultView').append($(htmlString));
		}
	};

	function onScanFailure(errorCode) {

		// Show an error message to the user
		app.disconnect('Failed to scan for devices.');

		// Write debug information to console.
		console.log('Error ' + errorCode);
	};

	evothings.easyble.reportDeviceOnce(true);
	evothings.easyble.startScan(onScanSuccess, onScanFailure);

	$('#startView').hide();
};

app.receivedMessage = function(data) {

	if (app.connected) {

		// Convert data to String
		var message = String.fromCharCode.apply(null, new Uint8Array(data));

		// Update conversation
		app.updateConversation(message, true);

		console.log('Message received: ' + message);
	}
	else {

		// Disconnect and show an error message to the user.
		app.disconnect('Disconnected');

		// Write debug information to console
		console.log('Error - No device connected.');
	}
};


app.setLoadingLabel = function(message) {

	console.log(message);
	$('#loadingStatus').text(message);
};

app.connectTo = function(address) {

	device = app.devices[address];

	$('#loadingView').show();

	app.setLoadingLabel('Trying to connect to ' + device.name);

	function onConnectSuccess(device) {

		function onServiceSuccess(device) {

			// Application is now connected
			app.connected = true;
			app.device = device;

			console.log('Connected to ' + device.name);

			var htmlString = '<h2>Franks ' + device.name + '</h2>';

			$('#hostname').append($(htmlString));

			$('#scanResultView').hide();
			$('#loadingView').hide();
			$('#systemInformationView').show();

			Object.keys(app.CHARACTERISTICS).map(
				function(characteristic){

					device.readCharacteristic(
						characteristic,
						app.CHARACTERISTICS[characteristic],
						function(error){
							console.log('Error occured')
						});
			});
		}

		function onServiceFailure(errorCode) {

			// Disconnect and show an error message to the user.
			app.disconnect('Wrong device!');

			// Write debug information to console.
			console.log('Error reading services: ' + errorCode);
		}

		app.setLoadingLabel('Identifying services...');

		// Connect to the appropriate BLE service
		device.readServices(
			[app.SYSTEMINFORMATIONSERVICE],
			onServiceSuccess,
			onServiceFailure
		);
	}

	function onConnectFailure(errorCode) {

		app.disconnect('Disconnected from device');

		// Show an error message to the user
		console.log('Error ' + errorCode);
	}

	// Stop scanning
	evothings.easyble.stopScan();

	// Connect to our device
	console.log('Identifying service for communication');
	device.connect(onConnectSuccess, onConnectFailure);
};


app.disconnect = function(errorMessage) {

	if (errorMessage) {

		navigator.notification.alert(errorMessage, function() {});
	}

	app.connected = false;
	app.device = null;

	// Stop any ongoing scan and close devices.
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();

	console.log('Disconnected');

	$('#scanResultView').empty();
	$('#hostname').empty();
	$('#temp').empty();
	$('#loadingView').hide();
	$('#scanResultView').hide();
	$('#systemInformationView').hide();

	$('#startView').show();
};

function convertDataToObject(data) {

	return JSON.parse(String.fromCharCode.apply(null, new Uint8Array(data)))
}



function printTemp(data) {
		var temp  = convertDataToObject(data).temp;
		var htmlString = '<p>' + 'Temp: '  + temp + '</p>';
		$('#temp').append($(htmlString));
	};

