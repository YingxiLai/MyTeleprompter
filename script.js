// 等待 HTML 内容全部加载完毕
document.addEventListener('DOMContentLoaded', function() {

    // 1. 找到所有 HTML 元素
    const scriptArea = document.getElementById('scriptArea');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const speedControl = document.getElementById('speedControl');
    const fontSelector = document.getElementById('fontSelector');
    const fontSizeControl = document.getElementById('fontSizeControl');
    const fullscreenButton = document.getElementById('fullscreenButton');
    const alignButtons = document.querySelectorAll('.align-btn');
    const scrollDirButtons = document.querySelectorAll('.scroll-dir-btn');
    const scrollModeButtons = document.querySelectorAll('.scroll-mode-btn');
    
    // ▼▼▼ 找到新的全屏按钮 ▼▼▼
    const fullscreenPlayPauseButton = document.getElementById('fullscreenPlayPauseButton');
    const fullscreenExitButton = document.getElementById('fullscreenExitButton');

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
    
    // ▼▼▼ 新增：空闲计时器 ▼▼▼
    let idleTimer = null;

    // 3. 定义功能函数

    // ▼▼▼ 新增：更新播放/暂停按钮的文字 ▼▼▼
    function updatePlayPauseButtons(isPlaying) {
        if (isPlaying) {
            fullscreenPlayPauseButton.textContent = '暂停';
        } else {
            fullscreenPlayPauseButton.textContent = '播放';
        }
    }

    // ▼▼▼ 新增：全屏播放/暂停切换 ▼▼▼
    function toggleFullscreenPlay() {
        if (scrollInterval) {
            pauseScroll(); // 如果在滚，就暂停
        } else {
            startScroll(); // 如果没滚，就开始
        }
    }
    
    // ▼▼▼ 新增：重置空闲计时器 (自动隐藏的核心) ▼▼▼
    function resetIdleTimer() {
        // 1. 清除上一个2秒计时
        clearTimeout(idleTimer);
        
        // 2. 确保我们在全屏状态
        if (document.fullscreenElement) {
            // 3. 移除“空闲”状态，让按钮显示出来
            document.body.classList.remove('idle-mode');
            
            // 4. 开始一个新的2秒计时
            idleTimer = setTimeout(() => {
                // 5. 2秒后，添加“空闲”状态，让按钮隐藏 (CSS 渐变)
                document.body.classList.add('idle-mode');
            }, 2000); // 2000毫秒 = 2秒
        }
    }

    // 开始滚动 (已更新)
    function startScroll() {
        clearInterval(scrollInterval);
        updatePlayPauseButtons(true); // 更新按钮文字
        
        scrollInterval = setInterval(function() {
            // ... (滚动逻辑和之前一样)
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
                    pauseScroll(); // 单次模式停止
                }
            }
        }, scrollSpeed * 10); 
    }
    
    // 暂停滚动 (已更新)
    function pauseScroll() {
        clearInterval(scrollInterval);
        scrollInterval = null; 
        updatePlayPauseButtons(false); // 更新按钮文字
    }
    
    // 重置滚动 (已更新)
    function resetScroll() {
        pauseScroll(); // resetScroll 会调用 pause
        scriptArea.scrollTop = 0;
        scriptArea.scrollLeft = 0;
        wasScrolling = false; 
    }
    
    // (updateSpeed, updateFont, updateFontSize, setAlignment, setScrollDirection, setScrollMode...
    // ... 和之前一样，省略)
    function updateSpeed() {
        scrollSpeed = 11 - speedControl.value;
        if (scrollInterval) { startScroll(); }
    }
    function updateFont() { scriptArea.style.fontFamily = fontSelector.value; }
    function updateFontSize() { scriptArea.style.fontSize = fontSizeControl.value + 'px'; }
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
    
    // (enterFullscreen 和 exitFullscreen 和之前一样)
    function enterFullscreen() { if (document.documentElement.requestFullscreen) { document.documentElement.requestFullscreen(); } }
    function exitFullscreen() { if (document.exitFullscreen) { document.exitFullscreen(); } }

    // ▼▼▼ 全屏逻辑 (重大更新：已加入自动隐藏) ▼▼▼
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            // --- 进入全屏 ---
            document.body.classList.add('fullscreen-active');
            
            // 绑定自动隐藏事件
            document.addEventListener('mousemove', resetIdleTimer);
            document.addEventListener('touchstart', resetIdleTimer);
            document.addEventListener('click', resetIdleTimer);
            
            // 立即启动计时器
            resetIdleTimer();
            
            // 同步一下按钮状态
            updatePlayPauseButtons(scrollInterval !== null);
            
        } else {
            // --- 退出全屏 ---
            document.body.classList.remove('fullscreen-active');
            document.body.classList.remove('idle-mode'); // 清理
            
            // 解绑自动隐藏事件
            document.removeEventListener('mousemove', resetIdleTimer);
            document.removeEventListener('touchstart', resetIdleTimer);
            document.removeEventListener('click', resetIdleTimer);
            
            // 清除计时器
            clearTimeout(idleTimer);
            
            // 修复 iPad 卡死 Bug
            if (isDragging) {
                dragEnd();
            }
            isDragging = false; 
        }
    });

    // (拖拽滚动逻辑 和 净化逻辑 和之前一样)
    function dragStart(e) {
        if (!document.fullscreenElement) {
            isDragging = false;
            return; // 不在全屏，允许选中
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


    // 4. 把所有功能绑定到按钮上
    
    // (基础控制)
    startButton.addEventListener('click', startScroll);
    pauseButton.addEventListener('click', pauseScroll);
    resetButton.addEventListener('click', resetScroll);
    speedControl.addEventListener('input', updateSpeed);
    fontSelector.addEventListener('change', updateFont);
    fontSizeControl.addEventListener('input', updateFontSize);
    
    // (新功能)
    alignButtons.forEach(button => { button.addEventListener('click', setAlignment); });
    scrollDirButtons.forEach(button => { button.addEventListener('click', setScrollDirection); });
    scrollModeButtons.forEach(button => { button.addEventListener('click', setScrollMode); });

    // (全屏)
    fullscreenButton.addEventListener('click', enterFullscreen);
    
    // ▼▼▼ 绑定新的全屏按钮 ▼▼▼
    fullscreenPlayPauseButton.addEventListener('click', toggleFullscreenPlay);
    fullscreenExitButton.addEventListener('click', exitFullscreen); // 注意，这个是新的退出按钮
    
    // (拖拽与净化)
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

});