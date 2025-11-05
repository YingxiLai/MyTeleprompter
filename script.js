// 等待 HTML 内容全部加载完毕
document.addEventListener('DOMContentLoaded', function() {

    // 1. 找到 HTML 里的元素
    const scriptArea = document.getElementById('scriptArea');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const speedControl = document.getElementById('speedControl');
    const fontSelector = document.getElementById('fontSelector');
    // ▼▼▼ 确保这一行代码存在 ▼▼▼
    const fontSizeControl = document.getElementById('fontSizeControl');

    // 2. 定义变量
    let scrollInterval = null; // 用来存放我们的“滚动定时器”
    let scrollSpeed = 10 - speedControl.value; // 滚动速度（值越小越快，所以用10减）

    // 3. 定义功能函数

    // 开始滚动的函数
    function startScroll() {
        clearInterval(scrollInterval);
        scrollInterval = setInterval(function() {
            scriptArea.scrollTop += 1; 
        }, scrollSpeed * 10); 
    }

    // 暂停滚动的函数
    function pauseScroll() {
        clearInterval(scrollInterval);
    }

    // 重置滚动的函数
    function resetScroll() {
        clearInterval(scrollInterval);
        scriptArea.scrollTop = 0;
    }

    // 更新速度的函数
    function updateSpeed() {
        scrollSpeed = 11 - speedControl.value;
        if (scrollInterval) {
            startScroll();
        }
    }

    // 更新字体的函数
    function updateFont() {
        const selectedFont = fontSelector.value;
        scriptArea.style.fontFamily = selectedFont;
    }

    // ▼▼▼ 确保这个新函数存在 ▼▼▼
    // 新增：更新字体大小的函数
    function updateFontSize() {
        // 1. 获取滑块的当前值 (比如 "150")
        const selectedSize = fontSizeControl.value;
        // 2. 把它应用到文本区域的样式上 (变成 "150px")
        scriptArea.style.fontSize = selectedSize + 'px';
    }


    // 4. 把功能绑定到按钮上
    startButton.addEventListener('click', startScroll);
    pauseButton.addEventListener('click', pauseScroll);
    resetButton.addEventListener('click', resetScroll);
    speedControl.addEventListener('input', updateSpeed);
    fontSelector.addEventListener('change', updateFont);
    
    // ▼▼▼ 确保这一行代码存在 ▼▼▼
    // 我们用 'input' 事件，这样拖动时就会实时变化
    fontSizeControl.addEventListener('input', updateFontSize);

});