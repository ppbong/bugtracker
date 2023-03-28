function login() {
	var u = document.getElementById('u')
	var p = document.getElementById('p')
	var msg = document.getElementById('msg')

	if (u.value.trim() === '' || p.value.trim() === '') {
		msg.innerHTML = '<span class="danger">username or password not allow null</span>'
	} else {
		msg.innerHTML = ''

		axios.get('/login?u=' + u.value.trim() + '&p=' + p.value.trim())
		.then((res) => {
			var data = res.data
			if (data.result === 'pass') {
				msg.innerHTML = '<span class="success">' + data.msg + '</span>'
				// goto
				setTimeout(() => {
					window.location.href = '/tracker?u=' + u.value.trim()
				}, 500)
			} else {
				msg.innerHTML = '<span class="danger">' + data.msg + ': ' + data.reason + '</span>'
			}
		})
	}
}

window.onload = () => {
	document.querySelectorAll('input').forEach((e) => {
		e.addEventListener('focus', (event) => {
			document.getElementById('msg').innerHTML = ''
		})
	})
}