var express = require('express');
var router = express.Router();

const dbservice = require('../service/dbservice.js')

/* GET dict. */
router.get('/', async function(req, res, next) {
  const product = await dbservice.getProductList()
  const level = await dbservice.getLevelList()
  const status = await dbservice.getStatusList()
  const result = await dbservice.getResultList()
  const users = await dbservice.getUserList()
  const leader = []
  users.forEach(e => {
    leader.push({value: e.username, label: e.cname})
  });

  res.send({product, level, status, result, leader})
});

module.exports = router;
