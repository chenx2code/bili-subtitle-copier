
function formatSrtTime(timeStr) {
    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) {
        console.warn("[Bili SRT Copier] 无效的时间格式:", timeStr);
        return "00:00:00,000";
    }
    return `00:${timeStr},000`;
}

function addDuration(timeStr, durationSeconds) {
    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) {
        console.warn("[Bili SRT Copier] 用于添加持续时间的时间格式无效:", timeStr);
        return "00:00:00,000";
    }
    const parts = timeStr.split(':');
    let totalSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    totalSeconds += durationSeconds;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    return `${hh}:${mm}:${ss},000`;
}

function extractSubtitlesFromPage() {
    // 这个函数现在在页面上下文中直接执行，可以直接访问 document
    const subtitleParts = document.querySelectorAll('._Part_1iu0q_16');
    if (!subtitleParts || subtitleParts.length === 0) {
        console.log("[Bili SRT Copier] 未找到字幕元素 (_Part_1iu0q_16)。");
        return null;
    }

    const subtitles = [];
    subtitleParts.forEach(part => {
        const timeEl = part.querySelector('._TimeText_1iu0q_35');
        const textEl = part.querySelector('._Text_1iu0q_64');

        if (timeEl && textEl) {
            const time = timeEl.textContent.trim();
            const text = textEl.textContent.trim();
            if (/^\d{2}:\d{2}$/.test(time) && text) {
                subtitles.push({ time, text });
            } else {
                console.warn("[Bili SRT Copier] 跳过无效的字幕片段:", { time, text });
            }
        } else {
            console.warn("[Bili SRT Copier] 跳过缺少时间或文本元素的片段:", part);
        }
    });
    console.log(`[Bili SRT Copier] 提取到 ${subtitles.length} 条字幕。`);
    return subtitles;
}

function formatToSrt(subtitles) {
    if (!subtitles || subtitles.length === 0) {
        return '';
    }
    let srtContent = '';
    const defaultDuration = 3; // 默认持续时间

    for (let i = 0; i < subtitles.length; i++) {
        const current = subtitles[i];
        const startTime = formatSrtTime(current.time);
        let endTime;

        if (i + 1 < subtitles.length) {
            endTime = formatSrtTime(subtitles[i + 1].time);
             // 检查结束时间是否不晚于开始时间（B站数据有时会有0秒间隔）
             if (endTime <= startTime) {
                 console.warn(`[Bili SRT Copier] 检测到无效时间戳，调整结束时间: ${startTime} --> ${endTime}`);
                 endTime = addDuration(current.time, 1); // 至少给1秒间隔
             }
        } else {
            endTime = addDuration(current.time, defaultDuration);
        }

        srtContent += `${i + 1}\n`;
        srtContent += `${startTime} --> ${endTime}\n`;
        srtContent += `${current.text}\n\n`;
    }
    return srtContent;
}

// --- 按钮创建和插入逻辑 ---

let copyButton = null; // 全局变量存储按钮，防止重复创建
let statusDiv = null;  // 全局变量存储状态提示

function createCopyButton() {
    if (copyButton) return copyButton; // 如果已存在则返回

    copyButton = document.createElement('button');
    copyButton.id = 'bili-srt-copy-button';
    copyButton.textContent = '复制 SRT 字幕';

    copyButton.addEventListener('click', async () => {
        if (!statusDiv) return; // 确保状态元素存在

        statusDiv.textContent = '正在提取...';
        copyButton.disabled = true;

        try {
            const subtitles = extractSubtitlesFromPage(); // 直接调用提取函数

            if (subtitles === null) {
                 statusDiv.textContent = '未找到字幕元素。';
            } else if (subtitles.length === 0) {
                statusDiv.textContent = '未提取到有效字幕。';
            } else {
                const srtData = formatToSrt(subtitles);
                if (srtData) {
                    await navigator.clipboard.writeText(srtData);
                    statusDiv.textContent = `已复制 ${subtitles.length} 条字幕！`;
                    // 短暂改变按钮文字提示
                    const originalText = copyButton.textContent;
                    copyButton.textContent = "已复制!";
                    setTimeout(() => {
                        copyButton.textContent = originalText;
                        statusDiv.textContent = ''; // 清空状态
                    }, 2000);
                } else {
                    statusDiv.textContent = '格式化 SRT 失败。';
                }
            }
        } catch (error) {
            console.error("[Bili SRT Copier] 复制出错:", error);
            statusDiv.textContent = `复制出错: ${error.message}`;
        } finally {
            copyButton.disabled = false; // 重新启用按钮
            // 2秒后自动清除错误信息
            if(statusDiv.textContent.startsWith('复制出错') || statusDiv.textContent.startsWith('格式化 SRT 失败')) {
                 setTimeout(() => { statusDiv.textContent = ''; }, 2000);
            }
        }
    });

    return copyButton;
}

