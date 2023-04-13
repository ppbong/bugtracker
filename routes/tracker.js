var express = require('express');
var router = express.Router();

const fs = require('fs')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const dbservice = require('../service/dbservice.js');

// tracker
router.get('/', async function(req, res, next) {
  let username = req.session.user
  let user = await dbservice.getUser(username)

  if (user) {
    req.session.permission = user.permission.split('|')
    res.render('tracker', { title: '问题跟踪', username })
  } else {
    req.session.error = ''
    res.redirect('/login')
  }
});

router.get('/list', async function(req, res, next) {
  let list = await dbservice.getTrackerAll();

  res.json(list)
});

router.post('/add', async function(req, res, next) {
  let permission = req.session.permission

  if (permission.indexOf('add') === -1) {
    res.json({err:'没有添加权限'})
  } else {
    var tracker = req.body

    tracker.seq = await dbservice.getTrackerSequence()

    let ret = await dbservice.addTracker(tracker)
    if (ret === tracker.seq) {
      res.json(tracker)
    } else {
      res.json({err:'添加失败'})
    }
  }
});

router.post('/update', async function(req, res, next) {
  var tracker = req.body
  const seq = await dbservice.updTracker(tracker)

  res.json(tracker)
});

router.post('/delete', async function(req, res, next) {
  let permission = req.session.permission

  if (permission.indexOf('del') === -1) {
    res.json({err:'没有删除权限'})
  } else {
    let tracker = req.body
    let seq = await dbservice.delTracker(tracker.seq)

    res.json(seq)
  }
});

router.post('/files/remove/:seq', function(req, res, next) {
  // 流水号
  let seq = req.params.seq
  let files = req.body

  let fileSavePath = 'public/files/' + seq

  files.forEach((e) => {
    fs.rm(fileSavePath + '/' + e, (err) => {})
  })

  res.send('删除成功')
});

router.post('/files/upload/:seq', upload.single('refer'), function(req, res, next) {
  // 流水号
  let seq = req.params.seq
  let file = req.file

  let fileSavePath = 'public/files/' + seq
  fs.mkdirSync(fileSavePath, {recursive: true})
  
  let filename = fileSavePath + '/' + file.originalname

  fs.readFile(file.path, function (err, data) {
    fs.writeFile(filename, data, function (err) {
      fs.rm(file.path, (err) => {})
      if (err) {
        res.json({err: '上传失败'})
      } else {
        res.send(file.originalname + '上传成功')
      }
    })
  })

});

module.exports = router;
