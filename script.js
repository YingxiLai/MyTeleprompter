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
    let resizeTimer = null;
    
    // ▼▼▼ 新增：全屏状态跟踪变量 ▼▼▼
    let isCurrentlyFullscreen = false;


    // 3. 定义功能函数

    // (updatePlayPauseButtons, toggleFullscreenPlay, resetIdleTimer, ...
    // ... startScroll, pauseScroll, resetScroll, updateSpeed, updateFont, ...
    // ... updateFontSize, setAlignment, setScrollDirection, setScrollMode, ...
    // ... 拖拽滚动逻辑, 净化逻辑 ...
    // ... 这些函数都和之前一样，我们只修改全屏相关和新增 resize)

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
        // (只在全屏或模拟全屏时)
        if (isCurrentlyFullscreen) { // 使用新的状态变量
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
    
    // ▼▼▼ 全屏逻辑 (已更新以支持强制重绘) ▼▼▼
    
    function onEnterFullscreen(isSimulated = false) { // 增加一个参数判断是否是模拟全屏
        isCurrentlyFullscreen = true; // 更新状态
        document.body.classList.add('fullscreen-active');
        if (isSimulated) {
            document.body.classList.add('simulated-fullscreen-iphone');
        }
        document.addEventListener('mousemove', resetIdleTimer);
        document.addEventListener('touchstart', resetIdleTimer);
        document.addEventListener('click', resetIdleTimer);
        resetIdleTimer();
        updatePlayPauseButtons(scrollInterval !== null);
    }
    
    function onExitFullscreen() {
        isCurrentlyFullscreen = false; // 更新状态
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
        
        // 只有当未处于全屏状态时才尝试进入
        if (!isCurrentlyFullscreen) {
            if (/iPhone/i.test(navigator.userAgent) && !window.MSStream) {
                // iPhone：进入“模拟”全屏
                onEnterFullscreen(true); // 传入 true 表示模拟全屏
            } else if (document.documentElement.requestFullscreen) { 
                // iPad / 电脑：进入“真”全屏
                document.documentElement.requestFullscreen(); 
            } 
        }
    }
    
    function exitFullscreen() { 
        // 只有当处于全屏状态时才尝试退出
        if (isCurrentlyFullscreen) {
            if (document.body.classList.contains('simulated-fullscreen-iphone')) {
                // iPhone：退出“模拟”全屏
                onExitFullscreen(); 
            } else if (document.exitFullscreen) { 
                // iPad / 电脑：退出“真”全屏
                document.exitFullscreen(); 
            } 
        }
    }

    // 监听“真”全屏的变化 (比如按 Esc 键)
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            // 确保不是模拟全屏时才设置 isCurrentlyFullscreen
            if (!document.body.classList.contains('simulated-fullscreen-iphone')) {
                 onEnterFullscreen(false); // 不是模拟全屏
            }
        } else {
            // 只有当不是模拟全屏时，才调用退出
            if (!document.body.classList.contains('simulated-fullscreen-iphone')) {
                onExitFullscreen(); 
            }
        }
    });

    function dragStart(e) {
        if (!isCurrentlyFullscreen) { // 使用新的状态变量
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

    
    // ▼▼▼ 新功能：彻底修复 iPad 旋转 Bug (强制重绘) ▼▼▼
    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // 只有在全屏模式下，才需要执行这个修复
            if (isCurrentlyFullscreen) { // 使用新的状态变量
                // 1. 暂停所有滚动和动画
                pauseScroll();
                clearTimeout(idleTimer);
                document.body.classList.remove('idle-mode');
                
                // 2. 记住当前是否是模拟全屏 (iPhone)
                const wasSimulatedFullscreen = document.body.classList.contains('simulated-fullscreen-iphone');
                
                // 3. 强制退出全屏/模拟全屏 (清除所有相关 CSS 类)
                document.body.classList.remove('fullscreen-active');
                document.body.classList.remove('simulated-fullscreen-iphone');
                isCurrentlyFullscreen = false; // 临时设置为非全屏状态
                
                // 4. 等待一小段时间，让浏览器重新计算视口大小
                // 这非常关键，强制浏览器“重新思考”整个页面的布局
                setTimeout(() => {
                    // 5. 重新进入全屏模式
                    if (wasSimulatedFullscreen) {
                        onEnterFullscreen(true); // 重新进入模拟全屏
                    } else {
                        // 如果是真全屏，我们需要重新请求原生全屏API
                        // 但在 resize 事件中直接请求可能会被浏览器阻止
                        // 最好是重新调用 enterFullscreen 函数
                        // 这里我们简化处理，如果本来是真全屏，就再次请求原生全屏
                        // 注意：用户可能需要再次点击“全屏”按钮，或者我们直接模拟点击
                        // 暂时使用 onEnterFullscreen(false) 来模拟布局重置，用户再点击全屏
                        // 或者更稳妥的做法是让用户自己重新点击全屏按钮
                        // 鉴于这是一个针对旋转的自动化修复，我们尝试重新进入布局
                        onEnterFullscreen(false); // 重新进入布局，等待用户再次点击原生全屏
                    }
                    // 重新应用横向滚动类，确保 flexbox 重新计算
                    if (scrollDirection === 'horizontal') {
                        scriptArea.classList.remove('horizontal-scroll');
                        requestAnimationFrame(() => {
                            scriptArea.classList.add('horizontal-scroll');
                        });
                    }
                }, 50); // 50毫秒的延迟，给浏览器足够的时间
            }
        }, 100); // 防抖计时器，防止连续触发
    }


    // 4. 把所有功能绑定到按钮上
    
    // (基础控制)
    startButton.addEventListener('click', startScroll);
    pauseButton.addEventListener('click', pauseScroll);
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

    // ▼▼▼ 绑定“旋转”侦听器 ▼▼▼
    window.addEventListener('resize', handleResize);

});