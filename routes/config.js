var express = require('express');
var router = express.Router();

const dbservice = require('../service/dbservice.js')

/* GET config. */
router.get('/', function(req, res, next) {
    res.render('config', {title: '系统设置'})
});

router.post('/save', async function(req, res, next) {
    data = req.body
    // console.log(data)

    dbservice.setDict('product', data.product)
    dbservice.setDict('level', data.level)
    dbservice.setDict('status', data.status)
    dbservice.setDict('result', data.result)
    dbservice.setUser(data.permission)
    
    res.redirect('/config')
})

module.exports = router;
