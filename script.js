// 等待 HTML 内容全部加载完毕
document.addEventListener('DOMContentLoaded', function() {

    // 1. 找到所有 HTML 元素 (省略，和之前一样)
    const scriptArea = document.getElementById('scriptArea');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const speedControl = document.getElementById('speedControl');
    const fontSelector = document.getElementById('fontSelector');
    const fontSizeControl = document.getElementById('fontSizeControl');
    const fullscreenButton = document.getElementById('fullscreenButton');
    const exitFullscreenButton = document.getElementById('exitFullscreenButton');
    const alignButtons = document.querySelectorAll('.align-btn');
    const scrollDirButtons = document.querySelectorAll('.scroll-dir-btn');
    const scrollModeButtons = document.querySelectorAll('.scroll-mode-btn');

    // 2. 定义全局状态变量 (省略，和之前一样)
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

    // 3. 定义功能函数

    // (startScroll 和之前一样)
    function startScroll() {
        clearInterval(scrollInterval);
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
    
    // ▼▼▼ 暂停滚动 (已修复) ▼▼▼
    function pauseScroll() {
        clearInterval(scrollInterval);
        scrollInterval = null; 
        // 之前错误的 'wasScrolling = false;' 已经删掉
    }
    
    // ▼▼▼ 重置滚动 (已修复) ▼▼▼
    function resetScroll() {
        pauseScroll(); // resetScroll 会调用 pause
        scriptArea.scrollTop = 0;
        scriptArea.scrollLeft = 0;
        wasScrolling = false; // 重置时才重置
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
    
    // (全屏逻辑 和 净化逻辑 和之前一样)
    function enterFullscreen() { if (document.documentElement.requestFullscreen) { document.documentElement.requestFullscreen(); } }
    function exitFullscreen() { if (document.exitFullscreen) { document.exitFullscreen(); } }
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            document.body.classList.add('fullscreen-active');
        } else {
            document.body.classList.remove('fullscreen-active');
            isDragging = false; 
        }
    });
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


    // (拖拽逻辑 和之前一样)
    function dragStart(e) {
        if (!document.fullscreenElement) {
            isDragging = false;
            return;
        }
        wasScrolling = (scrollInterval !== null); // 检查是否正在滚动
        pauseScroll(); // 暂停（已修复的 pauseScroll）
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
        if (!isDragging) return; // 确保我们是从拖拽状态结束的
        isDragging = false; 
        if (wasScrolling) {
            startScroll(); // 恢复滚动
            wasScrolling = false; // 重置状态
        }
    }


    // 4. 把所有功能绑定到按钮上 (和之前一样)
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
    exitFullscreenButton.addEventListener('click', exitFullscreen);
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