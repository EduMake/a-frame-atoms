var express = require('express');
var router = express.Router();

/* GET element listing. */
router.get('/', function(req, res, next) {
    var options = {};
    var aAtoms = req.app.locals.elements.getAllPositions();
    options.atoms = aAtoms.slice(7);
    options.layout = 'aframe';
    options.title = 'Periodic Table';
    res.render('table', options);
});

module.exports = router;
