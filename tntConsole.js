(function () {
    function TNTConsole() {
        this.view = this.utils.parse('<div console> <style type="text/css"> .console {z-index: 999999999; position: fixed; left: 0; right: 0; bottom: -1px; font-size: 12px; font-family: Menlo, Monaco, Consolas, "Courier New", monospace; line-height: 1.5; background: rgba(255, 255, 255, .98); box-shadow: rgba(0, 0, 0, 0.2) 0px 0 15px 0; transition: .5s; max-height: 0; max-height: 500px; display: none; } .console * {font: inherit; box-sizing: border-box; } .console.show {display: block; } .console.closed {max-height: 0; } .console.closed .f12 {opacity: .8; } .console .f12 {position: absolute; bottom: 100%; right: 0; background: rgba(255, 255, 255, .98); border: solid 1px #eee; border-bottom: 0; border-radius: 5px 5px 0 0; padding: 5px; box-shadow: rgba(0, 0, 0, 0.1) 4px -4px 10px -4px; color: #555; letter-spacing: -1px; cursor: pointer; } .console ul {list-style: none; margin: 0; padding: 0; padding-bottom: 3em; margin-bottom: -3em; max-height: 350px; overflow: auto; } /* ios 滚动异常 */ @media all{.console ul {height: 350px; -webkit-overflow-scrolling: touch; } .console ul:before {content:""; width: 1px; float: left; height: calc(100% + 1px); margin-left: -1px; } } .console ul li {padding: .5em; border-bottom: solid 1px #f7f7f7; overflow: auto; -webkit-overflow-scrolling: touch; } .console ul li>.obj {float: left; max-width: 100%; padding: 0 .5em; } .console .log {color: #555; } .console .info {background: #f3faff; color: #0095ff; } .console .warn {background: #fffaf3; color: #FF6F00; } .console .error {background: #fff7f7; color: red; } .console .cmd {position: relative; background: #fff; color: #0af; } .console .cmd .key:before {content: "$ "; position: absolute; left: 0; color: #ddd; } .console .obj {cursor: default; white-space: nowrap; } .console .obj:after {content: ""; display: table; clear: both; } .console .key {/*float: left;*/ /*margin-right: 1ex;*/ color: #a71d5d; } .console .value {} .console .value.tag {color: #a71d5d; } .console .children {clear: both; padding-left: 2em; border-left: dotted 1px #ddd; display: none; } .console .open>.value {white-space: pre; overflow: visible; max-width: none; } .console .open>.children {display: block; } .console .input {line-height: 1.25; display: block; width: 100%; border: none; outline: none; height: 3em; padding: .25em 1em; resize: none; position: relative; background: rgba(255, 255, 255, .8); } </style> <div class="console"> <span class="f12">F12</span> <ul> <li> <div class="obj"> <span class="key"></span> <span class="value"></span> <div class="children"></div> </div> </li> </ul> <textarea class="input" placeholder="$"></textarea> </div> </div>')
        this.ConsoleEl = this.utils.find(this.view, 'console')
        this.F12El = this.utils.find(this.ConsoleEl, 'f12')
        this.UlEl = this.utils.find(this.ConsoleEl, 'ul')
        this.LiEl = this.utils.find(this.ConsoleEl, 'li')
        this.ObjEl = this.utils.find(this.ConsoleEl, 'obj')
        this.ChildrenEl = this.utils.find(this.ConsoleEl, 'children')
        this.InputEl = this.utils.find(this.ConsoleEl, 'input')
    }

    var subClass = Object.create(null);
    Object.defineProperty(subClass, 'utils', {
        enumerable: true,
        configurable: true,
        get: function () {
            return {
                noop: function () {
                },

                extend: function (obj, _obj) {
                    for (var k in _obj) {
                        obj[k] = _obj[k]
                    }
                    return obj
                },

                toArray: function (arrayLike) {
                    var arr = [];
                    var length = arrayLike.length;
                    while (length--) {
                        arr[length] = arrayLike[length];
                    }
                    return arr;
                },

                typeOf: function (obj) {
                    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
                },

                escapeTag: function (html) {
                    return html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                },

                parse: function (html) {
                    var el = this.parse.el = this.parse.el || document.createElement('div')
                    el.innerHTML = html
                    return el.children[0]
                },
                find: function (el, selector) {
                    for (var i = 0; i < el.children.length; i++) {
                        var child = el.children[i]
                        if (selector == child.className || selector == child.tagName.toLowerCase()) {
                            return child
                        } else {
                            var r = this.find(child, selector)
                            if (r) {
                                return r
                            }
                        }
                    }
                },
                addClass: function (el, className) {
                    el.className += ' ' + className
                },
                removeClass: function (el, className) {
                    el.className = el.className.replace(RegExp(' *' + className, 'ig'), '')
                },
                hasClass: function (el, className) {
                    return el.className.match(className)
                },
                toggleClass: function (el, className) {
                    if (this.hasClass(el, className)) {
                        this.removeClass(el, className)
                    } else {
                        this.addClass(el, className)
                    }
                }
            }
        }
    })
    TNTConsole.prototype ={
        constructor: TNTConsole,
        init: function () {
            var _self = this
            // 手机预先拦截，以接管 console
            // if (navigator.userAgent.match(/mobile/i)) {
            //     this.intercept()
            // }
            // #f12 显示
            if (location.href.match(/[?&#]f12/) && navigator.userAgent.match(/mobile/i)) {
                this.utils.addClass(this.ConsoleEl, 'show')
                this.intercept()
            }
            // #f12 切换
            addEventListener('hashchange', function (e) {
                if (location.hash.match('#f12')) {
                    _self.intercept()
                    _self.utils.addClass(_self.ConsoleEl, 'show')
                } else {
                    _self.utils.removeClass(_self.ConsoleEl, 'closed')
                }
            })
        },

        intercept: function () {
            var _self = this
            if (this.intercept.bool) {
                return
            }
            this.intercept.bool = true

            // _console 副本
            var con = {
                log: this.utils.noop,
                info: this.utils.noop,
                warn: this.utils.noop,
                error: this.utils.noop,
                dir: this.utils.noop
            }
            // window.console = window.console || con
            var _console = this.utils.extend({}, window.console)

            // console 拦截
            for (var type in con) {
                !function (type) {
                    console[type] = function () {
                        _console[type].apply(console, arguments)
                        _self.printLi(type, arguments, type == 'dir')
                    }
                }(type)
            }

            // 捕获 js 异常
            addEventListener('error', function (e) {
                _self.printLi('error', converErrors([e]))
                // true 捕获阶段，能捕获 js css img 加载异常
            }, true)
            // xxx.file m:n
            function converErrors(arr) {
                if (arr.length == 1) {
                    var e = arr[0]
                    var target = e.target
                    var src = target.src || target.href
                    if (src) {
                        var tag = e.target.outerHTML
                        src = decodeURIComponent(src)
                        return [{
                            tag: tag,
                            event: e,
                            _toConsole: function () {
                                return src
                            }
                        }]
                    } else {
                        e._toConsole = function () {
                            return e.message
                        }
                        return [e, e.filename, e.lineno + ':' + e.colno]
                    }
                }
                return arr
            }
            // console 折叠
            this.F12El.onclick = function () {
                _self.utils.toggleClass(_self.ConsoleEl, 'closed')
            }
            // 插入视图
            setTimeout(function () {
                document.body.appendChild(_self.view)

                // 执行 js
                _self.InputEl.onkeydown = function (event) {
                    var code = _self.InputEl.value

                    // 换行
                    if (event.keyCode == 13 && code.match(/[[{(,;]$/)) {
                        return
                    }
                    // 清空
                    if (event.keyCode == 13 && code === '') {
                        UlEl.innerHTML = '';
                        return false;
                    }
                    // 打印与执行
                    if (event.keyCode == 13) {
                        // 打印输入
                        _self.printLi('cmd', [code])

                        // 选择完清空输入框，滚动
                        setTimeout(function () {
                            _self.InputEl.value = ''
                            _self.UlEl.scrollTop += 9999
                        }, 41)

                        // 执行
                        code = code.match(/^\s*{/) ? '(' + code + ')' : code; // ({})
                        // var rs = window.eval(code)
                        var rs = Function('return '+ code )()
                        // 打印结果
                        console.log(rs)
                        return false
                    }
                }
            }, 1)
        },
        // print
        printLi : function (type, objs, isDir) {
            var _self = this

            // 复制一个 li
            var liEl = this.LiEl.cloneNode(true)
            this.utils.addClass(liEl, type)
            liEl.innerHTML = ''
            this.UlEl.appendChild(liEl)

            // 打印 log(a,b,c) 多个参数
            for (var i = 0; i < objs.length; i++) {
                this.printObj('', objs[i], liEl, isDir)
            }

            // 限制打印列表长度
            if (this.UlEl.children.length > 100) {
                this.UlEl.removeChild(this.UlEl.children[0])
            }

            return liEl
        },
        printObj : function (key, value, target, isDir) {
            var _self = this
            // 复制一个 obj view
            var objEl = this.ObjEl.cloneNode(true)
            var keyEl = this.utils.find(objEl, 'key')
            var valueEl = this.utils.find(objEl, 'value')
            var childrenEl = this.utils.find(objEl, 'children')
            target.appendChild(objEl)
            // value print convert
            var kvs = this.printConvert(key, value, isDir)
            keyEl.innerText = kvs.key
            valueEl.innerHTML = this.utils.escapeTag(kvs.string)
            value = kvs.value
            this.utils.addClass(valueEl, kvs.type)

            // 点击时遍历对象
            keyEl.onclick = valueEl.onclick = function () {
                window.v = value

                // toggle children, value...
                _self.utils.toggleClass(objEl, 'open')

                // 是否已经打印过了
                if (valueEl._printed) {
                    return
                }
                valueEl._printed = true

                if (typeof value != 'object') return
                var isArray = this.utils.typeOf(value) == 'array'

                // 打印 children
                for (var i in value) {
                    _self.printObj(i, value[i], childrenEl, isDir)
                    // 过长
                    if (isArray && i > 500) {
                        _self.printObj('...', '', childrenEl, isDir)
                        return
                    }
                }

                // UlEl.scrollTop += 10
                // UlEl.scrollTop -= 10
            }
        },

        printConvert : function (key, value, isDir) {
            var string = value
            var type
            if (value && !value.toString && !value.valueOf) {
                string = '{...}'
            }
            if (!isDir) {

                // node
                if (value && value.nodeType) {
                    var node = value
                    var nodeType = node.nodeType

                    // doctype
                    if (nodeType == 10) {
                        string = '<!DOCTYPE html>'
                    }
                    // tag
                    else if (nodeType == 1) {
                        var tag = node.cloneNode().outerHTML
                        var tag_lr = tag.split('></')
                        var tagl = tag_lr[0] + (tag_lr[1] ? '>' : '') // ?有无闭合标签
                        var tagr = '</' + tag_lr[1]
                        string = tagl
                        type = 'tag'
                    }
                    // text
                    else if (nodeType == 3) {
                        string = node.nodeValue
                    }
                    // #document
                    else if (nodeType == 9) {
                        string = node.nodeName
                        type = 'tag'
                    }
                    // commemt
                    else if (nodeType == 8) {
                        string = '<!--' + node.nodeValue + '-->'
                    }

                    // childNodes
                    value = this.utils.toArray(node.childNodes)
                    if (!isNaN(key)) {
                        key = ''
                    }
                }

                // array
                else if (this.utils.typeOf(value) == 'array') {
                    string = value.length + '[' + value + ']'
                }

                // _toConsole
                else if (value && value._toConsole) {
                    string = value._toConsole()
                    delete value._toConsole
                }

            }

            return {
                key: key,
                value: value,
                string: string + '',
                type: type
            }
        }
    }
    subClass.utils.extend(TNTConsole.prototype, subClass)

    new TNTConsole().init()
})()
