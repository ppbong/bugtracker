// 获取选项
const getOptions = () => {
	return new Promise((resolve,reject) => {
		axios.get('/dicts').then((res) => {
			console.log(res.data)
			resolve(res.data)
		})
	})
}

// 获取数据
const getTrackerData = () => {
	return new Promise((resolve,reject) => {
		axios.get('/tracker/list').then((res) => {
			console.log(res.data)
			resolve(res.data)
		})
	})
}

// 获取权限
const getPermission = (user) => {
	return new Promise((resolve,reject) => {
		axios.get('/permission/' + user).then((res) => {
			console.log(res.data)
			resolve(res.data)
		})
	})
}

// 创建选项元素
const createSelectElement = (dict, type, value) => {
	var element = document.createElement('select')
	element.name = type
	element.className = value

	var options = type === 'product'
	? dict.product
	: type === 'level'
	? dict.level
	: type === 'status'
	? dict.status
	: type === 'result'
	? dict.result
	: type === 'leader'
	? dict.leader
	: undefined

	if (options === undefined) return element

	options.forEach((e) => {
		var option = document.createElement('option')
		option.value = e.value
		option.innerText = e.label
		option.selected = e.value === value ? true : false
		element.appendChild(option)
	})

	element.addEventListener('change', (event) => {
		event.target.className = event.target.value
		handleSelectChange(event.target)
	});

	return element;
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
		const modify = ['date','title','info','refer','remark']
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

const createTrackerDataLine = (tracker, idx, options) => {
	var tr = document.createElement('tr')

	tr.id = tracker.seq
	tr.className = tracker.result === 'done' ? 'success'
		: tracker.result === 'close' ? 'info'
		: tracker.level === 'high' ? 'danger'
		: tracker.level === 'medium' ? 'warn'
		: 'primary'

	// 序号
	td = document.createElement('td')
	td.className = 'index'
	td.innerText = idx
	tr.appendChild(td)

	// 日期
	td = document.createElement('td')
	td.className = 'date'
	td.innerText = tracker.date
	tr.appendChild(td)

	// 产品
	td = document.createElement('td')
	td.className = 'product'
	td.appendChild(createSelectElement(options, 'product', tracker.product))
	tr.appendChild(td)

	// 问题
	td = document.createElement('td')
	td.className = 'title'
	td.innerText = tracker.title
	tr.appendChild(td)

	// 描述
	td = document.createElement('td')
	td.className = 'info'
	td.innerText = tracker.info
	tr.appendChild(td)

	var path = tracker.date.replaceAll('/','')
	var html = []

	if (tracker.refer && tracker.refer !== '') {
		let refers = tracker.refer.split('#') /*多个文件以#分隔*/
		refers.forEach((e,i) => {
			if(e && e.length>0) {
				html.push('<a href="' + path + '/' + e + '" target="_blank">' + (i+1) + '</a>')
			}
		});
	}
	
	// 参考
	td = document.createElement('td')
	td.className = 'refer'
	td.innerHTML = html.join('')
	tr.appendChild(td)

	// 备注
	td = document.createElement('td')
	td.className = 'remark'
	td.innerText = tracker.remark
	tr.appendChild(td)

	// 执行
	td = document.createElement('td')
	td.className = 'leader'
	td.appendChild(createSelectElement(options, 'leader', tracker.leader))
	tr.appendChild(td)

	// 级别
	td = document.createElement('td')
	td.className = 'level'
	td.appendChild(createSelectElement(options, 'level', tracker.level))
	tr.appendChild(td)

	// 状态
	td = document.createElement('td')
	td.className = 'status'
	td.appendChild(createSelectElement(options, 'status', tracker.status))
	tr.appendChild(td)

	// 结果
	td = document.createElement('td')
	td.className = 'result'
	td.appendChild(createSelectElement(options, 'result', tracker.result))
	tr.appendChild(td)

	// 操作
	td = document.createElement('td')
	td.className = 'oper'
	td.appendChild(createButtonGroup())
	tr.appendChild(td)

	return tr
}

// 渲染表格
const showTrackerData = async () => {
	const TrackerData = await getTrackerData()
	const Options = await getOptions()

	var tbody = document.querySelector('tbody')

	TrackerData.forEach((e,i) => {
		tbody.appendChild(createTrackerDataLine(e, i+1, Options))
	});
}

const showNewButton = () => {
	var div = document.createElement('div')
	div.className = 'add'

	var btn = document.createElement('button')
	btn.className = 'add'
	btn.innerText = '+ new Bug Tracker'

	btn.addEventListener('click', (event) => {
		axios.get('/dicts').then((res) => {
			const options = res.data

			axios.get('/tracker/add').then((res) => {
				if (res.data.err) {
					document.getElementById('errmsg').innerHTML = res.data.err
				} else {
					const tbody = document.querySelector('tbody')
					const lines = tbody.querySelectorAll('tr')
					let idx = lines.length
					let element = createTrackerDataLine(res.data, idx, options)
					tbody.appendChild(element)
				}
			})
		})
	})

	div.appendChild(btn)
	document.getElementById('app').appendChild(div)
}

window.onload = () => {
	getOptions()
	getTrackerData()
	getPermission(document.getElementById('uid').innerText)
	showTrackerData()
	showNewButton()
}