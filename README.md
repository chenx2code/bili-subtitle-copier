# Bilibili AI字幕 一键复制 Chrome 扩展

[![版本](https://img.shields.io/badge/版本-1.0.0-blue.svg)](manifest.json)  [![许可证](https://img.shields.io/badge/许可证-MIT-green.svg)](LICENSE)

这是一个 Chrome 扩展程序，旨在简化从 Bilibili (B站) 视频页面的 AI 字幕（通常在“视频笔记”或“AI视频助手”面板中）获取字幕的过程。

它会在 AI 字幕列表面板中添加一个醒目的 **“复制全部字幕”** 按钮。点击该按钮后，扩展会自动提取所有可见的 AI 字幕条目，将其格式化为标准的 **SRT (SubRip Text)** 格式，并直接复制到用户的剪贴板中。

这对于需要将字幕用于以下场景的用户非常方便：

*   导入到 AI 工具进行内容分析或总结。
*   在讨论或分享视频内容时引用具体时间点的对话。
*   整理视频笔记。
*   本地保存字幕以供离线查阅。

---

## ✨ 主要功能

*   **一键复制:** 在 B 站 AI 字幕面板顶部添加易于操作的“复制全部字幕”按钮。
*   **标准 SRT 格式:** 自动将 B 站字幕的时间戳 (`MM:SS`) 和文本转换为标准的 SRT (`HH:MM:SS,ms --> HH:MM:SS,ms`) 格式，包含序号、时间轴和文本内容。
*   **智能时间戳处理:**
    *   自动计算每条字幕的结束时间（通常是下一条不同时间戳字幕的开始时间）。
    *   为最后一条字幕或时间戳相同的连续字幕设置合理的默认持续时间。
    *   处理并修正潜在的时间戳重叠或无效问题，确保生成有效的 SRT 文件。
*   **动态加载适应:** 使用 `MutationObserver` 监听 B 站页面变化，确保即使 AI 字幕面板是动态加载或切换出现的，按钮也能正确地显示和隐藏。
*   **清晰的用户反馈:** 在按钮下方提供实时的操作状态提示，例如：“正在提取...”、“已复制 X 条字幕！”、“未找到字幕元素。”或错误信息。
*   **界面友好:** 按钮样式简洁，并参考了 B 站的 UI 风格，提供鼠标悬停 (`:hover`) 和禁用 (`:disabled`) 状态的视觉效果。

---

## 🚀 安装方法 (开发者模式加载)

由于此扩展目前未在 Chrome Web Store 上架，您需要通过开发者模式手动加载：

**推荐：从 GitHub Release 安装 (适用于所有用户)**

1.  **下载最新版本：**
    *   访问本项目的 [**Releases 页面**](https://github.com/chenx2code/bili-subtitle-copier/releases)。
    *   在最新版本的 "Assets" 部分，下载名为 `bili-subtitle-copier-版本号-chrome.zip` 的文件（例如 `bili-subtitle-copier-0.0.1-chrome.zip`）。

2.  **解压缩 ZIP 文件：**
    *   找到你下载的 `.zip` 文件，并将其解压缩到一个你方便找到的文件夹中。解压后你会得到一个包含扩展所有文件的文件夹 (例如 `bili-subtitle-copier-0.0.1-chrome`)。

3.  **在 Chrome 中加载扩展：**
    *   打开 Chrome 浏览器。
    *   在地址栏输入 `chrome://extensions` 并按回车键，进入扩展管理页面。
    *   **开启“开发者模式”：** 确保页面右上角的“开发者模式 (Developer mode)”开关已打开。
    *   **加载扩展：** 点击页面左上角出现的“加载已解压的扩展程序 (Load unpacked)”按钮。
    *   **选择文件夹：** 在弹出的文件选择窗口中，找到并选择你在第 2 步中**解压缩后得到的那个文件夹** (例如 `bili-subtitle-copier-0.0.1-chrome`)。
    *   点击“选择文件夹 (Select Folder)”。

4.  **完成：**
    *   "Bilibili AI字幕 一键复制" 扩展现在应该会出现在你的扩展列表中，并已默认启用。你可以在 Chrome 工具栏上看到它的图标。

**备选：从源代码加载 (适用于开发者)**

如果你希望从最新的源代码进行构建和安装，或者想参与开发和调试，可以按照以下步骤操作：

1.  **克隆仓库：**
    ```bash
    https://github.com/chenx2code/bili-subtitle-copier.git
    ```
2.  **在 Chrome 中加载扩展：**
    *   打开 Chrome 浏览器，地址栏输入 `chrome://extensions`。
    *   开启“开发者模式”。
    *   点击“加载已解压的扩展程序”。
    *   选择你克隆下来的项目文件夹（确保它包含了 `manifest.json` 以及所有必需的源代码文件，也就是你存放项目文件的根目录）。
3.  **完成。**

---

## 💡 如何使用

1.  确保扩展已按照上述步骤成功安装并启用。
2.  打开任意一个 Bilibili 视频页面 (例如 `https://www.bilibili.com/video/BVxxxxxx`)。
3.  在视频播放器下方位置，找到并点击打开 **“AI视频助手”** 功能面板。
4.  如果该视频提供了 AI 字幕功能，切换到 **“字幕列表”** 或类似的视图。
5.  您应该能在字幕列表内容的顶部看到一个新增的蓝色 **“复制全部字幕”** 按钮。
6.  点击该按钮。
7.  观察按钮下方的状态提示。成功后会显示 **“已复制 X 条字幕！”**。
8.  现在，SRT 格式的字幕内容已经在您的剪贴板里了。您可以将其粘贴到任何文本编辑器（如记事本、VS Code）、笔记软件或需要使用字幕的地方。



![image1](/.assets/image1.png)



![image2](/.assets/image2.png)



<img src="/.assets/image3.png" alt="image3" style="zoom: 33%;" />

--- 

## 🛠️ 技术细节 (简述)

*   **Manifest V3:** 遵循 Chrome 扩展最新的清单文件规范。
*   **Content Scripts:** 通过 `content_scripts` 将 `content.js` (核心逻辑) 和 `style.css` (样式) 注入到匹配的 Bilibili 视频页面。
*   **DOM 操作:** 使用 `document.querySelector`, `document.querySelectorAll`, `document.createElement`, `element.textContent`, `element.addEventListener`, `element.insertAdjacentElement`, `element.remove` 等标准 Web API 与页面交互。
*   **Clipboard API:** 使用 `navigator.clipboard.writeText` 将生成的 SRT 文本写入剪贴板 (需要 `clipboardWrite` 权限)。
*   **MutationObserver:** 监听 DOM 树变化，以便在 AI 字幕面板动态出现或消失时，能够及时地添加或移除复制按钮。
*   **SRT 格式化:** 包含时间格式转换 (`MM:SS` 到 `HH:MM:SS,ms`) 和时间戳计算逻辑。

---

## ⚠️ 已知问题与限制

*   **依赖 B 站页面结构:** 本扩展强依赖于 Bilibili 网站当前的 HTML 结构和 CSS 类名来定位 AI 字幕面板及其内部元素。如果 B 站未来进行大规模的页面改版，可能会导致 CSS 选择器失效，进而使扩展无法正常工作。届时需要更新代码中的选择器。
*   **AI 字幕可用性:** 本扩展只在 B 站视频提供了 AI 字幕功能时才有效。

---

## 🤝 贡献

如果您发现任何 Bug、有改进建议或想要添加新功能，欢迎通过以下方式贡献：

*   提交 **Issue** 报告问题或提出建议。
*   创建 **Pull Request** 提交您的代码更改。

---

## 📄 许可证

本项目根据 [MIT 许可证](LICENSE) 的条款进行许可。
