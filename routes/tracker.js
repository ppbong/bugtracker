var express = require('express');
var router = express.Router();

const dbservice = require('../service/dbservice.js')

// tracker
router.get('/', function(req, res, next) {
  res.render('tracker', { title: '问题跟踪', username: req.query.u })
});

router.get('/list', async function(req, res, next) {
  const list = await dbservice.getTrackerAll();

  res.json(list)
});

router.get('/add', async function(req, res, next) {
  var tracker = req.body
  tracker.seq = await dbservice.getNewTrackerSequence()
  const seq = await dbservice.addTracker(tracker)

  res.json({seq})
});

router.get('/update', async function(req, res, next) {
  var tracker = req.body
  const seq = await dbservice.updTracker(tracker)

  res.json({seq})
});

router.get('/delete', async function(req, res, next) {
  var tracker = req.body
  const seq = await dbservice.delTracker(tracker.seq)

  res.json({seq})
});

module.exports = router;