function createStatusDiv() {
    if (statusDiv) return statusDiv;

    statusDiv = document.createElement('div');
    statusDiv.id = 'bili-srt-status';
    return statusDiv;
}


// --- 插入按钮到目标位置 ---
// --- 插入按钮到目标位置 ---
function insertButtonIfPanelExists() {
    const panelHeader = document.querySelector('._Tabs_krx6h_1._Tabs_196qs_124'); // AI 助手面板的 Tab 栏
    const contentContainer = document.querySelector('._Content_196qs_128'); // Tab栏下方的整个内容区域
    const subtitlesListElement = document.querySelector('._SubtitlesList_2jiok_1'); // 字幕列表的容器

    // 确保 Tab 栏和内容区域都存在，并且字幕列表已经加载（避免在“总结”Tab插入）
    if (panelHeader && contentContainer && subtitlesListElement) {
        // 检查按钮是否已插入
        if (!contentContainer.querySelector('#bili-srt-copy-button')) {
            console.log("[Bili SRT Copier] 检测到 AI 助手面板和字幕列表，准备插入按钮...");

            const button = createCopyButton();
            const status = createStatusDiv();

            // 将按钮和状态提示插入到 contentContainer 的最前面
            // insertBefore(newNode, referenceNode)
            // 如果 referenceNode 是 null，则 newNode 会被插入到末尾
            // 如果 referenceNode 是第一个子节点，则 newNode 会成为新的第一个子节点
            const firstChildInContent = contentContainer.firstChild; // 获取内容区域的第一个子元素作为参照物

            contentContainer.insertBefore(status, firstChildInContent); // 将状态提示插入到最前面
            contentContainer.insertBefore(button, status); // 将按钮插入到状态提示前面（最终按钮在最前）

            console.log("[Bili SRT Copier] 按钮和状态已插入到内容区域顶部。");
        }
    } else {
        // 如果面板关闭或切换Tab导致按钮的预期父节点消失，重置按钮和状态变量
        // （检查按钮是否还在DOM中，如果不在了才重置，防止切换Tab时误删）
        if (copyButton && !document.body.contains(copyButton)) {
            copyButton = null; // 允许下次重新创建
            statusDiv = null;
            console.log("[Bili SRT Copier] 按钮的容器节点消失，已重置。");
        }
    }
}

// --- 使用 MutationObserver 监听 DOM 变化 ---
const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // 检查是否有节点添加或移除
            // 简单起见，每次DOM变化都尝试检查并插入按钮
            insertButtonIfPanelExists();

            // 更精确的检查（可选）：
            /*
            mutation.addedNodes.forEach(node => {
                // 检查添加的节点是否是 AI 助手面板或其父容器
                if (node.nodeType === 1 && node.matches('div[data-video-assistant-subject-wrapper], div[data-video-assistant-subject-wrapper] *')) {
                    // 稍微延迟一点等待内部元素加载
                    setTimeout(insertButtonIfPanelExists, 100);
                }
            });
            // 如果面板被移除，也可能需要重置按钮状态
            mutation.removedNodes.forEach(node => {
                 if (node.nodeType === 1 && node.matches('div[data-video-assistant-subject-wrapper]')) {
                     if (copyButton && document.body.contains(copyButton)) {
                         copyButton.remove();
                         statusDiv.remove();
                         copyButton = null;
                         statusDiv = null;
                         console.log("[Bili SRT Copier] AI 助手面板移除，按钮已移除。");
                     }
                 }
            });
            */
        }
    }
});

// --- 启动监听 ---
// 监听整个文档的子节点变化和子树变化
observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log("[Bili SRT Copier] 内容脚本已加载，正在监听 AI 助手面板...");

// 页面加载完成后也尝试插入一次，以防面板已存在
window.addEventListener('load', () => {
    setTimeout(insertButtonIfPanelExists, 500); // 延迟一点确保页面元素加载完毕
});