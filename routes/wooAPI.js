var fs = require('fs');

exports.getWoos = function(req, res) {
	req.models.Woo.find({
		//category
	}, function(err, woos) {
		if (err) throw err;
		if (!woos || woos.length == 0) {
			res.json({ success: false, message: 'Get failed! Woos not found.' });
		}
		else {
			var wooObjects = []
			for (var i = 0; i < woos.length; i++) {
				var currentWoo = woos[i];
				var wooObject = {};
				wooObject.uuid = currentWoo.uuid;
				wooObject.orderedImages = [];
				if (req.query.firstImageOnly) {
					wooObject.orderedImages.push(currentWoo.orderedImageFileNames[0]);
				}
				else {
					for (var j = 0; j < currentWoo.orderedImageFileNames.length; j++) {
						wooObject.orderedImages.push(currentWoo.orderedImageFileNames[j]);
					}
				}
				wooObjects.push(wooObject);
			}
			res.json({
				success: true,
				message: 'Woos successfully found',
				woos: wooObjects
			});
		}
	});
}

//get one woo
exports.getWoo = function(req, res) {
	req.models.Woo.findOne({
		uuid: req.params.uuid
	}, function(err, woo) {
		if (err) throw err;
		if (!woo) {
			res.json({ success: false, message: 'Get failed! Woo not found.' });
		}
		else {
			var wooObject = {
				uuid: woo.uuid,
				orderedImages: woo.orderedImageFileNames,
			};
			res.json({
				success: true,
				message: 'Woo successfully found!',
				woo: wooObject
			});
		}
	});
}