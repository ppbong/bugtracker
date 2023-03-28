var express = require('express');
var router = express.Router();

const dbservice = require('../service/dbservice.js')
const session = require('../service/session.js')

/* User login. */
router.get('/', async function(req, res, next) {
	let form = req.query
	console.log(form)
	let user = await dbservice.getUser(form.u)
	console.log(user)

	if (user && user.password === form.p) {
		res.send({result:'pass', msg:'登录成功', router:'tracker'})
		session.reset(user.username)
	} else {
		res.send({result: 'err', msg:'登录失败', reason:'用户名或密码错误'})
	}
});

module.exports = router;