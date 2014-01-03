var request = require('request'),
	cheerio = require('cheerio'),
	h = require('apis-helpers');

exports.setup = function (app) {
	app.get('/is/:id', function (req, callback) {
		lookupIceland(req.params.id, callback)
	});
};

var lookupIceland = exports.is = function (carPlate, callback) {

	if (!carPlate.match(/^[a-z0-9]+$/ig)) {
		return callback(new Error('Invalid license plate'));
	}
	request.get({
		headers: {
			'User-Agent': h.browser()
		},
		url: 'http://ww2.us.is/upplysingar_um_bil?vehinumber=' + carPlate
	}, function (error, response, body) {
		if (error || response.statusCode !== 200) {
			return callback(new Error('www.us.is refuses to respond or give back data'));
		}
		var $ = cheerio.load(body),
			obj = {
				results: []
			},
			car = {};

		var fields = ['registryNumber', 'number', 'factoryNumber', 'type', 'subType', 'color', 'registeredAt', 'status', 'nextCheck', 'pollution', 'weight'];
		var nothingFound = $('table tr td').html();

		if (nothingFound.indexOf('Ekkert ökutæki fannst') > -1) {
			var err = new Error('Not found');
			err.code = 404;
			return callback(err);
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