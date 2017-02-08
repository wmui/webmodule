/**
 * author：webmodule
 * webmodule.cn
 */
// 顶层对象
var WM = function() {};
WM.prototype = {
    extend: function(target, source) {
        for (var i in source) {
            target[i] = source[i];
        }
        return target;
    }
};
WM = new WM();
/*基础模块*/
WM.extend(WM, {
    // 节流函数
    throttle: function(fn, delay, duration) {
        var timer = null,begin = new Date();
        return function() {
            var context = this,args = arguments,current = new Date();
            clearTimeout(timer);
            if (current - begin >= duration) {
             fn.apply(context, args);
             begin = current;
            }else{
                timer = setTimeout(function(){
                    fn.apply(context,args);
                },delay)
            }
        }
    }
});
/* 事件模块 */
WM.extend(WM, {
    /*绑定事件*/
    on: function(dom, type, fn) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        if (dom.addEventListener) {
            dom.addEventListener(type, fn, false);
        } else if (dom.attachEvent) {
            //如果支持 --IE
            dom.attachEvent('on' + type, fn);
        }
    },
    /*解除事件*/
    un: function(dom, type, fn) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        if (dom.removeEventListener) {
            dom.removeEventListener(type, fn);
        } else if (dom.detachEvent) {
            dom.detachEvent(type, fn);
        }

    },
    /*点击*/
    click: function(dom, fn) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        WM.on(dom, 'click', fn);
    },
    /*鼠标移上*/
    mouseenter: function(dom, fn) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        WM.on(dom, 'mouseenter', fn);
    },
    /*鼠标离开*/
    mouseleave: function(dom, fn) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        WM.on(dom, 'mouseleave', fn);
    },
    /*悬浮*/
    hover: function(dom, fnEnter, fnLeave) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        if (fnEnter) {
            WM.on(dom, "mouseenter", fnEnter);
        }
        if (fnLeave) {
            WM.on(dom, "mouseleave", fnLeave);
        }
    },
    getEvent: function(event) {
        return event ? event : window.event;
    },
    getTarget: function(event) {
        var event = WM.getEvent(event);
        return event.target || event.srcElement;
    },
    stopPropagation: function(event) {
        var event = WM.getEvent(event);
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },
    preventDefault: function() {
        var event = WM.getEvent(event);
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },
});

/* 选择器模块 */
WM.extend(WM, {
    // id选择器
    id: function(id) {
        return document.getElementById(id);
    },

    // 标签选择器 WM.tag('span','#demo') or WM.tag('span',demo);
    tag: function(tag, context) {
        if (arguments.length === arguments.callee.length) {
            if (typeof context === 'string') {
                var first = context.charAt(0);
                var index = context.indexOf(first);
                context = WM.id(context.slice(index + 1));
            }
            return context.getElementsByTagName(tag);
        } else {
            return document.getElementsByTagName(tag);
        }

    },

    // class选择器
    class: function(className, context) {
        var arr = [];
        var elements;
        // 如果传进来两个参数
        if (arguments.length === arguments.callee.length) {

            if (typeof context === 'string') {
                // 接收到选择器
                context = WM.id(context);
            }
            if (context.getElementsByClassName) {
                return context.getElementsByClassName(className);
            } else {
                elements = context.getElementsByTagName('*');
                for (var i = 0; i < elements.length; i++) {
                    if (elements[i].className && elements[i].className === className) {
                        arr.push(elements[i])
                    }
                }

            };

        } else {
            if (document.getElementsByClassName) {
                return document.getElementsByClassName(className);
            } else {
                elements = document.getElementsByTagName('*');
                for (var i = 0; i < elements.length; i++) {
                    if (elements[i].className && elements[i].className === className) {
                        arr.push(elements[i])
                    }
                }
            }
        }
        return arr;
    },

    // 分组选择器 WM.group('#demo,.demo,span')
    group: function(selector) {
        // 思路：把字符串切割成数组，遍历每一项，判断第一个字符调用不同的方法
        var list = [],
            result = [];
        var arr = WM.trim(selector).split(',');
        for (var i = 0; i < arr.length; i++) {
            var item = WM.trim(arr[i]);
            var first = item.charAt(0); // 获得第一个字符
            var index = item.indexOf(first); // 获得第一个字符的下标位置
            if (first === '.') {
                list = WM.class(item.slice(index + 1)); // 获得类名，只有一项,是一个伪数组
                WM.pushArray(list, result);
            } else if (first === '#') {
                list = [WM.id(item.slice(index + 1))]; // 获取id
                WM.pushArray(list, result);
            } else {
                list = WM.tag(item);
                WM.pushArray(list, result);
            }
        };
        return result;
    },

    // 层次选择器 WM.group('#demo .demo span')
    layer: function(selector) {
        // 思路：切割字符串，判断每一项，如果是标签或者class
        var arr = WM.trim(selector).split(' ');
        var result = [],
            list = [];
        for (var i = 0; i < arr.length; i++) {
            list = []; // 下次循环清空所有
            var item = WM.trim(arr[i]);
            var first = item.charAt(0); // 获得第一个字符
            var index = item.indexOf(first); // 获得第一个字符的下标位置
            if (first === '#') {
                WM.pushArray([WM.id(item.slice(index + 1))], list);
                result = list; // 用于保存上下文选择器
            } else if (first === '.') {
                if (result.length) {
                    for (var i = 0; i < result.length; i++) {
                        WM.pushArray(WM.class(item.slice(index + 1), result[i]), list);

                    }
                } else {

                    WM.pushArray(WM.class(item.slice(index + 1)), list);
                }
                result = list;
            } else {
                if (result.length) {
                    for (var i = 0; i < result.length; i++) {
                        WM.pushArray(WM.tag(item, result[i]), list);
                    }
                } else {

                    WM.pushArray(WM.tag(item), list);
                }
                result = list;
            }
        };
        return result;
    },

    // 分组加层次 WM.groupLayer('#demo .demo span,#demo2 .demo2 span')
    groupLayer: function(selector) {
        // 思路：遍历分组的每一项
        var list = [],
            result = [];
        var arr = WM.trim(selector).split(',');
        // 外层遍历
        for (var i = 0; i < arr.length; i++) {
            var item = WM.trim(arr[i]); // 得到一个数组，子元素也是数组
            var childArr = WM.layer(item);
            WM.pushArray(childArr, result);
        }

        return result;
    },

    all: function(selector, context) {
        if (typeof context === 'string') {
            var first = context.charAt(0);
            var index = context.indexOf(first);
            context = WM.id(context.slice(index + 1));
        }
        if (arguments.length === arguments.callee.length) {
            return context.querySelectorAll(selector);
        } else {
            return document.querySelectorAll(selector);
        }
    },
});

