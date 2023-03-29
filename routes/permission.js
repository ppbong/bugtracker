var express = require('express');
var router = express.Router();

const dbservice = require('../service/dbservice.js')

/* GET permisson. */
router.get('/', function(req, res, next) {
  next()
});

router.get('/:username', async function(req, res, next) {
  console.log(req.params.username)
  const user = await dbservice.getUser(req.params.username)

  permissions = user ? user.permissions : {}
  res.send(user.permissions);
});

module.exports = router;
