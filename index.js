var request = require('request');
var parseString = require('xml2js').parseString;
var err = require('error-helper');

exports.is = function (callback) {
	request.get({
		url: 'http://www.bicyclecounter.dk/BicycleCounter/GetCycleInfo?ran=1379500208853&StationId=235&LaneId=0'
	}, function(err, response, xml) {
		if(err || response.statusCode !== 200){
			return callback(err(500,'www.bicyclecounter.dk refuses to respond or give back data'));
		}
		var cyclecounter = [];
		parseString(xml, { explicitRoot: false }, function(err, result) {

			cyclecounter.push({
				DayCount: result.DayCount[0],
				YearCount: result.YearCount[0],
				Time: result.Time[0],
				Date: result.Date[0],
			});

		});
		
		return callback(null,{results: cyclecounter});
	});
};