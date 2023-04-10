const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

const dbfile = path.resolve(__dirname, './tracker.sqlite')
console.log(dbfile)

// 流水号
const sequence_schema = `CREATE TABLE IF NOT EXISTS sequence (
	name TEXT PRIMARY KEY,	/*变量名*/
	seq INTEGER				/*流水号*/
)`

const sequence_data = `INSERT INTO sequence VALUES ('tracker', 1000)`
const sequence_current = `SELECT name, seq FROM sequence WHERE name=?`
const sequence_increment = `UPDATE sequence SET seq=seq+1 WHERE name=?`

// 数据字典
const dict_schema = `CREATE TABLE IF NOT EXISTS dict (
	type TEXT,				/*类别*/
	name TEXT,				/*名称*/
	value TEXT,				/*取值*/
	label TEXT,				/*标签*/
	remark TEXT				/*备注*/
)`

const dict_data = `INSERT INTO dict VALUES (?,?,?,?,?)`
const dict_query_all_bytype = `SELECT type,name,value,label,remark FROM dict WHERE type=?`

// 用户
const user_schema = `CREATE TABLE IF NOT EXISTS user (
	username TEXT PRIMARY KEY,/*用户名*/
	password TEXT,			/*口令*/
	cname TEXT,				/*姓名*/
	permissions TEXT,		/*权限*/
	remark TEXT				/*备注*/
)`

const user_data = `INSERT INTO user VALUES (?,?,?,?,?)`
const user_query_one = `SELECT username,password,cname,permissions,remark FROM user WHERE username=?`
const user_query_all = `SELECT username,password,cname,permissions,remark FROM user`

// 问题跟踪
const tracker_schema = `CREATE TABLE IF NOT EXISTS tracker (
	seq INTEGER PRIMARY KEY,/*流水号*/
	date TEXT,				/*日期*/
	product TEXT,			/*所属产品*/
	title TEXT,				/*标题*/
	descr TEXT,				/*问题详情*/
	refer TEXT,				/*参考*/
	leader TEXT,			/*负责人*/
	level TEXT,				/*问题等级*/
	status TEXT,			/*问题状态*/
	result TEXT,			/*处理结果*/
	remark TEXT				/*备注*/
)`

const tracker_data = `INSERT INTO tracker VALUES (?,?,?,?,?,?,?,?,?,?,?)`
const tracker_query_all = `SELECT seq,date,product,title,descr,refer,leader,level,status,result,remark FROM tracker`
const tracker_query_all_default = tracker_query_all + ` ORDER BY seq`
const tracker_query_all_bylevel = tracker_query_all + ` ORDER BY level DESC, seq ASC`
const tracker_query_one = `SELECT seq,date,product,title,descr,refer,leader,level,status,result,remark FROM tracker WHERE seq=?`
const tracker_insert = `INSERT INTO tracker VALUES (?,?,?,?,?,?,?,?,?,?,?)`
const tracker_update = `UPDATE tracker SET date=?,product=?,title=?,descr=?,refer=?,leader=?level=?,status=?,result=?,remark=? WHERE seq=?`
const tracker_delete = `DELETE FROM tracker WHERE seq=?`

const initialized = function (dbfile) {
	try {
		fs.accessSync(dbfile, fs.constants.R_OK | fs.constants.W_OK); // F_OK
		return true;
	} catch(err) {
		return false;
	}
}(dbfile)

const db = new sqlite3.Database(dbfile)