/* css样式 位置模块*/
WM.extend(WM, {
    // 两个参数获取样式，三个参数设置样式，支持集合
    css: function(doms, key, value) {
        var doms = WM.isString(doms) ? WM.all(doms) : doms; //字符串转为dom对象
        // 根据参数个数实现方法重载
        if (doms.length) {
            for (var i = 0; i < doms.length; i++) {
                if (value) {
                    WM.setStyle(doms[i], key, value);
                } else {
                    return WM.getStyle(doms[0], key);
                }
            }
        } else {
            if (value) {

                WM.setStyle(doms, key, value);
            } else {
                return WM.getStyle(doms, key);
            }
        };
    },
    getStyle: function(dom, key) {
        if (dom.currentStyle) {
            return dom.currentStyle[key];
        } else {
            return window.getComputedStyle(dom, null)[key];
        }
    },
    setStyle: function(dom, key, value) {
        dom.style[key] = value;
    },
    show: function(context, value) {
        var context = WM.isString(context) ? WM.all(context) : context;
        var dis = value || 'block';
        if (context.length) {
            for (var i = 0; i < context.length; i++) {
                WM.css(context[i], 'display', dis);
            }
        } else {
            WM.css(context, 'display', dis);
        }
    },
    hide: function(context) {
        var context = WM.isString(context) ? WM.all(context) : context;
        if (context.length) {
            for (var i = 0; i < context.length; i++) {
                WM.css(context[i], 'display', 'none');
            }
        } else {
            WM.css(context, 'display', 'none');
        }
    },

    // 显示隐藏切换
    toggle: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var display = WM.css(dom, 'display');
        if (display === 'none') {
            WM.css(dom, 'display', 'block');
        } else {
            WM.css(dom, 'display', 'none');
        }
    },

    slideUp: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        if (WM.css(dom, 'display') === 'block') {
            var height = WM.height(dom);
            WM.css(dom, 'overflow', 'hidden');
            WM.animate(dom, { 'height': 0 }, function() {
                dom.removeAttribute('style');
                WM.css(dom, 'display', 'none');
            }, 10);
        } else {
            return;
        }
    },

    slideDown: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        if (WM.css(dom, 'display') === 'none') {
            WM.css(dom, 'display', 'block');
            var height = WM.height(dom);
            WM.css(dom, 'overflow', 'hidden');
            WM.css(dom, 'height', '0px');
            WM.animate(dom, { 'height': height + 'px' }, function() {
                dom.removeAttribute('style');
                WM.css(dom, 'display', 'block');
            }, 10);
        } else {
            return;
        }
    },

    slideToggle: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;

        if (WM.css(dom, 'display') === 'block') {
            WM.slideUp(dom);
        }
        if (WM.css(dom, 'display') === 'none') {
            WM.slideDown(dom);
        }
    },
    // 获得盒子宽度 offsetWidth:(content + padding + border)
    // clientWidth:(content + padding)
    width: function(context) {
        var context = WM.isString(context) ? WM.all(context)[0] : context;
        return context.offsetWidth;
    },
    height: function(context) {
        var context = WM.isString(context) ? WM.all(context)[0] : context;
        return context.offsetHeight;
    },

    // 被卷去的头部和左部
    // offsetTop:子盒子外边框距离定位父盒子内边框间距离
    scrollTop: function(context) {
        var context = WM.isString(context) ? WM.all(context)[0] : context;
        return context.scrollTop;
    },

    scrollLeft: function(context) {
        var context = WM.isString(context) ? WM.all(context)[0] : context;
        return context.scrollLeft;
    },

    // 整个文档的宽高
    docWidth: function() {
        return document.body.scrollWidth;
    },
    docHeight: function() {
        return document.body.scrollHeight;
    },
    // 文档可视区域的宽高
    viewWidth: function() {
        return document.documentElement.clientWidth;
    },
    viewHeight: function() {
        return document.documentElement.clientHeight;
    },
    // 获取屏幕的宽高
    screenWidth: function() {
        return window.screen.width;
    },
    screenHeight: function() {
        return window.screen.height;
    },
    // 文档被卷去的宽高
    docScrollTop: function() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    },
    docScrollLeft: function() {
        return document.body.scrollLeft || (document.documentElement && document.documentElement.scrollLeft);
    },

    // 动态添加样式表
    addStyleSheet: function(url, media) {
        media = media || 'screen';
        var link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', url);
        link.setAttribute('media', media);
        document.head.appendChild(link);
    },

    // 动态移除样式表
    removeStyleSheet: function(url, media) {
        var styles = getStyleSheets(url, media);
        for (var i = 0; i < styles.length; i++) {
            // 转为节点
            var node = styles[i].ownerNode || styles[i].owningElement;
            styles[i].disabled = true;
            node.parentNode.removeChild(node);
        }
    },
});

