var trackerList = null
var permission = null

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
	['product', 'leader', 'level',  'status', 'result'].forEach(async (name) => {
		const list = await _getOptions(name)

		list.forEach((e) => {
			$('.template')
				.find('select[name="'+ name +'"')
				.append('<option label="' + e.label + '" value="' + e.value + '"></option>')
		})
	})
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

// 获取当前日期
const getNowDate = () => {
	const dateFormat = new Intl.DateTimeFormat('zh-CN', {year:'numeric', month:'2-digit', day:'2-digit'}).format
	return dateFormat(new Date()).replaceAll('/','-')
}

const handleSelectChange = (node) => {
	// tr-td-select
	var line = node.parentNode.parentNode
	var selects = line.querySelectorAll('select')

	var level = ''
	var status = ''
	var result = ''

	selects.forEach((e) => {
		if (e.name === 'level') {
			level = e.value
		} else if (e.name === 'status') {
			status = e.value
		} else if (e.name === 'result') {
			result = e.value
		}
	})

	line.className = result==='done'?'success':result==='close'?'info':level==='high'?'danger':level==='medium'?'warn':'primary'

	// update(line.id, level, status, result)
}

const createButtonGroup = () => {
	var div = document.createElement('div')
	var btnEdit = document.createElement('button')
	var btnDelete = document.createElement('button')

	btnEdit.className = 'edit'
	btnEdit.innerText = '编辑'

	btnEdit.addEventListener('click', (event) => {
		const modify = ['date','title','descr','refer','remark']
		let line = event.target.parentNode.parentNode.parentNode
		let btn = event.target
		if (btn.className === 'edit') {
			btn.className = 'save'
			btn.innerText = '保存'

			let td =  line.querySelectorAll('td')
			td.forEach((e,i) => {
				if (modify.indexOf(e.className) === -1) return

				let input = document.createElement('input')
				let value = e.innerText

				if (e.className === 'date') {
					input.type = 'date'
					input.value = value.replaceAll('/','-')
				} else if (e.className === 'refer') {
					input.type = 'file'
				} else {
					input.type = 'text'
					input.value = value
				}
				
				e.innerHTML = ''
				e.appendChild(input)
			})
		} else {
			btn.className = 'edit'
			btn.innerText = '编辑'
		}
	})

	btnDelete.className = 'delete'
	btnDelete.innerText = '删除'

	btnDelete.addEventListener('click', (event) => {
		let line = event.target.parentNode.parentNode.parentNode
		axios.get('/tracker/delete', {params: {seq: line.id}}).then((res) => {
			if (res.data.err) {
				document.getElementById('errmsg').innerHTML = res.data.err
			} else {
				line.parentNode.removeChild(line)
			}
		})
	})

	div.className = 'btnGroup'
	div.appendChild(btnEdit)
	div.appendChild(btnDelete)

	return div
}

const createTrackerDataLine = (tracker, idx) => {
	const className = tracker.result === 'done' ? 'success'
		: tracker.result === 'close' ? 'info'
		: tracker.level === 'high' ? 'danger'
		: tracker.level === 'medium' ? 'warn'
		: 'primary'

	var referHtml = []
	const refers = tracker.refer ? tracker.refer.split('#') : [] /*多个参考文件以#分隔*/
	
	refers.forEach((e,i) => {
		referHtml.push('<a href="' + tracker.seq + '/' + e + '" target="_blank">' + (i+1) + '</a>')
	})

	$('.template').before(
		$('.template').clone()
		.css('display', '')
		.attr('id', tracker.seq)
		.attr('class', className)
	)

	$('#' + tracker.seq)
	// 序号
	.find('.index').html(idx)
	.end()
	// 日期
	.find('.date').html(tracker.date)
	.end()
	// 产品
	.find('.product')
	.find('option').each((i,e) => {
		e.selected = e.value === tracker.product ? true : false
	})
	.end().end()
	// 问题
	.find('.title').html(tracker.title)
	.end()
	// 描述
	.find('.descr').html(tracker.descr)
	.end()
	// 参考
	.find('.refer').html(referHtml.join(''))
	.end()
	// 备注
	.find('.remark').html(tracker.remark)
	.end()
	// 负责人
	.find('.leader')
	.find('option').each((i,e) => {
		e.selected = e.value === tracker.leader ? true : false
	})
	.end().end()
	// 级别
	.find('.level')
	.find('select').attr('class', tracker.level)
	.find('option').each((i,e) => {
		e.selected = e.value === tracker.level ? true : false
	})
	.end().end().end()
	// 状态
	.find('.status')
	.find('select').attr('class', tracker.status)
	.find('option').each((i,e) => {
		e.selected = e.value === tracker.status ? true : false
	})
	.end().end().end()
	// 结果
	.find('.result')
	.find('select').attr('class', tracker.result)
	.find('option').each((i,e) => {
		e.selected = e.value === tracker.result ? true : false
	})
	.end().end().end()
}

const showTrackerForm = (operator = 'add', idx) => {
	if (operator === 'edit') {
		let index = idx - 1
		$('form').attr('action', '/tracker/update')
		$('form').find('[name="seq"]').attr('value', trackerList[index].seq)
		$('form').find('[name="index"]').attr('value', idx)
		$('form').find('[name="date"]').attr('value', trackerList[index].date.replaceAll('/','-'))
		$('form').find('[name="product"]').attr('value', trackerList[index].product)
		$('form').find('[name="level"]').attr('value', trackerList[index].level)
		$('form').find('[name="status"]').attr('value', trackerList[index].status)
		$('form').find('[name="result"]').attr('value', trackerList[index].result)
		$('form').find('[name="leader"]').attr('value', trackerList[index].leader)
		$('form').find('[name="title"]').attr('value', trackerList[index].title)
		$('form').find('[name="descr"]').attr('value', trackerList[index].descr)
		$('form').find('[name="remark"]').attr('value', trackerList[index].remark)
	} else {
		$('form').attr('action', '/tracker/add')
	}
}

// 渲染表格
const showTrackerTable = async () => {
	trackerList.forEach((e,i) => {
		createTrackerDataLine(e, i+1)
	});
}

const newTrackerHandler = () => {
	$('button.add').click((e) => {
		let now = new Date()
		let idx = trackerList.length

		

		trackerList.push({
			date: dateFormat(new Date()).replaceAll('/','-'),
		})

		createTrackerDataLine(trackerList[idx], idx)
	})
}

const config = () => {
	if (-1 === permission.indexOf('config')) return;

	$('div.nav').append('<a href="/config">数据字典</a>')
}

window.onload = async () => {
	await getOptions()
	await getPermission()
	await getTrackerList()
	config()
	showTrackerTable()
	showTrackerForm()
	newTrackerHandler()

	$(document).dblclick((e) => {
		console.log('dblclick' + e.target)
	})

	$(document).change((e) => {
		if (e.target.tagName === 'SELECT') {
			
			if (e.target.name === 'level' || e.target.name === 'status' || e.target.name === 'result') {
				e.target.className = e.target.value

				tr = e.target.parentNode.parentNode

				let level  = $(tr).find('select[name="level"]').val()
				let status = $(tr).find('select[name="status"]').val()
				let result = $(tr).find('select[name="result"]').val()

				const className = result === 'done' ? 'success'
				: result === 'close' ? 'info'
				: level === 'high' ? 'danger'
				: level === 'medium' ? 'warn'
				: 'primary'

				$(tr).attr('class', className)
			}
		}
	})
}
