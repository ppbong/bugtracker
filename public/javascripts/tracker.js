var trackerList = []
var permission = []
var options = {}

const _getOptions = (name) => {
	return new Promise((resolve, reject) => {
		var url = name === 'leader' ? '/users/leader' : '/dicts/' + name

		axios.get(url).then((res) => {
			if (res.data.err) {
				reject(res.data.err)
			} else {
				// console.log(res.data)
				resolve(res.data)
			}
		})
	})
}

// 获取数据字典
const getOptions = async () => {
	const createOption = (list) => {
		var html = []
		list.forEach(e => {
			html.push('<option label="' + e.label + '" value="' + e.value + '"></option>')
		})
		return html.join('')
	}

	list = await _getOptions('product')
	options.product = createOption(list)

	list = await _getOptions('leader')
	options.leader = createOption(list)

	list = await _getOptions('level')
	options.level = createOption(list)

	list = await _getOptions('status')
	options.status = createOption(list)

	list = await _getOptions('result')
	options.result = createOption(list)
}

const _getPermission = () => {
	return new Promise((resolve,reject) => {
		axios.get('/users/permission/').then((res) => {
			// console.log(res.data)
			resolve(res.data)
		})
	})
}

// 获取用户权限
const getPermission = async () => {
	permission = await _getPermission()
}

const _getTrackerList = () => {
	return new Promise((resolve,reject) => {
		axios.get('/tracker/list').then((res) => {
			// console.log(res.data)
			resolve(res.data)
		})
	})
}

// 获取数据列表
const getTrackerList = async () => {
	trackerList = await _getTrackerList()
}

// 新增/删除/更新
const trackerAction = (action, tracker) => {
	return new Promise((resolve,reject) => {
		if (action === 'add' || action === 'delete' || action === 'update') {
			axios.post('/tracker/' + action, tracker).then((res) => {
				if (res.err) {
					reject(res.err)
				} else {
					resolve(res.data)
				}
			})
		} else {
			reject('unknown action')
		}
	})
}

// 获取当前日期
const getNowDate = () => {
	const dateFormat = new Intl.DateTimeFormat('zh-CN', {year:'numeric', month:'2-digit', day:'2-digit'}).format
	return dateFormat(new Date()).replaceAll('/','-')
}

// 创建表格
const createTrackerTable = () => {
	const th = ['序号','日期','产品','问题','描述','参考','备注','负责','等级','状态','结果']

	var html = []

	html.push('<thead><tr>')
	th.forEach(element => {	html.push('<th>' + element + '</th>') })
	html.push('</tr></thead>')
	html.push('<tbody></tbody>')

	const trackerTable = document.getElementById('trackerTable')
	if (trackerTable) {
		$('#trackerTable').html(html.join('')).prependTo('#app')
	} else {
		$('<table id="trackerTable"></table>').html(html.join('')).prependTo('#app')
	}
}

