var express = require('express');
var router = express.Router();

const dbservice = require('../service/dbservice.js')

// tracker
router.get('/', async function(req, res, next) {
  let username = req.session.user
  let user = await dbservice.getUser(username)

  if (user) {
    req.session.permission = user.permissions.split('|')
    res.render('tracker', { title: '问题跟踪', username: username })
  } else {
    req.session.error = '操作超时，请重新登录'
    res.redirect('/login')
  }
});

router.get('/list', async function(req, res, next) {
  let list = await dbservice.getTrackerAll();

  res.json(list)
});

router.get('/add', async function(req, res, next) {
  let permission = req.session.permission

  if (permission.indexOf('add') === -1) {
    res.json({err:'没有添加权限'})
  } else {
    let seq = await dbservice.getTrackerSequence()
    // let date = new Date().toLocaleDateString()
    let tracker = {
      seq,
      date: 'yyyy/mm/dd',
      product: '',
      title: '',
      info: '',
      refer: '',
      leader: '',
      level: '',
      status: '',
      result: '',
      remark: ''
    }

    let ret = await dbservice.addTracker(tracker)
    if (ret === seq) {
      res.json(tracker)
    } else {
      res.json({err:'添加失败'})
    }
  }
});

router.get('/update', async function(req, res, next) {
  var tracker = req.query
  const seq = await dbservice.updTracker(tracker)

  res.json({seq})
});

router.get('/delete', async function(req, res, next) {
  let permission = req.session.permission

  if (permission.indexOf('del') === -1) {
    res.json({err:'没有删除权限'})
  } else {
    let tracker = req.query
    let seq = await dbservice.delTracker(tracker.seq)
    res.json({seq})
  }
});

module.exports = router;
