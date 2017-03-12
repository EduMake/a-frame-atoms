var express = require('express');
var router = express.Router();

/* GET element listing. */
router.get('/:id', function(req, res, next) {
    console.log("req.params", req.params);
    var options = req.app.locals.elements.getPositions(req.params.id);
    options.layout = 'aframe';
    res.render('element', options);
});

module.exports = router;
