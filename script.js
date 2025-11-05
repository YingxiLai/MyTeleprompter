// 等待 HTML 内容全部加载完毕
document.addEventListener('DOMContentLoaded', function() {

    // 1. 找到 HTML 里的元素
    const scriptArea = document.getElementById('scriptArea');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const speedControl = document.getElementById('speedControl');
    const fontSelector = document.getElementById('fontSelector');
    const fontSizeControl = document.getElementById('fontSizeControl');
    // ▼▼▼ 新增：找到全屏按钮 ▼▼▼
    const fullscreenButton = document.getElementById('fullscreenButton');

    // 2. 定义变量
    let scrollInterval = null; 
    let scrollSpeed = 10 - speedControl.value; 

    // 3. 定义功能函数

    // (startScroll, pauseScroll, resetScroll... 
    // ... updateSpeed, updateFont, updateFontSize 
    // ... 这些函数和以前一样，保持不变)
    
    function startScroll() {
        clearInterval(scrollInterval);
        scrollInterval = setInterval(function() {
            scriptArea.scrollTop += 1; 
        }, scrollSpeed * 10); 
    }
    
    function pauseScroll() {
        clearInterval(scrollInterval);
    }
    
    function resetScroll() {
        clearInterval(scrollInterval);
        scriptArea.scrollTop = 0;
    }
    
    function updateSpeed() {
        scrollSpeed = 11 - speedControl.value;
        if (scrollInterval) {
            startScroll();
        }
    }
    
    function updateFont() {
        const selectedFont = fontSelector.value;
        scriptArea.style.fontFamily = selectedFont;
    }
    
    function updateFontSize() {
        const selectedSize = fontSizeControl.value;
        scriptArea.style.fontSize = selectedSize + 'px';
    }
    
    // ▼▼▼ --- 新增的全屏功能 --- ▼▼▼
    
    // 切换全屏的函数
    function toggleFullscreen() {
        // 检查当前是否已经是全屏状态
        if (!document.fullscreenElement) {
            // 如果不是全屏，则请求进入全屏
            document.documentElement.requestFullscreen();
        } else {
            // 如果是全屏，则退出全屏
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    // 监听浏览器的全屏状态变化（这很关键，包括按 Esc 键）
    document.addEventListener('fullscreenchange', () => {
        // 检查浏览器当前是否处于全屏状态
        if (document.fullscreenElement) {
            // 是：我们刚刚进入了全屏
            // 给 body 添加 'fullscreen-active' 类，CSS 就会生效
            document.body.classList.add('fullscreen-active');
        } else {
            // 否：我们刚刚退出了全屏
            // 移除 'fullscreen-active' 类，CSS 就会恢复
            document.body.classList.remove('fullscreen-active');
        }
    });
    // ▲▲▲ --- 新增功能结束 --- ▲▲▲


    // 4. 把功能绑定到按钮上
    startButton.addEventListener('click', startScroll);
    pauseButton.addEventListener('click', pauseScroll);
    resetButton.addEventListener('click', resetScroll);
    speedControl.addEventListener('input', updateSpeed);
    fontSelector.addEventListener('change', updateFont);
    fontSizeControl.addEventListener('input', updateFontSize);
    // ▼▼▼ 新增：绑定全屏按钮 ▼▼▼
    fullscreenButton.addEventListener('click', toggleFullscreen);

});