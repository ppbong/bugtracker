var express = require('express');
var router = express.Router();

const dbservice = require('../service/dbservice.js')

/* GET dict. */
router.get('/', function(req, res, next) {
  next()
});

router.get('/product', async function(req, res, next) {
  const rows = await dbservice.getProductList()
  res.send(rows);
});

router.get('/level', async function(req, res, next) {
  const rows = await dbservice.getLevelList()
  res.send(rows);
});

router.get('/status', async function(req, res, next) {
  const rows = await dbservice.getStatusList()
  res.send(rows);
});

router.get('/result', async function(req, res, next) {
  const rows = await dbservice.getResultList()
  res.send(rows);
});

module.exports = router;
