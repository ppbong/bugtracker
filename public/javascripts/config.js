const supportPermission = ['add','del','edit','leader','level','status','result','config']

const createFieldSet = (id = 'product') => {
    var html = []
    html.push('<fieldset id="' + id + '">')
    html.push('<legend>' + id + '</legend>')
    html.push('<table><thead><tr><th>Value</th><th>Lable</th><th>Remark</th><th></th></tr></thead>')
    html.push('<tbody></tbody></table>')
    html.push('</fieldset>')

    $('#app').append(html.join(''))
}

const appendTableData = (id, list = []) => {
    list.forEach(element => {
        let html = []
        html.push('<tr>')
        html.push('<td><input name="value" value="'+ element.value +'"></td>')
        html.push('<td><input name="label" value="'+ element.label +'"></td>')
        html.push('<td><input name="remark" value="'+ element.remark +'"></td>')
        html.push('<td><button class="new primary" name="new">+</button><button class="del danger" name="del">-</button></td>')
        html.push('</tr>')

        $('#' + id).find('tbody').append(html.join(''))
    })
}

const createFieldSet2 = (id = 'permission') => {
    var html = []
    html.push('<fieldset id="' + id + '">')
    html.push('<legend>' + id + '</legend>')
    html.push('<table><thead><tr><th>Username</th><th>Password</th><th>CName</th><th>Remark</th><th>Permission</th><th></th></tr></thead>')
    html.push('<tbody></tbody></table>')
    html.push('</fieldset>')

    $('#app').append(html.join(''))
}

const appendTableData2 = (id = 'permission', list = []) => {
    list.forEach(element => {

        let permissions = element.permission ? element.permission.split('|') : []

        let disabled = element.username === 'admin' ? ' disabled' : ''

        let html = []
        html.push('<tr>')        
        html.push('<td><input name="username" value="'+ element.username +'" '+ disabled +'></td>')
        html.push('<td><input type="password" name="password" value="'+ element.password +'"' + disabled + '></td>')
        html.push('<td><input name="cname" value="'+ element.cname +'"'+ disabled +'></td>')
        html.push('<td><input name="remark" value="'+ element.remark +'"' + disabled + '></td>')
        html.push('<td>')
        supportPermission.forEach(e => {
            if (permissions.indexOf(e) === -1) {
                html.push('<input type="checkbox" name="' + e + '"'+ disabled +'><label for="' + e +'">' + e + '</label>')
            } else {
                html.push('<input type="checkbox" name="' + e + '" checked' + disabled + '><label for="' + e +'">' + e + '</label>')
            }
        })
        html.push('</td>')
        if (element.username === 'admin') {
            html.push('<td><button class="new primary" name="new">+</button></td>')
        } else {
            html.push('<td><button class="new primary" name="new">+</button><button class="del danger" name="del">-</button></td>')
        }
        html.push('</tr>')

        $('#' + id).find('tbody').append(html.join(''))
    })
}

const prepareConfig = () => {
    ['product', 'level', 'status', 'result'].forEach(element => {
        createFieldSet(element)

        axios.get('/dicts/' + element).then(res => {
            appendTableData(element, res.data)
        })
    })

    createFieldSet2('permission')

    axios.get('/users/list').then(res => {
        console.log(res.data)
        appendTableData2('permission', res.data)
    })

    var html = []
    html.push('<div>')
    html.push('<button class="save primary" name="save">保存</button>')
    html.push('<button class="back info" name="back">返回</button>')
    html.push('</div>')

    $('#app').append(html.join(''))
}

const styleAdjust = () => {
    $('fieldset').css({
        // width: '80%',
        margin: '5px auto',
    })

    $('#app').find('.save').css({
        padding: '2px 45px',
    }).end()
    .find('.back').css({
        padding: '2px 45px',
        marginLeft: '5px',
    })
    .parent().css({
        width: '100%',
        textAlign: 'center',
    })
}

const addEventListen = () => {
    $( document ).click((event) => {
        if (event.target.nodeName !== 'BUTTON') return

        var id = '', data = []

        if (event.target.name === 'new') {
            id = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.id
            if (id === 'permission') {
                data = [{
                    username: '',
                    password: '',
                    cname: '',
                    remark: '',
                    permissions: ''
                }]

                appendTableData2(id, data)
            } else {
                data = [{
                    value: '',
                    label: '',
                    remark: ''
                }]

                appendTableData(id, data)
            }
        } else if (event.target.name === 'del') {
            let tr = event.target.parentNode.parentNode
            if (tr.parentNode.children.length > 1) {
                tr.parentNode.removeChild(tr)
            }
        } else if (event.target.name === 'save') {
            var invalidCnt = 0
            $('input[name!="remark"]').each((i,e) => {
                if (e.value.trim() === '') {
                    invalidCnt += 1
                }
            })
            if (invalidCnt > 0) {
                alert('has ' + invalidCnt + ' invalid input')
                return
            }

            var data = {
                product: [],
                level: [],
                status: [],
                result: [],
                permission: []
            }

            const _readLineData = (e) => {
                return {
                    value: $(e).find('input[name="value"]').val(),
                    label: $(e).find('input[name="label"]').val(),
                    remark: $(e).find('input[name="remark"]').val(),
                }
            }

            const _readLineData2 = (e) => {
                let buff = []
                $(e).find('input:checked').each((idx,element) => {
                    buff.push(element.name)
                })

                return {
                    username: $(e).find('input[name="username"]').val(),
                    password: $(e).find('input[name="password"]').val(),
                    cname: $(e).find('input[name="cname"]').val(),
                    remark: $(e).find('input[name="remark"]').val(),
                    permission: buff.join('|')
                }
            }

            $('#product').find('tbody').find('tr').each((i,e) => {
                data.product.push(_readLineData(e))
            })

            $('#level').find('tbody').find('tr').each((i,e) => {
                data.level.push(_readLineData(e))
            })

            $('#status').find('tbody').find('tr').each((i,e) => {
                data.status.push(_readLineData(e))
            })

            $('#result').find('tbody').find('tr').each((i,e) => {
                data.result.push(_readLineData(e))
            })

            $('#permission').find('tbody').find('tr').each((i,e) => {
                data.permission.push(_readLineData2(e))
            })

            axios.post('/config/save', data).then(res => {
                alert(res.data)
            })
        } else if (event.target.name === 'back') {
            location.href = '/tracker'
        } else {
            console.log('unknown button event')
        }
    })
}

$( document ).ready(() => {
    prepareConfig()
    styleAdjust()
    addEventListen()
})