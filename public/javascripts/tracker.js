var DICT = {}

window.onload = () => {
	if (DICT.product === undefined) {
		axios.get('/dicts/product').then((res) => {
			console.log(res.data)
			DICT.product = res.data
		})
	}

	if (DICT.leader === undefined) {
		axios.get('/users').then((res) => {
			console.log(res.data)
			DICT.leader = res.data
		})
	}

	if (DICT.level === undefined) {
		axios.get('/dicts/level').then((res) => {
			console.log(res.data)
			DICT.level = res.data
		})
	}

	if (DICT.status === undefined) {
		axios.get('/dicts/status').then((res) => {
			console.log(res.data)
			DICT.status = res.data
		})
	}

	if (DICT.result === undefined) {
		axios.get('/dicts/result').then((res) => {
			console.log(res.data)
			DICT.result = res.data
		})
	}
}

// const HeadLabel = ['序号','日期','产品','问题','描述','参考','执行','等级','状态','结果','备注']
// var TableData = []

// function createTableHead() {
// 	const trackerTableHead = document.getElementById('trackerTableHead')
// 	trackerTableHead.innerHTML = ''

// 	var tr = document.createElement('tr')
// 	HeadLabel.forEach((e,i,a) => {
// 		var th = document.createElement('th')
// 		th.innerText = e
// 		tr.appendChild(th)
// 	})

// 	trackerTableHead.appendChild(tr)
// }

// function createTableBody() {
// 	const trackerTableBody = document.getElementById('trackerTableBody')
// 	trackerTableBody.innerHTML = ''

// 	axios.get('/bug-tracker/list').then((res) => {
// 		console.log(res.data)

// 		TableData = res.data || []
// 		TableData.forEach((e,i,a) => {
// 			var path = e.date.replaceAll('/','')
// 			var refers = e.refer.split('#') /*多个文件以#分隔*/

// 			var referHtml = []
// 			refers.forEach((e,i) => {
// 				if(e && e.length>0) { referHtml.push('<a href="' + path + '/' + e + '" target="_blank">' + (i+1) + '</a>') }
// 			});

// 			var tr = document.createElement('tr')
// 			tr.id = e.seq
// 			tr.className = e.result==='done'?'success':e.result==='close'?'info':e.level==='2'?'danger':e.level==='1'?'warn':'primary'

// 			// 序号
// 			var td1 = document.createElement('td')
// 			td1.width = 60
// 			td1.innerText = i+1
// 			tr.appendChild(td1)

// 			// 日期
// 			var td2 = document.createElement('td')
// 			td2.width = 100
// 			td2.innerText = e.date
// 			tr.appendChild(td2)

// 			// 产品
// 			var td3 = document.createElement('td')
// 			td3.innerText = e.product
// 			tr.appendChild(td3)

// 			// 问题
// 			var td4 = document.createElement('td')
// 			td4.innerText = e.title
// 			tr.appendChild(td4)

// 			// 描述
// 			var td5 = document.createElement('td')
// 			td5.innerText = e.info
// 			tr.appendChild(td5)

// 			// 参考
// 			var td6 = document.createElement('td')
// 			td6.innerHTML = referHtml.join('')
// 			tr.appendChild(td6)

// 			// 执行
// 			var td7 = document.createElement('td')
// 			td7.innerText = e.leader
// 			tr.appendChild(td7)

// 			// 级别
// 			var td8 = document.createElement('td')
// 			td8.innerText = e.level
// 			tr.appendChild(td8)

// 			// 状态
// 			var td9 = document.createElement('td')
// 			td9.innerText = e.status
// 			tr.appendChild(td9)

// 			// 结果
// 			var tdA = document.createElement('td')
// 			tdA.innerText = e.result
// 			tr.appendChild(tdA)

// 			// 备注
// 			var tdB = document.createElement('td')
// 			tdB.innerText = e.remark
// 			tr.appendChild(tdB)