/* dom 操作模块 */
WM.extend(WM, {
    // 属性设置和获取
    attr: function(doms, key, value) {
        var doms = WM.isString(doms) ? WM.all(doms) : doms;
        if (doms.length) {
            for (var i = 0; i < doms.length; i++) {
                if (value) {
                    doms[i].setAttribute(key, value);
                } else {
                    return doms[0].getAttribute(key);
                }
            }
        } else {
            if (value) {
                doms.setAttribute(key, value);
            } else {
                return doms.getAttribute(key);
            }
        }
    },

    // 添加类名
    addClass: function(doms, value) {
        var doms = WM.isString(doms) ? WM.all(doms) : doms;
        if (doms.length) {
            for (var i = 0; i < doms.length; i++) {
                doms[i].className = doms[i].className + ' ' + value;
            }
        } else {
            doms.className = doms.className + ' ' + value;
        }
    },

    // 移除类名
    removeClass: function(doms, value) {
        var doms = WM.isString(doms) ? WM.all(doms) : doms;
        if (doms.length) {
            for (var i = 0; i < doms.length; i++) {
                doms[i].className = doms[i].className.replace(value, '');
            }
        } else {
            doms.className = doms.className.className.replace(value, '');
        }
    },

    // 判断是否有某个类名
    hasClass: function(doms, value) {
        var doms = WM.isString(doms) ? WM.all(doms) : doms;
        var flag = false;
        if (doms.length) {
            for (var i = 0; i < doms.length; i++) {
                flag = check(doms[i], value);
            }
        } else {
            flag = check(doms, value);
        }

        function check(dom, name) {
            return (' ' + dom.className + ' ').indexOf(' ' + name + ' ') > -1;
        }
        return flag;
    },

    // 插入内容
    html: function(dom, value) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        if (value) {
            dom.innerHTML = value;
        } else {
            return dom.innerHTML;
        }
    },

    // 插入文本
    text: function(dom, value) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        if (value) {
            dom.innerText = value;
        } else {
            return dom.innerText;
        }
    },

    // 获取或设置表单值
    val: function(dom, value) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        if (value) {
            dom.value = value;
        } else {
            return dom.value;
        }
    },

    // 插入到某个节点后面
    after: function(node, referenceNode) {
        var node = WM.isString(node) ? WM.all(node)[0] : node;
        var referenceNode = WM.isString(referenceNode) ? WM.all(referenceNode)[0] : referenceNode;
        return referenceNode.parentNode.insertBefore(node, referenceNode.nextSibling);
    },

    before: function(node, referenceNode) {
        var node = WM.isString(node) ? WM.all(node)[0] : node;
        var referenceNode = WM.isString(referenceNode) ? WM.all(referenceNode)[0] : referenceNode;
        return referenceNode.parentNode.insertBefore(node, referenceNode);
    },

    // 移除某个节点下的所有子节点
    removeChildren: function(parent) {
        var parent = WM.isString(parent) ? WM.all(parent)[0] : parent;
        // 遍历第一个第一个子节点并移除他
        while (parent.firstChild) {
            parent.firstChild.parentNode.removeChild(parent.firstChild);
            // parent.removeChild(parent.firstChild);
        }
        return parent;
    },

    // 添加为父节点的第一个子节点
    prepend: function(parent, newNode) {
        var parent = WM.isString(parent) ? WM.all(parent)[0] : parent;
        var newNode = WM.isString(newNode) ? WM.all(newNode)[0] : newNode;
        // 如果存在第一个子节点
        if (parent.firstChild) {
            parent.insertBefore(newNode, parent.firstChild);
        } else {
            parent.appendChild(newNode);
        }
        return parent;
    },
    // 获取元素的所有兄弟节点
    siblings: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var firstNode = dom.parentNode.firstChild;
        var arr = [];
        for (; firstNode; firstNode = firstNode.nextSibling) {
            if (firstNode.nodeType === 1 && firstNode !== dom) {
                arr.push(firstNode)
            }
        }
        return arr;
    },
    // 添加为父节点的最后一个子节点
    append: function(parent, newNode) {
        var parent = WM.isString(parent) ? WM.all(parent)[0] : parent;
        var newNode = WM.isString(newNode) ? WM.all(newNode)[0] : newNode;
        parent.appendChild(newNode);
        return parent;
    },

    // 解析为dom
    parseToDom: function(str) {
        var div = document.createElement('div');
        if (typeof str == 'string') {
            div.innerHTML = str;
        }
        return div.childNodes[0];
    },
    // 解析为字符串
    parseToString: function(dom) {
        var div = document.createElement('div');
        div.appendChild(dom);
        return div.innerHTML;
    },
});
/*运动框架*/
WM.extend(WM, {

    // 动画框架
    animate: function(dom, json, fn, seconds) {
        // var seconds = seconds || 30;
        var seconds = WM.isNumber(fn) ? fn : seconds || 30;
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        clearInterval(dom.timer);
        dom.timer = setInterval(function() {
            var flag = true; // 通过判断停止定时器
            var current = 0;
            for (var k in json) {
                if (k == "opacity") {
                    // opacity的默认值是1
                    current = parseInt(WM.getStyle(dom, k) * 100);
                } else {
                    current = parseInt(WM.getStyle(dom, k));
                }

                var step = (parseInt(json[k]) - current) / 10; // 步长计算

                step = step > 0 ? Math.ceil(step) : Math.floor(step); // 步长取整，解决除不断情况
                // 判断json中存在opacity
                if (k == "opacity") {
                    // 判断浏览器支持opacity
                    if ("opacity" in dom.style) {
                        dom.style.opacity = (current + step) / 100;
                    } else {
                        // ie 6 7 8
                        dom.style.filter = "alpha(opacity = " + (current + step) * 10 + ")";
                    }

                } else if (k == "zIndex") {
                    dom.style.zIndex = json[k];
                } else {
                    dom.style[k] = step + current + "px";
                }

                // 有一个没有到达到达目的地，就要继续执行
                if (current != parseInt(json[k])) {
                    flag = false; // 同时执行
                }
            }
            if (flag) {
                clearInterval(dom.timer);
                if (typeof fn === 'function') {
                    fn();
                }
            }
        }, seconds)
    },


    // 匀速运动:(目标元素[定位]，移动距离)
    linearAnimate: function(dom, target) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var timer = null;
        clearInterval(dom.timer);
        var speed = target > dom.offsetLeft ? 10 : -10;

        dom.timer = setInterval(function() {
            // 重点是判断，非常重要
            var back = target - dom.offsetLeft;
            dom.style.left = dom.offsetLeft + speed + "px";
            if (Math.abs(back) <= 10) {
                clearInterval(dom.timer);
                dom.style.left = target + "px";
            }
        }, 30)
    },

    // 缓速运动
    slowAnimate: function(dom, target) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var timer = null;
        clearInterval(dom.timer);
        dom.timer = setInterval(function() {
            var step = (target - dom.offsetLeft) / 10;
            step = step > 0 ? Math.ceil(step) : Math.floor(step);
            dom.style.left = step + dom.offsetLeft + "px";
            if (dom.offsetLeft == target) {
                clearInterval(timer);
            }
        }, 30)
    },
});
/* 正则表达式模块 */
WM.extend(WM, {
    // css属性属性处理函数，font-size to fontSize
    camelize: function(str) {
        return str.replace(/-(\w)/g, function(strMatch, p1) {
            return p1.toUpperCase();
        })
    },

    // css属性属性处理函数，fontSize to font-size
    uncamelize: function(str, sep) {
        sep = sep || '-';
        return str.replace(/([a-z])([A-Z])/g, function(strMatch, p1, p2) {
            return p1 + sep + p2.toLowerCase();
        });
    },

    preCover: function() {
        var arr = [];
        for (var i = 0; i < WM.all('pre').length; i++) {
            arr.push(WM.html(WM.all('pre')[i]));
            arr[i] = arr[i].replace(/</g, '&lt;').replace(/>/g, '&gt;');
            WM.html(WM.all('pre')[i], arr[i]);
        }
    },
});

