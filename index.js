var request = require('request');
var cheerio = require('cheerio');
var err = require('error-helper');


exports.is = function (carPlate, callback) {

	if (!carPlate.match(/^[a-z0-9]+$/ig)) {
		return callback(new Error('Invalid license plate'));
	}
	request.get({
		url: 'http://ww2.us.is/upplysingar_um_bil?vehinumber=' + carPlate
	}, function (error, response, body) {
		if (error || response.statusCode !== 200) {
			return callback(err(502,'www.us.is refuses to respond or give back data'));
		}
		var $ = cheerio.load(body),
			obj = {
				results: []
			},
			car = {};

		var fields = ['registryNumber', 'number', 'factoryNumber', 'type', 'subType', 'color', 'registeredAt', 'status', 'nextCheck', 'pollution', 'weight'];
		var nothingFound = $('table tr td').html();

		if (nothingFound.indexOf('Ekkert ökutæki fannst') > -1) {
			return callback(err(404,'License plate not found'));
		}

		//Found something
		$('table tr').each(function (key) {
			var val = $(this).find('b').html();
			if (val != '' && val != 0) { //Perform check and add to car array if it passes
				car[fields[key]] = val;
			}
		});
		return callback(null, car);
	});
};