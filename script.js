// 等待 HTML 内容全部加载完毕
document.addEventListener('DOMContentLoaded', function() {

    // 1. 找到所有 HTML 元素 (省略)
    const scriptArea = document.getElementById('scriptArea');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const speedControl = document.getElementById('speedControl');
    const fontSelector = document.getElementById('fontSelector');
    const fontSizeControl = document.getElementById('fontSizeControl');
    const fullscreenButton = document.getElementById('fullscreenButton');
    const fullscreenPlayPauseButton = document.getElementById('fullscreenPlayPauseButton');
    const fullscreenExitButton = document.getElementById('fullscreenExitButton');
    const alignButtons = document.querySelectorAll('.align-btn');
    const scrollDirButtons = document.querySelectorAll('.scroll-dir-btn');
    const scrollModeButtons = document.querySelectorAll('.scroll-mode-btn');

    // ▼▼▼ 隐藏苹果设备的字体按钮 ▼▼▼
    const isAppleDevice = /iPhone|iPad|iPod|Mac/i.test(navigator.userAgent);
    if (isAppleDevice) {
        const fontControlGroup = fontSelector.closest('.control-group');
        if (fontControlGroup) {
            fontControlGroup.style.display = 'none'; 
        }
    }

    // 2. 定义全局状态变量
    let scrollInterval = null; 
    let scrollSpeed = 10 - speedControl.value; 
    let scrollDirection = 'vertical';
    let scrollMode = 'loop'; 
    let isDragging = false;
    let startY = 0;
    let startX = 0;
    let startScrollTop = 0;
    let startScrollLeft = 0;
    let wasScrolling = false; 
    let idleTimer = null;
    
    // ▼▼▼ 新增：旋转/调整大小的计时器 ▼▼▼
    let resizeTimer = null;

    // 3. 定义功能函数

    // (updatePlayPauseButtons, toggleFullscreenPlay, resetIdleTimer, ...
    // ... startScroll, pauseScroll, resetScroll, updateSpeed, updateFont, ...
    // ... updateFontSize, setAlignment, setScrollDirection, setScrollMode, ...
    // ... 全屏逻辑, 拖拽滚动逻辑, 净化逻辑 ...
    // ... 这些函数都和之前一样，我们只在最后面添加新功能)

    // (为了完整性，这里是所有旧函数，您可以快速跳过)
    function updatePlayPauseButtons(isPlaying) {
        if (isPlaying) { fullscreenPlayPauseButton.textContent = '暂停'; } 
        else { fullscreenPlayPauseButton.textContent = '播放'; }
    }
    function toggleFullscreenPlay() {
        if (scrollInterval) { pauseScroll(); } 
        else { startScroll(); }
    }
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        if (document.fullscreenElement || document.body.classList.contains('simulated-fullscreen-iphone')) {
            document.body.classList.remove('idle-mode');
            idleTimer = setTimeout(() => {
                document.body.classList.add('idle-mode');
            }, 2000); 
        }
    }
    function startScroll() {
        clearInterval(scrollInterval);
        updatePlayPauseButtons(true);
        scrollInterval = setInterval(function() {
            let atEnd = false;
            if (scrollDirection === 'vertical') {
                scriptArea.scrollTop += 3; 
                if (scriptArea.scrollTop >= (scriptArea.scrollHeight - scriptArea.clientHeight - 5)) { atEnd = true; }
            } else {
                scriptArea.scrollLeft += 3;
                if (scriptArea.scrollLeft >= (scriptArea.scrollWidth - scriptArea.clientWidth - 5)) { atEnd = true; }
            }
            if (atEnd) {
                if (scrollMode === 'loop') {
                    scriptArea.scrollTop = 0;
                    scriptArea.scrollLeft = 0;
                } else {
                    pauseScroll(); 
                }
            }
        }, scrollSpeed * 10); 
    }
    function pauseScroll() {
        clearInterval(scrollInterval);
        scrollInterval = null; 
        updatePlayPauseButtons(false);
    }
    function resetScroll() {
        pauseScroll(); 
        scriptArea.scrollTop = 0;
        scriptArea.scrollLeft = 0;
        wasScrolling = false; 
    }
    function updateSpeed() {
        scrollSpeed = 11 - speedControl.value;
        if (scrollInterval) { startScroll(); }
    }
    function updateFont() {
        scriptArea.style.fontFamily = fontSelector.value;
    }
    function updateFontSize() {
        scriptArea.style.fontSize = fontSizeControl.value + 'px';
    }
    function setAlignment(event) {
        const button = event.target.closest('.align-btn');
        if (!button) return;
        const alignment = button.dataset.align;
        scriptArea.style.textAlign = alignment;
        alignButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    }
    function setScrollDirection(event) {
        const button = event.target.closest('.scroll-dir-btn');
        if (!button) return;
        scrollDirection = button.dataset.direction;
        if (scrollDirection === 'vertical') {
            scriptArea.classList.remove('horizontal-scroll');
        } else {
            scriptArea.classList.add('horizontal-scroll');
        }
        scrollDirButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        resetScroll();
    }
    function setScrollMode(event) {
        const button = event.target.closest('.scroll-mode-btn');
        if (!button) return;
        scrollMode = button.dataset.mode;
        scrollModeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    }
    function onEnterFullscreen() {
        document.body.classList.add('fullscreen-active');
        document.addEventListener('mousemove', resetIdleTimer);
        document.addEventListener('touchstart', resetIdleTimer);
        document.addEventListener('click', resetIdleTimer);
        resetIdleTimer();
        updatePlayPauseButtons(scrollInterval !== null);
    }
    function onExitFullscreen() {
        document.body.classList.remove('fullscreen-active');
        document.body.classList.remove('idle-mode');
        document.body.classList.remove('simulated-fullscreen-iphone'); 
        document.removeEventListener('mousemove', resetIdleTimer);
        document.removeEventListener('touchstart', resetIdleTimer);
        document.removeEventListener('click', resetIdleTimer);
        clearTimeout(idleTimer);
        window.getSelection().removeAllRanges(); 
        if (isDragging) {
            dragEnd();
        }
        isDragging = false; 
    }
    function enterFullscreen() { 
        window.getSelection().removeAllRanges(); 
        if (/iPhone/i.test(navigator.userAgent) && !window.MSStream) {
            document.body.classList.add('simulated-fullscreen-iphone');
            onEnterFullscreen(); 
        } else if (document.documentElement.requestFullscreen) { 
            document.documentElement.requestFullscreen(); 
        } 
    }
    function exitFullscreen() { 
        if (document.body.classList.contains('simulated-fullscreen-iphone')) {
            onExitFullscreen(); 
        } else if (document.exitFullscreen) { 
            document.exitFullscreen(); 
        } 
    }
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            onEnterFullscreen(); 
        } else {
            onExitFullscreen(); 
        }
    });
    function dragStart(e) {
        if (!document.fullscreenElement && !document.body.classList.contains('simulated-fullscreen-iphone')) {
            isDragging = false;
            return; 
        }
        wasScrolling = (scrollInterval !== null);
        pauseScroll(); 
        isDragging = true;
        const touch = e.touches ? e.touches[0] : null;
        if (e.type === 'touchstart' && !touch) return; 
        startY = (touch ? touch.pageY : e.pageY) || 0;
        startX = (touch ? touch.pageX : e.pageX) || 0;
        startScrollTop = scriptArea.scrollTop;
        startScrollLeft = scriptArea.scrollLeft;
        e.preventDefault();
    }
    function dragMove(e) {
        if (!isDragging) return; 
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : null;
        if (e.type === 'touchmove' && !touch) return;
        const y = (touch ? touch.pageY : e.pageY) || 0;
        const x = (touch ? touch.pageX : e.pageX) || 0;
        if (y === 0 && x === 0) return; 
        const deltaY = y - startY;
        const deltaX = x - startX;
        if (scrollDirection === 'vertical') {
            scriptArea.scrollTop = startScrollTop - deltaY;
        } else {
            scriptArea.scrollLeft = startScrollLeft - deltaX;
        }
    }
    function dragEnd() { 
        if (!isDragging) return; 
        isDragging = false; 
        if (wasScrolling) {
            startScroll(); 
            wasScrolling = false; 
        }
    }
    function handlePaste(e) {
        e.preventDefault();
        let text = '';
        if (e.clipboardData || window.clipboardData) {
            text = (e.clipboardData || window.clipboardData).getData('text/plain');
        }
        if (text && document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, text);
        }
    }
    function handleDrop(e) {
        e.preventDefault(); e.stopPropagation();
        let text = '';
        if (e.dataTransfer) {
            text = e.dataTransfer.getData('text/plain');
        }
        if (text && document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, text);
        }
    }
    function handleDragOver(e) { e.preventDefault(); e.stopPropagation(); }

    
    // ▼▼▼ 新功能：修复 iPad 旋转 Bug ▼▼▼
    function handleResize() {
        // 使用“防抖” (debounce) 计时器
        // 停止旋转 100 毫秒后才执行，防止卡顿
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // 检查我们是否在横向模式
            if (scriptArea.classList.contains('horizontal-scroll')) {
                // “先删后加”大法，强制浏览器重绘
                scriptArea.classList.remove('horizontal-scroll');
                
                // 强制浏览器在“下一帧”再加回去
                requestAnimationFrame(() => {
                    scriptArea.classList.add('horizontal-scroll');
                });
            }
        }, 100);
    }


    // 4. 把所有功能绑定到按钮上
    
    // (基础控制)
    startButton.addEventListener('click', startScroll);
    pauseButton.addEventListener('click', pauseScroll);
    // ... (所有其他绑定) ...
    resetButton.addEventListener('click', resetScroll);
    speedControl.addEventListener('input', updateSpeed);
    fontSelector.addEventListener('change', updateFont);
    fontSizeControl.addEventListener('input', updateFontSize);
    alignButtons.forEach(button => { button.addEventListener('click', setAlignment); });
    scrollDirButtons.forEach(button => { button.addEventListener('click', setScrollDirection); });
    scrollModeButtons.forEach(button => { button.addEventListener('click', setScrollMode); });
    fullscreenButton.addEventListener('click', enterFullscreen);
    fullscreenPlayPauseButton.addEventListener('click', toggleFullscreenPlay);
    fullscreenExitButton.addEventListener('click', exitFullscreen); 
    scriptArea.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    scriptArea.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('touchend', dragEnd);
    scriptArea.addEventListener('paste', handlePaste);
    scriptArea.addEventListener('drop', handleDrop);
    scriptArea.addEventListener('dragover', handleDragOver);
    scriptArea.addEventListener('dragenter', handleDragOver);

    // ▼▼▼ 新增：绑定“旋转”侦听器 ▼▼▼
    window.addEventListener('resize', handleResize);

});