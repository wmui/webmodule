
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

/*导航菜单*/
(function(win){
    var navWap = WM.all('.wm-navbar-wap')[0];
    WM.on(navWap,'click',function(){
        WM.slideToggle(WM.all('.wm-navbar-menu')[0])
    })
})(window);