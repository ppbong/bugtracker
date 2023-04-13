var express = require('express');
var router = express.Router();

const dbservice = require('../service/dbservice.js')

/* User login. */
router.get('/', function(req, res, next) {
	var errmsg = req.session.error || ''
	res.render('login', { title:'Bug Tracker', errmsg: errmsg})
})

/* User login action. */
router.post('/', async function(req, res, next) {
	let username = req.body.username
	let password = req.body.password
	let user = await dbservice.getUser(username)

	if (user && user.password === password) {
		req.session.user = username
		req.session.error = ''
		res.redirect('/tracker')
	} else {
		req.session.user = ''
		req.session.error = '登录失败:用户名或密码错误'
		res.redirect('/login')
	}
});

router.get('/logout', function(req, res, next) {
	req.session.user = ''
	req.session.error = ''

	res.redirect('/login')
})

module.exports = router;