// 创建表格行数据
const createTrackerTableLine = (trackers) => {
	trackers.forEach((element,index) => {
		var html = []

		html.push('<td class="index">'+ (index + 1) +'</td>')
		html.push('<td class="date">'+ element.date +'</td>')
		html.push('<td class="product">'+ element.product +'</td>')
		html.push('<td class="title">'+ element.title +'</td>')
		html.push('<td class="descr">'+ element.descr +'</td>')

		html.push('<td class="refer">')
		var link = element.refer.split('|') || []
		link.forEach((e,idx) => {
			html.push('<a href="' + element.seq + '/' + e + '" target="_blank">' + (idx+1) + '</a>')
		})
		html.push('</td>')

		html.push('<td class="remark">'+ element.remark +'</td>')
		html.push('<td class="leader"><select name="leader" aria-label="Leader">'+ options.leader +'</select></td>')
		html.push('<td class="level"><select name="level" class="'+ element.level +'" aria-label="Level">'+ options.level +'</select></td>')
		html.push('<td class="status"><select name="status" class="'+ element.status +'" aria-label="Status">'+ options.status +'</select></td>')
		html.push('<td class="result"><select name="result" class="'+ element.result +'" aria-label="Result">'+ options.result +'</select></td>')

		$('<tr id="'+ element.seq +'" class="'+ lineClassName(element) +'"></tr>').html(html.join(''))
		// 默认选中的选项
		.find('.product').find('option').each((i,e) => {
			e.selected = e.value === element.product ? true : false
		}).end().end()
		.find('.leader').find('option').each((i,e) => {
			e.selected = e.value === element.leader ? true : false
		}).end().end()
		.find('.level').find('option').each((i,e) => {
			e.selected = e.value === element.level ? true : false
		}).end().end()
		.find('.status').find('option').each((i,e) => {
			e.selected = e.value === element.status ? true : false
		}).end().end()
		.find('.result').find('option').each((i,e) => {
			e.selected = e.value === element.result ? true : false
		}).end().end()
		// 访问控制
		.find('select').each((i,e) => {
			e.disabled =  permission.indexOf(e.name) === -1 ? true : false
		}).end()
		// 事件处理
		.click((event) => {
			if (event.target.nodeName === 'TD') {
				if (permission.indexOf('edit') !== -1) {
					createTrackrForm('edit', index)
				}
			}
		})
		.change((event) => {
			if (event.target.nodeName === 'SELECT') {
				event.target.className = event.target.value
				if (event.target.name === 'leader') {
					trackerList[index].leader = event.target.value
				} else if (event.target.name === 'level') {
					trackerList[index].level = event.target.value
				} else if (event.target.name === 'status') {
					trackerList[index].status = event.target.value
				} else if (event.target.name === 'result') {
					trackerList[index].result = event.target.value
				}

				// 更新颜色
				event.target.parentNode.parentNode.className = lineClassName(trackerList[index])

				// 更新数据
				trackerAction('update', trackerList[index]).catch(err => {
					alert("更新失败：" + err)
				})
			}
		})
		.appendTo($('#trackerTable').find('tbody'))
	})
}

// 表格行颜色
const lineClassName = (tracker) => {
	return tracker.result === 'done' ? 'success'
		: tracker.result === 'close' ? 'info'
		: tracker.level === 'high' ? 'danger'
		: tracker.level === 'medium' ? 'warn'
		: 'primary'
}

const createNewButton = () => {
	if (permission.indexOf('add') === -1) return

	$('#trackerTable').after('<div><button id="create" type="button" class="primary">+ new Bug Tracker</button></div>')

	$('#create').click((event) => {
		createTrackrForm('new', undefined)
	})
}

