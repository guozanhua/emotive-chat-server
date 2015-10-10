var fs = require('fs');

exports.getWoos = function(req, res) {
	models.Woo.find({
		//category
	}, function(err, woos) {
		if (err) throw err;
		if (!woos) {
			res.json({ success: false, message: 'Get failed! Woos not found.' });
		}
		else {
			var wooObjects = []
			for (var i = 0; i < woos.count; i++) {
				var currentWoo = woos[i];
				for (var j = 0; j < currentWoo.orderedImageFileNames.length; j++) {
					var filePath = "/img/" + currentWoo.orderedImageFileNames[i]
					var img = fs.readFileSync(filePath);
					res.writeHead(200, {'Content-Type': 'image/png'});
				}
			}
			res.json({
				success: true,
				message: 'Woos successfully found',
				woos: wooObjects
			})
		}
	});
}

//get one woo
exports.getWoo = function(req, res) {
	models.Woo.findOne({
		uuid: req.params.uuid
	}, function(err, woo) {
		if (err) throw err;
		if (!woo) {
			res.json({ success: false, message: 'Get failed! Woo not found.' });
		}
		else {
			/* MUST-DO-SOON --> get files based on orderedImageFileNames and put them in image array */
			var wooObject = {
				uuid: woo.uuid,
				filenames: woo.orderedImageFileNames,
			};
			res.json({
				success: true,
				message: 'Woo successfully found!',
				woo: wooObject
			});
		}
	});
}