/* 字符串操作模块 */
WM.extend(WM, {
    //去除左边空格
    ltrim: function(str) {
        return str.replace(/(^\s*)/g, '');
    },
    //去除右边空格
    rtrim: function(str) {
        return str.replace(/(\s*$)/g, '');
    },
    //去除空格
    trim: function(str) {
        return str.replace(/(^\s*)|(\s*$)/g, '');
    },
    // 数据绑定
    formateString: function(str, data) {
        return str.replace(/@\((\w+)\)/g, function(match, key) {
            return typeof data[key] === "undefined" ? '' : data[key]
        });
    },
    // 检测字符串长度(汉字占据两个位置，英文占据一个)
    stringLength: function(str) {
        var len = 0;
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) >= 0 && str.charCodeAt(i) <= 127) {
                len++;
            } else {
                len += 2;
            }
        }
        return len;
    },
});

/* 数字操作模块 */
WM.extend(WM, {
    // 获得一个随机数
    random: function(begin, end) {
        return Math.floor(Math.random() * (end - begin)) + begin;
    },
    // 获取随机数列表并排序
    randomList: function(begin, end, sum) {
        var arr = [];
        for (var i = 0; i < sum.length; i++) {
            arr.push(WM.random(begin, end)); //获取sum次
        }
        return arr;
    },
    // 时间倒计时:('#demo','2020/12/11')
    endTime: function(dom, endTime) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var endTime = new Date(endTime);
        setInterval(startTime, 1000);

        function startTime() {
            var startTime = new Date();
            //获得毫秒时间差换成秒，并转成整数
            var seconds = parseInt((endTime.getTime() - startTime.getTime()) / 1000);
            // 把时间差转为天，时，分，秒
            var d = parseInt(seconds / 3600 / 24);
            var h = parseInt(seconds / 3600 % 24);
            var m = parseInt(seconds / 60 % 60);
            var s = parseInt(seconds % 60);

            //三元运算符判断
            d < 10 ? d = "0" + d : d;
            h < 10 ? h = "0" + h : h;
            m < 10 ? m = "0" + m : m;
            s < 10 ? s = "0" + s : s;
            //输出倒计时
            dom.innerHTML = d + "天" + h + "时" + m + "分" + s + "秒";
        }
    },
    // 获取中国式时间
    chinaDate: function() {
        var arr = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        var date = new Date();
        var day = arr[date.getDay()];
        return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日" + day;
    },

    // 日期格式化:(date对象，'yyyy-MM-dd')
    dateFormat: function(date, format) {
        var o = {
            "M+": date.getMonth() + 1, //month
            "d+": date.getDate(), //day
            "h+": date.getHours(), //hour
            "m+": date.getMinutes(), //minute
            "s+": date.getSeconds(), //second
            "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
            "S": date.getMilliseconds() //millisecond
        }
        if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(format))
                format = format.replace(RegExp.$1,
                    RegExp.$1.length == 1 ? o[k] :
                    ("00" + o[k]).substr(("" + o[k]).length));
        return format;
    },
});

/* 数组操作模块 */
WM.extend(WM, {
    pushArray: function(Arr, toArr) {
        for (var i = 0; i < Arr.length; i++) {
            toArr.push(Arr[i]);
        }
    }
});

/* 数据操作相关模块 */
WM.extend(WM, {
    isNumber: function(val) {
        return typeof val === 'number' && isFinite(val)
    },
    isBoolean: function(val) {
        return typeof val === "boolean";
    },
    isString: function(val) {
        return typeof val === "string";
    },
    isUndefined: function(val) {
        return typeof val === "undefined";
    },
    isObj: function(str) {
        if (str === null || typeof str === 'undefined') {
            return false;
        }
        return typeof str === 'object';
    },
    isNull: function(val) {
        return val === null;
    },
    isArray: function(arr) {
        if (arr === null || typeof arr === 'undefined') {
            return false;
        }
        return arr.constructor === Array;
    },
    // 转为json对象
    json: function(str) {
        return eval(str);
    },
    // 转为json字符串
    stringJson: function(json) {
        return JSON.stringify(json);
    },
});

/* Ajax模块 */
WM.extend(WM, {
    myAjax: function(URL, fn) {
        var xhr = createXHR();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                    fn(xhr.responseText);
                } else {
                    alert("错误的文件！");
                }
            }
        };
        xhr.open("get", URL, true);
        xhr.send();

        function createXHR() {
            //本函数来自于《JavaScript高级程序设计 第3版》
            if (typeof XMLHttpRequest != "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject != "undefined") {
                if (typeof arguments.callee.activeXString != "string") {
                    var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0",
                            "MSXML2.XMLHttp"
                        ],
                        i, len;

                    for (i = 0, len = versions.length; i < len; i++) {
                        try {
                            new ActiveXObject(versions[i]);
                            arguments.callee.activeXString = versions[i];
                            break;
                        } catch (ex) {
                            //skip
                        }
                    }
                }

                return new ActiveXObject(arguments.callee.activeXString);
            } else {
                throw new Error("No XHR object available.");
            }
        }
    },
});

