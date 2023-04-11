var express = require('express');
var router = express.Router();

const dbservice = require('../service/dbservice.js');

router.get('/', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

router.get('/list', async function(req, res, next) {
  const list = await dbservice.getUserList();

  list.forEach((e,i,a) => {
    e.password = '******';
  });

  res.send(list);
});

/* for datalist */
router.get('/leader', async function(req, res, next) {
  var leader = [];
  const rows = await dbservice.getUserList();

  rows.forEach((e) => {
    leader.push({ label:e.cname, value:e.username });
  });

  res.json(leader);
})

/* for access control */
router.get('/permission/', async function(req, res, next) {
  var username = req.session.user;
  const user = await dbservice.getUser(username);

  var permission = user && user.permission ? user.permission.split('|') : [];
  res.send(permission);
})

module.exports = router;