// 			// 操作
// 			var tdC = document.createElement('td')
// 			tdC.appendChild(createOperatorGroup())
// 			tr.appendChild(tdC)

// 			dataList.appendChild(tr)
// 		})
// 	})
// }


// window.onload = () => {
// 	getDataList()
// }

// function getDataList() {
// 	const dataList = document.getElementById('dataList')
// 	dataList.innerHTML = ''

// 	axios.get('/bug-tracker/list').then((res) => {
// 		console.log(res.data)

// 		TableData = res.data || []
// 		TableData.forEach((e,i,a) => {
// 			var path = e.date.replaceAll('/','')
// 			var refers = e.refer.split('#') /*多个文件以#分隔*/

// 			var referHtml = []
// 			refers.forEach((e,i) => {
// 				if(e && e.length>0) { referHtml.push('<a href="' + path + '/' + e + '" target="_blank">' + (i+1) + '</a>') }
// 			});

// 			var tr = document.createElement('tr')
// 			tr.id = e.seq
// 			tr.className = e.result==='done'?'success':e.result==='close'?'info':e.level==='2'?'danger':e.level==='1'?'warn':'primary'

// 			// 序号
// 			var td1 = document.createElement('td')
// 			td1.width = 60
// 			td1.innerText = i+1
// 			tr.appendChild(td1)

// 			// 日期
// 			var td2 = document.createElement('td')
// 			td2.width = 100
// 			td2.innerText = e.date
// 			tr.appendChild(td2)

// 			// 产品
// 			var td3 = document.createElement('td')
// 			td3.innerText = e.product
// 			tr.appendChild(td3)

// 			// 问题
// 			var td4 = document.createElement('td')
// 			td4.innerText = e.title
// 			tr.appendChild(td4)

// 			// 描述
// 			var td5 = document.createElement('td')
// 			td5.innerText = e.info
// 			tr.appendChild(td5)

// 			// 参考
// 			var td6 = document.createElement('td')
// 			td6.innerHTML = referHtml.join('')
// 			tr.appendChild(td6)

// 			// 执行
// 			var td7 = document.createElement('td')
// 			td7.innerText = e.leader
// 			tr.appendChild(td7)

// 			// 级别
// 			var td8 = document.createElement('td')
// 			td8.innerText = e.level
// 			tr.appendChild(td8)

// 			// 状态
// 			var td9 = document.createElement('td')
// 			td9.innerText = e.status
// 			tr.appendChild(td9)

// 			// 结果
// 			var tdA = document.createElement('td')
// 			tdA.innerText = e.result
// 			tr.appendChild(tdA)

// 			// 备注
// 			var tdB = document.createElement('td')
// 			tdB.innerText = e.remark
// 			tr.appendChild(tdB)

// 			// 操作
// 			var tdC = document.createElement('td')
// 			tdC.appendChild(createOperatorGroup())
// 			tr.appendChild(tdC)

// 			dataList.appendChild(tr)
// 		})
// 	})
// }

// function createOperatorGroup() {
// 	var div = document.createElement('div')
// 	div.className = 'btnGroup'

// 	var btnEdit = document.createElement('button')
// 	btnEdit.value = 'edit'
// 	btnEdit.innerText = '编辑'

// 	btnEdit.addEventListener('click', (event) => {
// 		var thisBtn = event.target

// 		if (thisBtn.value === 'edit') {
// 			thisBtn.value = 'save'
// 			thisBtn.innerText = '保存'
// 		} else {
// 			thisBtn.value = 'edit'
// 			thisBtn.innerText = '编辑'
// 		}
// 	})

// 	div.appendChild(btnEdit)

// 	var btnDelete = document.createElement('button')
// 	btnDelete.value = 'delete'
// 	btnDelete.innerText = '删除'

// 	btnDelete.addEventListener('click', (event) => {
// 		var thisBtn = event.target
// 	})

// 	div.appendChild(btnDelete)

// 	return div
// }