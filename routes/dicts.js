var express = require('express');
var router = express.Router();

const dbservice = require('../service/dbservice.js')

/* GET dict. */
router.get('/', async function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
});

router.get('/:type', async function(req, res, next) {
  const list = await dbservice.getDict(req.params.type)

  if (list) {
    res.json(list)
  } else {
    res.send({err: 'no record'})
  }
})

module.exports = router;
