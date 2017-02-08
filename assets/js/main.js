
(function(win){
	// 导航栏
	 document.addEventListener('scroll', function() {
        var scrollTop = WM.docScrollTop();
        var navbar = WM.height('.wm-navbar');
        if (scrollTop >= navbar) {
            WM.css('.wm-navbar', 'boxShadow', '0 2px 3px #ccc')
        } else {
            WM.css('.wm-navbar', 'boxShadow', '0 0 0')
        }
    }, false);
	
})(window);

(function(win) {
    
    /*点击复制代码*/
        function copyCode(btn){
            var arr = [];
            for (var i = 0; i < WM.all('pre').length; i++) {
                arr.push(WM.html(WM.all('pre')[i]));
            }
            for (var i = 0; i < btn.length; i++) {
            btn[i].dataset.clipboardText = arr[i]
            }
        }
        var copy = WM.all('.wm-copy');
        var clipboard = new Clipboard(copy);
        clipboard.on('success',function(e){
            // 成功函数
            var tooltip = e.trigger.parentNode.children[0];   
            WM.html(tooltip,'复制成功')
            setTimeout(function(){
                WM.html(tooltip,'点击复制')
            },1000)
        });

        clipboard.on('error',function(e){
            // 失败函数
            var tooltip = e.trigger.parentNode.children[0];   
            WM.html(tooltip,'复制失败') 
            setTimeout(function(){
                WM.html(tooltip,'点击复制')
            },1000)
        });

        // tooltip显示隐藏
        
        for (var i = 0; i < WM.all('.wm-copy').length; i++) {         
            WM.hover(WM.all('.wm-copy')[i],function(){   
        var tooltip = this.parentNode.children[0];      
            WM.show(tooltip)
        },function(){
        var tooltip = this.parentNode.children[0];
            WM.hide(tooltip)
        })
        }
        copyCode(copy);
        /*pre符号转换*/
        WM.preCover();
        /*动态设置wm-container高度*/
        var height = WM.height('#wm_intro');
        WM.css('main.wm-container','height',(height+25) + 'px');
        WM.on(window, 'resize', function() {
            var height = WM.height('#wm_intro');
        WM.css('main.wm-container','height',(height+25) + 'px');
        })
})(window);
/*导航菜单*/
(function(win){
    var navWap = WM.all('.wm-navbar-wap')[0];
    WM.on(navWap,'click',function(){
        WM.slideToggle(WM.all('.wm-navbar-menu')[0])
    })
})(window);
/*列表*/
(function(win){
    var help = WM.all('.wm-help')[0];
    WM.on(help,'click',function(){
        if (WM.css('#aside','left') !== '0px') {
            WM.animate('#aside',{left:'0px'},10);
        }else {
            WM.animate('#aside',{left:'-200px'},10);
        }   
    })
})(window);