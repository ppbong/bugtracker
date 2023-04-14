// 数据
var trackerList = []
// 权限
var permission = []
// 数据字典
var options = {}
// 原始文件
var filesOrigin = []
// 上传文件
var filesUpload = []
// 删除文件
var filesDelete = []

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

// 创建导航链接
const createNavLink = () => {
	if (-1 === permission.indexOf('config')) return;

	$('div.nav').append('<a href="/config">系统参数设置</a>')
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
		html.push('<td class="product"><select name="product" aria-label="Product">'+ options.product +'</select></td>')
		html.push('<td class="title">'+ element.title +'</td>')
		html.push('<td class="descr">'+ element.descr +'</td>')

		// 参考文件
		if ( element.refer === undefined || element.refer === '') {
			html.push('<td class="refer"></td>')
		} else {
			var files = element.refer.split('|')
			html.push('<td class="refer">')
			files.forEach((e,idx) => {
				html.push('<a href="files/' + element.seq + '/' + e + '" target="_blank">' + (idx+1) + '</a>')
			})
			html.push('</td>')
		}
		
		html.push('<td class="remark" title="'+ element.remark +'">'+ element.remark.substring(0,6) +' ...</td>')

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
		: ''
		// : tracker.level === 'high' ? 'danger'
		// : tracker.level === 'medium' ? 'warn'
		// : 'primary'
}

// 新建按钮
const createNewButton = () => {
	if (permission.indexOf('add') === -1) return

	$('#app').after('<div class="buttonGroup"><button id="create" type="button" class="primary">+ new Bug Tracker</button></div>')

	$('#create').click((event) => {
		createTrackrForm('new', undefined)
	})
}

// 创建表单（新增/编辑）
const createTrackrForm = (operator = 'new', idx) => {
	filesOrigin = filesDelete = filesUpload = []

	var html = []

	html.push('<form>')
	html.push('<input id="seq" value="" type="hidden" aria-label="Sequence">')
	html.push('<div><label for="index">序号</label><input id="index" value="" disabled></div>')
	html.push('<div><label for="date">日期</label><input id="date" value="'+ getNowDate() +'" type="date"></div>')
	html.push('<div><label for="product">产品</label><select id="product">'+ options.product +'</select></div>')
	html.push('<div><label for="title">问题</label><input id="title" value=""></div>')
	html.push('<div><label for="descr">描述</label><input id="descr" value=""></div>')
	html.push('<div><label for="remark">备注</label><input id="remark" value=""></div>')

	html.push('<div>')
	html.push('<label for="leader">负责</label><select id="leader">'+ options.leader +'</select>')
	html.push('<label for="level">等级</label><select id="level">'+ options.level +'</select>')
	html.push('<label for="status">状态</label><select id="status">'+ options.status +'</select>')
	html.push('<label for="result">结果</label><select id="result">'+ options.result +'</select>')
	html.push('</div>')

	// 参考文件
	html.push('<div><label for="refer">参考</label><input id="refer" type="file" accept=".png,.pdf,.txt" multiple></div>')
	// 分割线
	html.push('<div class="divider"></div>')
	// 参考文件列表
	html.push('<div class="referList"></div>')
	// 分割线
	html.push('<div class="divider"></div>')

	html.push('<div class="buttonGroup">')
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

		filesOrigin = tracker.refer === '' ? [] : tracker.refer.split('|')

		// 添加原有参考文件显示
		createReferList(filesOrigin, false)
	}

	$('#save').click((event) => {
		// event.preventDefault()
		let trackerNew = {
			seq: $('#seq').val(),
			date: $('#date').val(),
			product: $('#product').val(),
			title: $('#title').val(),
			descr: $('#descr').val(),
			refer: [...filesOrigin,...filesUpload].join('|'),
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

			uploadFile($('#refer')[0].files, data.seq).then(() => {
				// 重新渲染表格（序号连续性）
				createTrackerTable()
				createTrackerTableLine(trackerList)
			})

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

	$('#refer').change(event => {
		console.log(event.target.files)

		filesUpload = []
		for (const file of event.target.files) filesUpload.push(file.name)

		// 添加新增参考文件显示
		createReferList(filesUpload, true)
	})
}

// 表单中参考文件列表（原有、新增）
const createReferList = (fileList = [], isFromInput = false) => {
	const className = isFromInput ? 'newFile' : 'oldFile'
	
	$('.' + className).remove() // 避免重复项
	
	fileList.forEach(element => {
		$('<div class="'+ className +'"><label>'+ element +'</label><button class="small danger">-</button></div>')
		.find('button').click(event => {
			$(event.target.parentNode).remove()
			if (event.target.parentNode.className === 'newFile') {
				let idx = filesUpload.indexOf(element)
				filesUpload.splice(idx, 1)
			} else {
				let idx = filesOrigin.indexOf(element)
				filesOrigin.splice(idx, 1)
				filesDelete.push(element)
			}
		}).end()
		.appendTo($('.referList'))
	})
}

// 文件上传
const uploadFile = (files, seq) => { // event.target.files
	return new Promise((resolve, reject) => {
		// 删除文件
		if (filesDelete.length > 0) {
			axios.post('/tracker/files/remove/' + seq, filesDelete).then(res => {
				console.log(res)
				if (res.err) reject(res.err)
			})
		}

		const opt = { headers: {'Content-Type':'multipart/form-data'} }
		for(const file of files) {
			if (filesUpload.indexOf(file.name) === -1) continue

			let forms = new FormData()
			forms.append('refer', file)
			axios.post('/tracker/files/upload/' + seq, forms, opt).then(res => {
				console.log(res)
				if (res.err) reject(res.err)
			})
		}

		resolve('done')
	})
}

window.onload = async () => {
	await getOptions()
	await getPermission()
	await getTrackerList()
	createNavLink()
	createTrackerTable()
	createTrackerTableLine(trackerList)
	createNewButton()
}