// 创建表单（新增/编辑）
const createTrackrForm = (operator = 'new', idx) => {
	var html = []
	html.push('<form">')
	html.push('<input id="seq" value="" type="hidden" aria-label="Sequence">')
	html.push('<div><label for="index">序号</label><input id="index" value="" disabled></div>')
	html.push('<div><label for="date">日期</label><input id="date" value="'+ getNowDate() +'" type="date"></div>')
	html.push('<div><label for="product">产品</label><select id="product">'+ options.product +'</select></div>')
	html.push('<div><label for="title">问题</label><input id="title" value=""></div>')
	html.push('<div><label for="descr">描述</label><input id="descr" value=""></div>')
	html.push('<div><label for="refer">参考</label><input id="refer" value="" type="file"></div>')
	html.push('<div><label for="remark">备注</label><input id="remark" value=""></div>')
	html.push('<div><label for="leader">负责</label><select id="leader">'+ options.leader +'</select></div>')
	html.push('<div><label for="level">等级</label><select id="level">'+ options.level +'</select></div>')
	html.push('<div><label for="status">状态</label><select id="status">'+ options.status +'</select></div>')
	html.push('<div><label for="result">结果</label><select id="result">'+ options.result +'</select></div>')
	html.push('<div>')
	html.push('<button id="save" type="button" class="primary">保存</button>')
	if (operator === 'edit' && permission.indexOf('del') !== -1) {
		html.push('<button id="delete" type="button" class="danger">删除</button>')
	}
	html.push('<button id="cancel" type="button" class="info">取消</button>')
	html.push('</div>')
	html.push('</form>')
	
	const trackerForm = document.getElementById('trackerForm')
	if (trackerForm) {
		$('#trackerForm').html(html.join('')).appendTo('#app')
	} else {
		$('<div id="trackerForm"></div>').html(html.join('')).appendTo('#app')
	}
	
	if (operator === 'edit') {
		$('#trackerForm').find('form').attr('action', '/tracker/update')

		const tracker = trackerList[idx]
		$('#seq').val(tracker.seq)
		$('#index').val(idx+1)
		$('#date').val(tracker.date.replaceAll('/','-'))
		$('#product').find('option').each((i,e) => {
			e.selected = e.value === tracker.product ? true : false
		})
		$('#title').val(tracker.title)
		$('#descr').val(tracker.descr)
		// $('#refer').val(tracker.refer)
		$('#remark').val(tracker.remark)
		$('#leader').find('option').each((i,e) => {
			e.selected = e.value === tracker.leader ? true : false
		})
		$('#level').find('option').each((i,e) => {
			e.selected = e.value === tracker.level ? true : false
		})
		$('#status').find('option').each((i,e) => {
			e.selected = e.value === tracker.status ? true : false
		})
		$('#result').find('option').each((i,e) => {
			e.selected = e.value === tracker.result ? true : false
		})
	}
	
	$('#save').click((event) => {
		// event.preventDefault()
		let trackerNew = {
			seq: $('#seq').val(),
			date: $('#date').val(),
			product: $('#product').val(),
			title: $('#title').val(),
			descr: $('#descr').val(),
			refer: $('#refer').val(),
			remark: $('#remark').val(),
			leader: $('#leader').val(),
			level: $('#level').val(),
			status: $('#status').val(),
			result: $('#result').val()
		}
		
		let action = operator === 'new' ? 'add' : 'update'
		trackerAction(action, trackerNew).then(data => {
			if (action === 'add') {
				trackerList.push(data)
			} else {
				let idx = $('#index').val() - 1
				trackerList[idx].date = data.date
				trackerList[idx].product = data.product
				trackerList[idx].title = data.title
				trackerList[idx].descr = data.descr
				trackerList[idx].refer = data.refer
				trackerList[idx].remark = data.remark
				trackerList[idx].leader = data.leader
				trackerList[idx].level = data.level
				trackerList[idx].status = data.status
				trackerList[idx].result = data.result
			}

			// 重新渲染表格（序号连续性）
			createTrackerTable()
			createTrackerTableLine(trackerList)

			// 可仅更新或追加行提高性能
		}).catch(err => {
			alert(operator === 'new' ? '新增失败：' : '更新失败：' + err)
		}).finally(() => {
			$('#trackerForm').remove()
		})
	})

	$('#delete').click((event) => {
		// event.preventDefault()
		trackerAction('delete', trackerList[idx]).then(() => {
			// 删除数据及DOM节点
			let trackerOld = trackerList.splice(idx, 1)
			$('#' + trackerOld.seq).remove()

			// 重新渲染表格（序号连续性）
			createTrackerTable()
			createTrackerTableLine(trackerList)
		}).catch((err) => {
			alert('删除失败：' + err)
		}).finally(() => {
			$('#trackerForm').remove()
		})
	})

	$('#cancel').click((event) => {
		// event.preventDefault()
		$('#trackerForm').remove()
	})
}

window.onload = async () => {
	await getOptions()
	await getPermission()
	await getTrackerList()
	config()
	createTrackerTable()
	createTrackerTableLine(trackerList)
	createNewButton()
}

const config = () => {
	if (-1 === permission.indexOf('config')) return;

	$('div.nav').append('<a href="/config">数据字典</a>')
}