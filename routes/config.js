var express = require('express');
var router = express.Router();

const dbservice = require('../service/dbservice.js');

const accessEnable = async (username) => {
    const user = await dbservice.getUser(username);
    const permission = user ? user.permission.split('|') : [];

    if (permission.indexOf('config') === -1) {
        return false;
    }

    return true;
};

/* GET config. */
router.get('/', async function(req, res, next) {
    const enable = await accessEnable(req.session.user);
    if (enable) {
        res.render('config', {title: '系统设置'});
    } else {
        res.redirect('/login')
    }
});

router.post('/save', async function(req, res, next) {
    const enable = await accessEnable(req.session.user);
    if (enable) {
        data = req.body
        // console.log(data)

        dbservice.setDict('product', data.product)
        dbservice.setDict('level', data.level)
        dbservice.setDict('status', data.status)
        dbservice.setDict('result', data.result)
        dbservice.setUser(data.permission)
        
        res.send('ok')
    } else {
        res.redirect('/login')
    }
})

module.exports = router;