const initializing = function() {
	if(initialized) return

	db.serialize(() => {
		db.run(sequence_schema)
		db.run(sequence_data)

		db.run(dict_schema)
		stmt = db.prepare(dict_data)
		// type,name,value,label,descr
		stmt.run('product', 'P1', 'admin', '平台', '')
		stmt.run('product', 'P2', 'agent', '代理', '')
		stmt.run('level', 'L1', 'low', '低', '')
		stmt.run('level', 'L2', 'medium', '中', '')
		stmt.run('level', 'L3', 'high', '高', '')
		stmt.run('status', 'S1', 'fix', '待排查', '')
		stmt.run('status', 'S2', 'cover', '待修复', '')
		stmt.run('status', 'S3', 'resolved', '已处理', '')
		stmt.run('status', 'S4', 'rejected', '不处理', '')
		stmt.run('result', 'R1', 'open', '待复核', '')
		stmt.run('result', 'R2', 'done', '已完成', '')
		stmt.run('result', 'R3', 'close', '已关闭', '')
		stmt.finalize()

		db.run(user_schema)
		stmt = db.prepare(user_data)
		// username,password,cname,permissions,remark
		stmt.run('admin', '123456', 'admin', 'add|del|edit|level|status|result|remark', '')
		stmt.run('user1', '123456', 'user1', 'status|remark')
		stmt.finalize()

		db.run(tracker_schema)
		stmt = db.prepare(tracker_data)
		// seq,date,product,title,descr,refer,leader,level,status,result,remark
		stmt.run(1,'2023/01/01','P1','T1','I1','R1','L1','high','fix','open','R1')
		stmt.run(2,'2023/01/02','P2','T2','I2','R2','L2','medium','cover','done','R2')
		stmt.run(3,'2023/01/03','P3','T3','I3','R3','L3','low','resovled','close','R2')
		stmt.finalize()
	})
}()


const queryDict = (type) => {
	return new Promise((resolve, reject) => {
		db.all(dict_query_all_bytype, type, (err, rows) => {
			if (err) throw err

			resolve(rows)
		})
	})
}

const dbservice = {
	getTrackerSequence: () => {
		return new Promise((resolve, reject) => {
			db.serialize(() => {
				db.get(sequence_current, 'tracker', (err, row) => {
					if (err) throw err

					console.log('row.name = ' + row.name + '; row.seq = ' + row.seq)
					resolve(row.seq)
				})
				db.run(sequence_increment, 'tracker', (err) => {
					if (err) throw err
				})
			})
		})
	},

	getDict: (type) => {
		return queryDict(type)
	},

	getUserList: () => {
		return new Promise((resolve, reject) => {
			db.all(user_query_all, (err, rows) => {
				if (err) throw err

				resolve(rows)
			})
		})
	},

	getUser: (username) => {
		return new Promise((resolve, reject) => {
			db.get(user_query_one, username, (err, row) => {
				if (err) throw err

				resolve(row)
			})
		})
	},

	getTrackerAll: () => {
		return new Promise((resolve, reject) => {
			db.all(tracker_query_all, (err, rows) => {
				if (err) throw err

				resolve(rows)
			})
		})
	},

	getTracker: (seq) => {
		return new Promise((resolve, reject) => {
			db.get(tracker_query_one, seq, (err, row) => {
				if (err) throw err

				resolve(row)
			})
		})
	},

	addTracker: (tracker) => {
		return new Promise((resolve, reject) => {
			stmt = db.prepare(tracker_insert)
			let params = []
			params.push(tracker.seq)
			params.push(tracker.date)
			params.push(tracker.product)
			params.push(tracker.title)
			params.push(tracker.descr)
			params.push(tracker.refer)
			params.push(tracker.leader)
			params.push(tracker.level)
			params.push(tracker.status)
			params.push(tracker.result)
			params.push(tracker.remark)
			stmt.run(params, (err) => {
				if (err) throw err

				resolve(tracker.seq)
			})
			stmt.finalize()
		})
	},

	updTracker: (tracker) => {
		return new Promise((resolve, reject) => {
			stmt = db.prepare(tracker_update)
			let params = []
			params.push(tracker.date)
			params.push(tracker.product)
			params.push(tracker.title)
			params.push(tracker.descr)
			params.push(tracker.refer)
			params.push(tracker.leader)
			params.push(tracker.level)
			params.push(tracker.status)
			params.push(tracker.result)
			params.push(tracker.remark)
			params.push(tracker.seq)
			stmt.run(params, (err) => {
				if (err) throw err

				resolve(tracker.seq)
			})
			stmt.finalize()
		})
	},

	delTracker: (seq) => {
		return new Promise((resolve, reject) => {
			db.run(tracker_delete, seq, (err) => {
				if (err) throw err

				resolve(seq)
			})
		})
	},

	release: () => {
		if (db) {
			db.close()
		}
	}
}

module.exports = dbservice;