/* store 本地存储框架*/
WM.store = (function() {
    var api = {},
        win = window,
        doc = win.document,
        localStorageName = 'localStorage',
        globalStorageName = 'globalStorage',
        storage;

    api.set = function(key, value) {};
    api.get = function(key) {};
    api.remove = function(key) {};
    api.clear = function() {};

    if (localStorageName in win && win[localStorageName]) {
        storage = win[localStorageName];
        api.set = function(key, val) { storage.setItem(key, val) };
        api.get = function(key) {
            return storage.getItem(key)
        };
        api.remove = function(key) { storage.removeItem(key) };
        api.clear = function() { storage.clear() };

    } else if (globalStorageName in win && win[globalStorageName]) {
        storage = win[globalStorageName][win.location.hostname];
        api.set = function(key, val) { storage[key] = val };
        api.get = function(key) {
            return storage[key] && storage[key].value
        };
        api.remove = function(key) { delete storage[key] };
        api.clear = function() {
            for (var key in storage) { delete storage[key] }
        };

    } else if (doc.documentElement.addBehavior) {
        function getStorage() {
            if (storage) {
                return storage
            }
            storage = doc.body.appendChild(doc.createElement('div'));
            storage.style.display = 'none';
            // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
            // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
            storage.addBehavior('#default#userData');
            storage.load(localStorageName);
            return storage;
        }
        api.set = function(key, val) {
            var storage = getStorage();
            storage.setAttribute(key, val);
            storage.save(localStorageName);
        };
        api.get = function(key) {
            var storage = getStorage();
            return storage.getAttribute(key);
        };
        api.remove = function(key) {
            var storage = getStorage();
            storage.removeAttribute(key);
            storage.save(localStorageName);
        }
        api.clear = function() {
            var storage = getStorage();
            var attributes = storage.XMLDocument.documentElement.attributes;;
            storage.load(localStorageName);
            for (var i = 0, attr; attr = attributes[i]; i++) {
                storage.removeAttribute(attr.name);
            }
            storage.save(localStorageName);
        }
    }
    return api;
})();

