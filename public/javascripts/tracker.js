const DataList = ['product', 'leader', 'level',  'status', 'result']

const createDataListElement = (name) => {
	return new Promise((resolve, reject) => {
		if (-1 === DataList.indexOf(name)) {
			reject('createDataList(name) => name invalid')
		}

		var id = name + '_list'
		var element = document.getElementById(id)

		if (element) {
			reject('createDataList(name) => element exist')
		}

		element = document.createElement('datalist')
		element.id = id

		var url = name === 'leader' ? '/users/leader' : '/dicts/' + name

		axios.get(url).then((res) => {
			if (res.data.err) {
				reject(res.data.err)
			}

			let list = res.data

			list.forEach((e) => {
				let option = document.createElement('option')
				option.label = e.label
				option.value = e.value

				element.appendChild(option)
			})

			resolve(element)
		})
	})
}

const createDataList = () => {
	const app = document.getElementById('app')

	DataList.forEach(async (e) => {
		var datalist = await createDataListElement(e)
		if (datalist != null) {
			app.appendChild(datalist)
		}
	})
}

const getPermission = (user) => {
	return new Promise((resolve,reject) => {
		axios.get('/users/permission/' + user).then((res) => {
			console.log(res.data)
			resolve(res.data)
		})
	})
}

const getTrackerData = () => {
	return new Promise((resolve,reject) => {
		axios.get('/tracker/list').then((res) => {
			console.log(res.data)
			resolve(res.data)
		})
	})
}

// 创建选项元素
const createSelectElement = (name, value) => {
	var id = name + '_list'
	var datalist = document.getElementById(id)

	if (datalist === null) {
		console.log('createSelectElement() => id invalid')
		return null
	}

	var element = document.createElement('select')
	element.name = name
	element.className = value

	var options = datalist.querySelectorAll('option')
	options.forEach((e) => {
		var option = document.createElement('option')
		option.value = e.value
		option.label = e.label
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

const createTrackerDataLine = (tracker, idx) => {
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
	td.addEventListener('click', (event) => {
		let td = event.target
		let input = document.createElement('input')
		input.type = 'date'
		input.value = event.target.innerText.replaceAll('/','-') 
		input.addEventListener('change', (e) => {
			let td = e.target.parentNode
			console.log(e.target.value)
			td.innerHTML = e.target.value
		})
		td.innerHTML = ''
		td.appendChild(input)
	})
	tr.appendChild(td)

	// 产品
	td = document.createElement('td')
	td.className = 'product'
	td.appendChild(createSelectElement('product', tracker.product))
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
	td.appendChild(createSelectElement('leader', tracker.leader))
	tr.appendChild(td)

	// 级别
	td = document.createElement('td')
	td.className = 'level'
	td.appendChild(createSelectElement('level', tracker.level))
	tr.appendChild(td)

	// 状态
	td = document.createElement('td')
	td.className = 'status'
	td.appendChild(createSelectElement('status', tracker.status))
	tr.appendChild(td)

	// 结果
	td = document.createElement('td')
	td.className = 'result'
	td.appendChild(createSelectElement('result', tracker.result))
	tr.appendChild(td)

	// 操作
	td = document.createElement('td')
	td.className = 'oper'
	td.appendChild(createButtonGroup())
	tr.appendChild(td)

	return tr
}

const createNewForm = (router, tracker) => {
	router = router === 'add' || router === 'edit' ? router : 'add'

	const dateFormat = new Intl.DateTimeFormat('zh-CN', {year:'numeric', month:'2-digit', day:'2-digit'}).format

	var t = tracker || {
		seq: '',
		date: dateFormat(new Date()).replaceAll('/','-'),
		product: '',
		title: '',
		info: '',
		refer: '',
		leader: '',
		level: '',
		status: '',
		result: '',
		remark: '' 
	}

	var form = document.createElement('form')
	form.method = 'POST'
	form.action = router === 'add' ? '/tracker/add' : '/tracker/update'

	var html = []
	html.push('<div><label for="seq">流水号</label>')
	html.push('<input name="seq" type="text" value="'+ t.seq +'" disabled></div>')
	html.push('<div><label for="date">日期</label>')
	html.push('<input name="date" type="date" value="'+ t.date +'"></div>')
	html.push('<div><label for="product">产品</label>')
	html.push('<input name="product" type="text" value="'+ t.product +'" list="product_list"></div>')
	html.push('<div><label for="title">问题</label>')
	html.push('<input name="title" type="text" value="'+ t.title +'"></div>')
	html.push('<div><label for="info">描述</label>')
	html.push('<input name="info" type="text" value="'+ t.info +'"></div>')
	html.push('<div><label for="refer">参考</label>')
	html.push('<input name="refer" type="file" value="'+ t.refer +' multiple"></div>')
	html.push('<div><label for="remark">备注</label>')
	html.push('<input name="remark" type="text" value="'+ t.remark +'"></div>')
	html.push('<div><label for="leader">执行</label>')
	html.push('<input name="leader" type="text" value="'+ t.leader +'" list="leader_list"></div>')
	html.push('<div><label for="level">等级</label>')
	html.push('<input name="level" type="text" value="'+ t.level +'" list="level_list"></div>')
	html.push('<div><label for="status">状态</label>')
	html.push('<input name="status" type="text" value="'+ t.status +'" list="status_list"></div>')
	html.push('<div><label for="result">结果</label>')
	html.push('<input name="result" type="text" value="'+ t.result +'" list="result_list"></div>')
	html.push('<div><input type="submit" name="save" value="保存">')
	html.push('<input type="button" name="cancel" value="取消"></div>')

	form.innerHTML = html.join('')

	var cancel = form.querySelector('input[name="cancel"]')
	cancel.addEventListener('click', (event) => {
		let form = event.target.parentNode

		form.parentNode.removeChild(form)
	})

	form.appendChild(cancel)

	document.getElementById('app').appendChild(form)
}

// 渲染表格
const showTrackerData = async () => {
	const TrackerData = await getTrackerData()
	var tbody = document.querySelector('tbody')

	TrackerData.forEach((e,i) => {
		tbody.appendChild(createTrackerDataLine(e, i+1))
	});
}

const showNewButton = () => {
	var div = document.createElement('div')
	div.className = 'add'

	var btn = document.createElement('button')
	btn.className = 'add'
	btn.innerText = '+ new Bug Tracker'

	btn.addEventListener('click', (event) => {
		createNewForm('add')
	})

	div.appendChild(btn)
	document.getElementById('app').appendChild(div)
}

window.onload = () => {
	createDataList()
	showTrackerData()
	showNewButton()
}
