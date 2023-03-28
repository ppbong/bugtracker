var express = require('express');
var router = express.Router();

const dbservice = require('../service/dbservice.js')

/* GET users listing. */
router.get('/', async function(req, res, next) {
  const rows = await dbservice.getUserList()
  res.send(rows);
});

module.exports = router;