/* web 组件模块 */
WM.extend(WM, {
    // 弹出框
    alertBox: function(closeBtn) {
        var closeBtn = WM.isString(closeBtn) ? WM.all(closeBtn)[0] : closeBtn;
        WM.on(closeBtn, 'click', function() {
            var alertBox = this.parentNode;
            WM.animate(alertBox, { opacity: 0 }, function() {
                WM.hide(alertBox)
            }, 10)
        })
    },

    // 短信验证按钮
    validateMessage: function(dom, seconds) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var timer = null,
            time = seconds;
        WM.on(dom, 'click', function() {
            clearInterval(timer);
            dom.disabled = true;
            timer = setInterval(message, 1000);

            function message() {
                time--;
                if (time >= 0) {
                    WM.html(dom, '剩余时间' + time + '秒');
                } else {
                    WM.html(dom, '重新发送短信');
                    dom.disabled = false;
                    clearInterval(timer);
                    time = seconds;
                }
            }
        })
    },
    // 延时加载按钮
    buttonLoading: function(dom, seconds) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var loadingIcon = WM.parseToDom('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
        var timer = null;
        WM.on(dom, 'click', function() {
            clearInterval(timer);
            WM.prepend(dom, loadingIcon);
            var that = this;
            var time = 3;
            this.disabled = true;
            timer = setInterval(message, 1000);

            function message() {
                time--;
                if (time <= 0) {
                    that.innerHTML = '重新加载';
                    that.disabled = false;
                    time = 3;
                    clearInterval(timer);
                }
            }
        })
    },

    // 折叠面板
    collapse: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        for (var i = 0, length1 = dom.children.length; i < length1; i++) {
            var item = dom.children[i];
            WM.on(item.children[0], 'click', function(event) {
                var ul = WM.siblings(event.target);
                var icon = event.target.children[0];
                if (WM.css(ul[0], 'display') === 'block') {
                    return;
                }
                // 隐藏其他元素
                for (var i = 0, length1 = dom.children.length; i < length1; i++) {
                    var otherItem = WM.all('.wm-list .wm-list');
                    var otherIcon = WM.all('.wm-list i');
                    WM.hide(otherItem);
                    WM.attr(otherIcon, 'class', 'fa fa-chevron-right fr')
                }
                // 显示当前元素
                WM.slideDown(ul[0]);
                WM.attr(icon, 'class', 'fa fa-chevron-down fr')
            })
            WM.hide(item.children[1]);
        }
    },
    collapseMenu: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var item = WM.siblings(dom)[0];
        WM.on(dom, 'click', function(event) {
            WM.slideToggle(item);
        })
        WM.hide(item);
    },

    // 下拉菜单
    dropdown: function(dom) {
        WM.dropMenu(dom, 'wm-dropdown-content');
    },
    dropup: function(dom) {
        WM.dropMenu(dom, 'wm-dropup-content');
    },

    dropMenu: function(dom, classStr) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        // 移除原来document的事件
        WM.un(document, 'click', space);
        for (var i = 0, length1 = dom.children.length; i < length1; i++) {
            var item = dom.children[i];

            var btn = item.children[0];
            var icon = item.children[0].children[0];
            var content = item.children[1];
            WM.on(btn, 'click', menu);

            function menu(event) {
                for (var i = 0, length1 = dom.children.length; i < length1; i++) {
                    WM.hide(dom.children[i].children[1]);
                }
                if (WM.siblings(event.target)[0]) {

                    WM.toggle(WM.siblings(event.target)[0]);
                }
                event.stopPropagation();
            }
        }
        // 点击空白隐藏信息
        WM.on(document, 'click', space)

        function space(event) {
            var target = null;
            // 确保点击的元素一定要嘱咐元素
            if (event.target.parentNode.parentNode) {
                target = WM.hasClass(event.target.parentNode.parentNode, classStr);
            }
            if (!target) {
                WM.hide('.' + classStr);
            }
        }
    },
    // modal
    modal: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var closeBtn = WM.all('.wm-close')[0];
        WM.defaultModal(dom, '.wm-modal');
        WM.on(closeBtn, 'click', function() {
            WM.css('.wm-modal', 'visibility', 'hidden');
            WM.css('body', 'overflow', 'auto');
        })
    },
    alert: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var confirmBtn = WM.all('.wm-alert-confirm')[0];
        WM.defaultModal(dom, '.wm-alert')
        WM.on(confirmBtn, 'click', function() {
            WM.css('.wm-alert', 'visibility', 'hidden');
            WM.css('body', 'overflow', 'auto');
            console.log('你点击了确认按钮');
        })
    },
    confirm: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var confirmBtn = WM.all('.wm-confirm-confirm')[0];
        var cancelBtn = WM.all('.wm-confirm-cancel')[0];
        WM.defaultModal(dom, '.wm-confirm')
        WM.on(confirmBtn, 'click', function() {
            WM.css('.wm-confirm', 'visibility', 'hidden');
            WM.css('body', 'overflow', 'auto');
            console.log('你点击了确认按钮');
        })
        WM.on(cancelBtn, 'click', function() {
            WM.css('.wm-confirm', 'visibility', 'hidden');
            WM.css('body', 'overflow', 'auto');
            console.log('你点击了取消按钮');
        })
    },
    prompt: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var confirmBtn = WM.all('.wm-prompt-confirm')[0];
        var cancelBtn = WM.all('.wm-prompt-cancel')[0];
        WM.defaultModal(dom, '.wm-prompt')
        WM.on(confirmBtn, 'click', function() {
            WM.css('.wm-prompt', 'visibility', 'hidden');
            WM.css('body', 'overflow', 'auto');
            console.log('你点击了确认按钮');
        })
        WM.on(cancelBtn, 'click', function() {
            WM.css('.wm-prompt', 'visibility', 'hidden');
            WM.css('body', 'overflow', 'auto');
            console.log('你点击了取消按钮');
        })
    },
    defaultModal: function(dom, layer) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var layer = WM.isString(layer) ? WM.all(layer)[0] : layer;
        var btn = dom.children[0];
        var content = dom.children[1].children[0];
        var marginLeft = WM.width(content) / 2;
        WM.css(content, 'marginLeft', -marginLeft + 'px');
        // 事件
        WM.on(btn, 'click', function() {
            WM.css(layer, 'visibility', 'visible');
            WM.css('body', 'overflow', 'hidden');
        })
    },
    // 复选框: (全选，取消，反选)
    checkbox: function(dom, btnAll, btnCancel, btnReverse) {
        var inputs = WM.all('input', dom);

        function flag(state) {
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].checked = state;
            }
        }
        var btnAll = WM.isString(btnAll) ? WM.all(btnAll) : btnAll;
        var btnCancel = WM.isString(btnCancel) ? WM.all(btnCancel) : btnCancel;
        var btnReverse = WM.isString(btnReverse) ? WM.all(btnReverse) : btnReverse;
        WM.on(btnAll[0], 'click', function() { flag(true) });
        WM.on(btnCancel[0], 'click', function() { flag(false) });
        WM.on(btnReverse[0], 'click', function() {
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].checked ? inputs[i].checked = false : inputs[i].checked = true
            }
        });
    },

    checkTable: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var tbody = WM.all('tbody', dom)[0];
        var trs = WM.all('tr', tbody);
        var input = null;
        for (var i = 0, length1 = trs.length; i < length1; i++) {
            WM.on(trs[i], 'click', function(event) {
                input = this.children[0].children[0];
                if (input.checked) {
                    input.checked = false;
                    WM.css(event.target.parentNode, 'backgroundColor', '#fff')
                } else {
                    input.checked = true;
                    WM.css(event.target.parentNode, 'backgroundColor', '#f3f3f3')
                }
            })
        }
    },
    // 定时关闭：(关闭元素，时间，关闭按钮，显示倒计时)
    close: function(dom, seconds, closeBtn, showTime) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var closeBtn = WM.isString(closeBtn) ? WM.all(closeBtn)[0] : closeBtn;
        var showTime = WM.isString(showTime) ? WM.all(showTime)[0] : showTime;
        setTimeout(close, seconds);
        var time = seconds;

        function close() {
            time--;
            if (closeBtn) {
                WM.on(closeBtn, 'click', function() {
                    WM.hide(dom)
                })
            }
            if (showTime) {
                WM.html(showTime, time + '秒');
            }
            if (time == 0) {
                WM.hide(dom);
                WM.hide(closeBtn);
                WM.hide(showTime);
            } else {
                setTimeout(close, 1000); // 等待一秒再次调用
            }
        }
    },

    // 拖动框：(父盒子相对定位，子盒子绝对定位，关闭按钮)
    dragbox: function(parentBox, dragBox, closeBtn) {
        var parentBox = WM.isString(parentBox) ? WM.all(parentBox)[0] : parentBox;
        var dragBox = WM.isString(dragBox) ? WM.all(dragBox)[0] : dragBox;
        var closeBtn = WM.isString(closeBtn) ? WM.all(closeBtn)[0] : closeBtn;
        console.log(closeBtn)
        WM.on(dragBox, 'mousedown', function(event) {
            //鼠标距离盒子边缘的距离
            var leftVal = event.clientX - parentBox.offsetLeft;
            var topVal = event.clientY - parentBox.offsetTop;
            document.onmousemove = function(event) {
                // 计算盒子距离文档的距离
                var leftNow = event.clientX - leftVal;
                var topNow = event.clientY - topVal;
                WM.css(parentBox, 'top', topNow + 'px');
                WM.css(parentBox, 'left', leftNow + 'px');
            }

            document.onmouseup = function() {
                    document.onmousemove = null;

                }
                // 解决IE快速滑动
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        })
        if (closeBtn) {
            WM.on(closeBtn, 'click', function() {
                console.log(77)
                WM.hide(parentBox);
            })
        }
    },

    // 图片格式验证： (file文件域,显示信息的元素)
    validateImage: function(dom, showDom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var showDom = WM.isString(showDom) ? WM.all(showDom)[0] : showDom;
        WM.on(dom, 'change', function() {
            var fileName = WM.val(dom);
            var point = fileName.lastIndexOf('.');
            // 截取获得后缀名转换为大写
            var img = fileName.slice(point).toUpperCase();
            if (img == ".JPG" || img == ".PNG" || img == ".JPEG") {
                WM.html(showDow, '格式正确');
            } else {
                WM.html(showDom, '格式错误');
            }
        })
    },

    // 文字弹出层： (要选取的元素，显示信息的元素需要绝对定位)
    getSelection: function(dom, showId) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var showId = WM.isString(showId) ? WM.all(showId)[0] : showId;
        WM.hide(showId);
        // 鼠标按键抬起时，插入选中文字
        WM.on(dom, 'mouseup', function(event) {
            var x = event.clientX;
            var y = event.clientY;
            // 获得选中文字
            var text = null;
            if (window.getSelection) {
                text = window.getSelection().toString();
            } else {
                text = document.selection.createRange().text;
            }
            if (text) { show(x, y, text) }
        })

        function show(mouseX, mouseY, txt) {
            // 延时显示信息
            setTimeout(function() {
                WM.show(showId);
                // 曾经错误：忘记加px
                WM.css(showId, 'top', mouseY + 'px');
                WM.css(showId, 'left', mouseX + 'px');
                WM.text(showId, txt);
            }, 500)
        }
        // 点击空白隐藏信息
        document.onmousedown = function(event) {
            var targetId = event.target ? event.target.id : event.srcElement.id;
            // 点击的非显示区域
            if (targetId != showId.id) {
                WM.hide(showId);
            }
        }
    },

    // 水平拖动条：(父盒子，拖动按钮，过渡盒子，百分比进度)
    horizontalBar: function(parentBox, bar, mask, showDom) {
        var parentBox = WM.isString(parentBox) ? WM.all(parentBox)[0] : parentBox;
        var bar = WM.isString(bar) ? WM.all(bar)[0] : bar;
        var mask = WM.isString(mask) ? WM.all(mask)[0] : mask;
        var showDom = WM.isString(showDom) ? WM.all(showDom)[0] : showDom;
        WM.on(bar, 'mousedown', function(event) {
            // 获得拖动条距离屏幕的距离
            var leftVal = event.clientX - bar.offsetLeft;
            document.onmousemove = function(event) {
                var move = event.clientX - leftVal;
                // 判断两端
                if (move >= parentBox.offsetWidth - bar.offsetWidth) {
                    move = parentBox.offsetWidth - bar.offsetWidth;
                } else if (move <= 0) {
                    move = 0;
                }
                WM.css(mask, 'width', move + 'px');
                WM.css(bar, 'left', move + 'px');
                // 显示进度条百分比
                var percentage = parseInt(move / (parentBox.offsetWidth - bar.offsetWidth) * 100) + '%';

                if (showDom) {
                    WM.text(showDom, percentage)
                }
                // 解决拖动过快导致选中文字的bug
                window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empry();
            }
            document.onmouseup = function() {
                document.onmousemove = null;
            }
        })
    },

    // 滚动动画：点击有序列表项，满屏滚动无序列表项
    scrollAnimate: function(ulDom, olDom) {
        var ulDom = WM.isString(ulDom) ? WM.all(ulDom)[0] : ulDom;
        var ulItems = ulDom.children;
        var olDom = WM.isString(olDom) ? WM.all(olDom)[0] : olDom;
        var olItems = olDom.children;
        var leader = 0,
            target = 0,
            timer = null;
        for (var i = 0; i < ulItems.length; i++) {
            // 保存索引号
            olItems[i].index = i;
            WM.on(olItems[i], 'click', function() {
                clearInterval(timer);
                target = ulItems[this.index].offsetTop;
                // 缓动动画 
                timer = setInterval(function() {
                    // 每隔30毫秒leader改变一次
                    leader = leader + (target - leader) / 10;
                    window.scrollTo(0, leader);
                }, 30)
            })
        }
    },

    // tab选项卡
    tab: function(dom) {
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var spans = WM.all('span', dom);
        var lis = WM.all('li', dom);
        for (var i = 0; i < spans.length; i++) {
            spans[i].index = i;
            WM.on(spans[i], 'click', WM.throttle(function() {
                // 除了当前元素其他隐藏
                for (var i = 0; i < spans.length; i++) {
                    spans[i].className = '';
                    // lis[i].style.display = 'none';
                    WM.css(lis[i],'display','none');
                }
                this.className = 'wm-tab-active';
                WM.css(lis[this.index],'display','block');
            },100,100))
        }
    },

    // 跳转至指定网址
    toIndex: function(url, seconds, showDom, delaySeconds) {
        var showDom = WM.isString(showDom) ? WM.all(showDom)[0] : showDom;
        var time = seconds;
        if (delaySeconds) {
            setTimeout(index, delaySeconds);
        } else {
            index()
        }

        function index() {
            time--;
            var info = "<a href = " + url + ">" + time + "秒后跳转到首页</a>";;
            WM.html(showDom, info);
            if (time == 0) {
                window.location.href = url;
            } else {
                setTimeout(index, 1000);
            }
        }
    },
    slider: function(seconds) {
        var seconds = seconds || 5000;
        // 设置高度
        function resizeHeight(dom) {
            var height = WM.height('.wm-slider .wm-slider-main img');
            WM.css(dom, 'height', height + 'px');
        }
        resizeHeight('.wm-slider')
        WM.on(window, 'resize', function() {
                resizeHeight('.wm-slider')
            })
        // 轮播
        // 动态创建小圆点
        var imgs = WM.all('.wm-slider-main')[0].children;
        var arrows = WM.all('.wm-slider-arrow')[0].children;
        var arr = [];
        for (var i = 0, length1 = arrows.length; i < length1; i++) {
            arr.push(arrows[i]);
        }
        for (var i = 0, length1 = imgs.length; i < length1; i++) {
            var li = document.createElement('li');
            li.innerHTML = i;
            WM.all('.wm-slider-ctrl')[0].appendChild(li);
        }
        var ctrls = WM.all('.wm-slider-ctrl')[0].children;
        ctrls[0].className = 'wm-slider-active';
        for (var i = 0, length1 = ctrls.length; i < length1; i++) {
            arr.push(ctrls[i]);
        }
        // 做准备运动
        var sliderWidth = WM.width('.wm-slider');
        for (var i = 1, length1 = imgs.length; i < length1; i++) {
            imgs[i].style.left = sliderWidth + 'px';
        }
        var key = 0;
    for (var k in arr) {
        WM.on(arr[k], 'click', WM.throttle(function(){
            if (this.className == 'slider-arrow-left') {
                WM.animate(imgs[key], {
                    left: sliderWidth
                },10);
                key--;
                key < 0 ? key = imgs.length - 1 : key;
                imgs[key].style.left = -sliderWidth + "px";
                WM.animate(imgs[key], {
                    left: 0
                },10);
                pointLight()
            } else if (this.className == 'slider-arrow-right') {
                WM.animate(imgs[key], {
                    left: -sliderWidth
                },10);
                key >= imgs.length - 1 ? key = 0 : key;
                key++;
                imgs[key].style.left = sliderWidth + "px";
                WM.animate(imgs[key], {
                    left: 0
                },10);
                pointLight()
            } else {
                var that = this.innerHTML;
                if (that > key) {
                    WM.animate(imgs[key], {
                        left: -sliderWidth
                    },10);
                    imgs[that].style.left = sliderWidth + "px";
                } else if (that < key) {
                    WM.animate(imgs[key], {
                        left: sliderWidth
                    },10);
                    imgs[that].style.left = -sliderWidth + "px";
                }
                key = that;
                WM.animate(imgs[key], {
                    left: 0
                },10);
                pointLight()
            }
        },500,2000))
    }
        // 原点高亮函数
        function pointLight() {
            for (var i = 0, length1 = ctrls.length; i < length1; i++) {
                ctrls[i].className = '';
            }
            ctrls[key].className = 'wm-slider-active';
        }
        // 定时器
        var timer = null;
        timer = setInterval(autoPlay, seconds);

        function autoPlay() {
            WM.animate(imgs[key], {
                left: -sliderWidth
            }, 10);
            key++;
            key > imgs.length - 1 ? key = 0 : key;
            imgs[key].style.left = sliderWidth + "px";
            WM.animate(imgs[key], {
                left: 0
            }, 10);

            pointLight();
        }

        // 清除定时器
        WM.all('.wm-slider')[0].onmouseover = function() {
            WM.all('.wm-slider-arrow')[0].style.textIndent = 0;
            clearInterval(timer);
        }
        WM.all('.wm-slider')[0].onmouseout = function() {
            clearInterval(timer);
            timer = setInterval(autoPlay, seconds);
            WM.all('.wm-slider-arrow')[0].style.textIndent = '-9999px';
        }
    },
    toTop: function(dom){
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var leader = 0, target = 0, timer = null,scroll = 0;
        WM.on(window,'scroll',function(){
            scroll = WM.docScrollTop();
            scroll > 100 ? WM.show(dom) : WM.hide(dom);
            // 监听距离变化
            leader = scroll;
        })
        WM.on(dom,'click',function(){
            timer = setInterval(function(){
                leader = leader + (target - leader) / 5;
                window.scrollTo(0,leader);
                if (leader === 0) {
                    clearInterval(timer);
                }
            },20)
        })
    },
    // 滚动监听
    scrollNav:function(dom){
        // 卷曲的头部=文档导航距离头部
        var dom = WM.isString(dom) ? WM.all(dom)[0] : dom;
        var scrollNav = dom.offsetTop;
        var height = WM.height(dom);
        var navItem = WM.siblings(dom);
        var array = [],offsetTop = 0;
        // 向数组push每个面板距离顶部距离
        for(var i = 0, length1 = navItem.length; i < length1; i++){
            offsetTop = navItem[i].offsetTop - height;
            array.push(offsetTop);
        }

        var leader = 0,
            target = 0,
            timer = null,
            scrollTop = null;
        var lis = dom.children[0].children;
        WM.on(window, 'scroll', function() {
            scrollTop = WM.docScrollTop();
            leader = scrollTop;
            // 导航菜单
            if (scrollTop > scrollNav) {
                // 重点：根据距离实现高亮
                for(var i = 0, length1 = array.length; i < length1; i++){
                    var arrLength = array.length;
                    var lastOne = arrLength - (i + 1); 
                    var lastTwo = arrLength - (i + 2)
                    if (scrollTop >= array[lastTwo] && scrollTop < array[lastOne]) {
                        for(var j = 0, length2 = lis.length; j < length2; j++){
                            lis[j].className = '';
                        }
                        WM.addClass(lis[lastOne - 1], 'wm-scrollnav-active');
                        
                    }else if (scrollTop >= array[arrLength - 1]) {
                        for(var j = 0, length2 = lis.length; j < length2; j++){
                            lis[j].className = '';
                        }
                        WM.addClass(lis[arrLength - 1], 'wm-scrollnav-active');
                    }
                }
                // 导航菜单固定
                WM.css(dom, 'position', 'fixed');
                WM.css(dom, 'top', '0');
            } else {
                WM.css(dom, 'position', 'static');
                WM.css(dom, 'top', '0');
            }
        });
    
        // 点击动画
        for(var i = 0, length1 = lis.length; i < length1; i++){
            lis[i].index  = i;
            WM.on(lis[i],'click',function(){
                target = array[this.index];
                clearInterval(timer);
            timer = setInterval(function(){
                leader = Math.ceil(leader + (target - leader) / 5);
                window.scrollTo(0,leader);
                // 到达位置清除定时器
                if (leader === target) {
                    clearInterval(timer)
                }
            },30)
                
            })
        }
    },
});
