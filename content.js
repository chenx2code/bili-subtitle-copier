// --- 核心功能函数 (格式化时间、提取、格式化SRT) ---
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
    const defaultDuration = 3;

    for (let i = 0; i < subtitles.length; i++) {
        const current = subtitles[i];
        const startTime = formatSrtTime(current.time);
        let endTime;

        if (i + 1 < subtitles.length) {
            endTime = formatSrtTime(subtitles[i + 1].time);
             if (endTime <= startTime) {
                 console.warn(`[Bili SRT Copier] 检测到无效时间戳，调整结束时间: ${startTime} --> ${endTime}`);
                 endTime = addDuration(current.time, 1);
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

// --- 按钮和状态提示的创建与事件处理 ---
let copyButton = null;
let statusDiv = null;

function createOrGetCopyButton() {
    if (!copyButton || !document.body.contains(copyButton)) {
        copyButton = document.createElement('button');
        copyButton.id = 'bili-srt-copy-button';
        copyButton.textContent = '复制 SRT 字幕';

        copyButton.addEventListener('click', async () => {
            if (!statusDiv) return;

            statusDiv.textContent = '正在提取...';
            copyButton.disabled = true;

            try {
                const subtitles = extractSubtitlesFromPage();

                if (subtitles === null) {
                    statusDiv.textContent = '未找到字幕元素。';
                } else if (subtitles.length === 0) {
                    statusDiv.textContent = '未提取到有效字幕。';
                } else {
                    const srtData = formatToSrt(subtitles);
                    if (srtData) {
                        await navigator.clipboard.writeText(srtData);
                        statusDiv.textContent = `已复制 ${subtitles.length} 条字幕！`;
                        const originalText = copyButton.textContent;
                        copyButton.textContent = "已复制!";
                        setTimeout(() => {
                            if (copyButton) copyButton.textContent = originalText;
                            if (statusDiv) statusDiv.textContent = '';
                        }, 2000);
                    } else {
                        statusDiv.textContent = '格式化 SRT 失败。';
                    }
                }
            } catch (error) {
                console.error("[Bili SRT Copier] 复制出错:", error);
                statusDiv.textContent = `复制出错: ${error.message}`;
            } finally {
                if (copyButton) copyButton.disabled = false;
                 if(statusDiv && (statusDiv.textContent.startsWith('复制出错') || statusDiv.textContent.startsWith('格式化 SRT 失败') || statusDiv.textContent.startsWith('未找到') || statusDiv.textContent.startsWith('未提取'))) {
                      setTimeout(() => { if (statusDiv) statusDiv.textContent = ''; }, 2000);
                 }
            }
        });
    }
    return copyButton;
}

function createOrGetStatusDiv() {
    if (!statusDiv || !document.body.contains(statusDiv)) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'bili-srt-status';
    }
    return statusDiv;
}


// --- 插入按钮和移除提示逻辑 ---
function insertButtonAndRemoveTips() {
    // 查找目标容器
    const subtitleListContainer = document.querySelector('div[data-video-assistant-subject-subtitles=""]._SubtitlesList_2jiok_1');

    if (subtitleListContainer) {
        // 查找提示元素
        const tipsElement = subtitleListContainer.querySelector('._Tips_2jiok_5');
        // 查找字幕内容的父级容器，我们将按钮插入到这个容器的最前面
        const subtitlesContainer = subtitleListContainer.querySelector('._Subtitles_2jiok_1');

        // 检查按钮是否已存在于容器中
        const existingButton = subtitleListContainer.querySelector('#bili-srt-copy-button');

        if (subtitlesContainer && !existingButton) { // 确保字幕内容容器存在且按钮未插入
            console.log("[Bili SRT Copier] 检测到字幕列表容器，准备插入按钮并移除提示...");
            const button = createOrGetCopyButton();
            const status = createOrGetStatusDiv();

            // **修改点：移除提示元素 (如果存在)**
            if (tipsElement) {
                tipsElement.remove();
                console.log("[Bili SRT Copier] 已移除提示元素。");
            }

            // 将按钮和状态提示插入到字幕内容容器 (_Subtitles_2jiok_1) 的最前面
            subtitlesContainer.insertAdjacentElement('beforebegin', button); // 按钮插入到状态之前 (即最前面)
            subtitlesContainer.insertAdjacentElement('beforebegin', status); // 状态插入到内容容器之前

            console.log("[Bili SRT Copier] 按钮已插入。");
        } else if (!subtitlesContainer) {
            console.log("[Bili SRT Copier] 未找到字幕内容容器 (_Subtitles_2jiok_1)，无法插入按钮。");
        }

    } else {
        // 如果目标容器不存在，检查按钮是否还挂在DOM上
        if (copyButton && document.body.contains(copyButton)) {
             console.log("[Bili SRT Copier] 字幕列表容器未找到，移除旧按钮。");
             copyButton.remove();
             statusDiv.remove();
        }
         copyButton = null;
         statusDiv = null;
    }
}

// --- MutationObserver 监听 DOM 变化 ---
const observer = new MutationObserver((mutationsList, observer) => {
    // 优化：仅在检测到 AI 助手面板相关节点变化时才尝试插入/移除
    let panelChanged = false;
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
             // 检查添加或移除的节点是否与 AI 助手面板相关
             const checkNodes = (nodes) => {
                for (const node of nodes) {
                    if (node.nodeType === 1 && (node.matches('div[data-video-assistant-subject-wrapper], div[data-video-assistant-subject-wrapper] *') || node.querySelector('div[data-video-assistant-subject-wrapper]'))) {
                        return true;
                    }
                }
                return false;
            };
            if (checkNodes(mutation.addedNodes) || checkNodes(mutation.removedNodes)) {
                panelChanged = true;
                break; // 找到相关变化即可
            }
        }
    }
    if (panelChanged) {
        // 稍微延迟执行，确保 DOM 更新完成
        setTimeout(insertButtonAndRemoveTips, 100);
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log("[Bili SRT Copier] 内容脚本已加载，正在监听 AI 助手面板...");

// 页面加载完成后也尝试插入一次
window.addEventListener('load', () => {
    setTimeout(insertButtonAndRemoveTips, 500);
});