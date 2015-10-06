exports.getWoo = function(req, res) {
	process.nextTick(function() {
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
	});
}