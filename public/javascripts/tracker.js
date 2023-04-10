var trackerList = null
var permission = null

const _getOptions = (name) => {
	return new Promise((resolve, reject) => {
		var url = name === 'leader' ? '/users/leader' : '/dicts/' + name

		axios.get(url).then((res) => {
			if (res.data.err) {
				reject(res.data.err)
			} else {
				console.log(res.data)
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
			console.log(res.data)
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
			console.log(res.data)
			resolve(res.data)
		})
	})
}

// 获取数据列表
const getTrackerList = async () => {
	trackerList = await _getTrackerList()
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

	// 序号
	$('.template > .index').html(idx)

	// 日期
	$('.template > .date').html(tracker.date)

	// 产品
	$('.template > .product').find('select > option').each((i,e) => {
		e.value === tracker.product ? e.selected = true : e.selected = false
	})

	// 问题
	$('.template > .title').html(tracker.title)

	// 描述
	$('.template > .descr').html(tracker.descr)

	// 参考
	$('.template > .refer').html(referHtml.join(''))

	// 备注
	$('.template > .remark').html(tracker.remark)

	// 负责人
	$('.template > .leader').find('option').each((i,e) => {
		e.value === tracker.leader ? e.selected = true : e.selected = false
	})

	// 级别
	$('.template > .level').find('option').each((i,e) => {
		e.value === tracker.level ? e.selected = true : e.selected = false
	})

	// 状态
	$('.template > .status').find('select > option').each((i,e) => {
		e.value === tracker.status ? e.selected = true : e.selected = false
	})

	// 结果
	$('.template > .result').find('select > option').each((i,e) => {
		e.value === tracker.result ? e.selected = true : e.selected = false
	})

	$('.template').before($('.template').clone().attr('id', tracker.seq).attr('class', className))
}

const showTrackerForm = (operator = 'add', idx) => {
	const index = idx - 1

	console.log(idx)

	if (operator === 'edit') {
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

window.onload = async () => {
	await getOptions()
	await getPermission()
	await getTrackerList()
	showTrackerTable()
	showTrackerForm()
}
