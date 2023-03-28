// 控制用户登录状态
var SessionList = []

const INTERVAL_TIME = 5000

setInterval(() => {
	SessionList.forEach((e) => {
		e.expires = e.expires - INTERVAL_TIME
		if (e.expires > 0) {
			e.live = true
		} else {
			e.expires = 0
			e.live = false
		}
	})
}, INTERVAL_TIME)


const session = {
	index: (user) => {
		SessionList.forEach((e,i) => {
			if (e.user === user) return i
		})
		return -1
	},

	exists: (user) => {
		var idx = session.index(user)
		return idx === -1 ? false : true
	},

	isLive: (user) => {
		var s = session.get(user)
		if (s && s.live) return true
		return false
	},

	get: (user) => {
		var idx = session.index(user)
		if (idx === -1) {
			return null
		} else {
			return SessionList[idx]
		}
	},

	set: (user, expires) => {
		var idx = session.index(user);
		if (idx === -1) {
			var s = {}
			s.user = user
			s.expires = expires
			s.live = true
			SessionList.push(s)
		} else {
			SessionList[idx].expires = expires
			SessionList[idx].live = expires === 0 ? false : true
		}
	},

	reset: (user) => {
		session.set(user, 300000)
	}
}

module.exports = session;
