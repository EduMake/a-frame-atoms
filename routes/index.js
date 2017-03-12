var express = require('express');
var router = express.Router();

/* GET element listing. */
router.get('/', function(req, res, next) {
    var options = {};
    options.title = 'VR Atoms';
    options.atoms = req.app.locals.elements.getAllPositions();
    res.render('index', options);
});

module.exports = router;
