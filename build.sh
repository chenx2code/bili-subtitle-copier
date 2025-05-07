#!/bin/bash

# --- 检查核心依赖工具 ---
# 检查 jq 是否安装
if ! command -v jq &> /dev/null
then
    echo "Error: jq is required but not installed."
    echo "Please install jq to read version from package.json."
    echo "  On Debian/Ubuntu: sudo apt-get install jq"
    echo "  On macOS (with Homebrew): brew install jq"
    echo "  On Fedora: sudo dnf install jq"
    echo "  For other systems, please see https://stedolan.github.io/jq/download/"
    exit 1
fi

# 检查 zip 是否安装
if ! command -v zip &> /dev/null
then
    echo "Error: zip is required but not installed."
    echo "Please install zip to create the extension package."
    echo "  On Debian/Ubuntu: sudo apt-get install zip"
    echo "  On macOS (with Homebrew): brew install zip" # 通常 macOS 自带，但 Homebrew 也可以安装
    echo "  On Fedora: sudo dnf install zip"
    # 对于 Windows Git Bash，通常 zip 是可用的。
    exit 1
fi


# --- 从 package.json 获取版本号和插件名 ---
VERSION=$(jq -r .version package.json)
PLUGIN_NAME=$(jq -r .name package.json) # 从 package.json 获取插件名

# --- 检查版本号是否成功获取 ---
if [ -z "$VERSION" ] || [ "$VERSION" == "null" ]; then
    echo "Error: Could not read version from package.json. Make sure package.json exists and has a 'version' field."
    exit 1
fi
if [ -z "$PLUGIN_NAME" ] || [ "$PLUGIN_NAME" == "null" ]; then
    echo "Error: Could not read name from package.json. Make sure package.json exists and has a 'name' field."
    exit 1
fi

# --- 定义输出目录和文件名 ---
OUTPUT_DIR="dist"
# 将 ZIP 文件直接输出到项目根目录，而不是 dist 内部
CHROME_ZIP_FILE="${PLUGIN_NAME}-${VERSION}-chrome.zip"

echo "Building version: ${VERSION} for plugin: ${PLUGIN_NAME}"

# --- 清理旧的输出目录 ---
echo "Cleaning old output directory: ${OUTPUT_DIR}"
rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}/${PLUGIN_NAME}" # 在 dist 目录下创建一个与插件同名的子目录存放源文件

# --- 复制必要文件到输出子目录 ---
echo "Copying files..."
cp manifest.json "${OUTPUT_DIR}/${PLUGIN_NAME}/"
cp content.js "${OUTPUT_DIR}/${PLUGIN_NAME}/"
cp style.css "${OUTPUT_DIR}/${PLUGIN_NAME}/"
cp -r icons/ "${OUTPUT_DIR}/${PLUGIN_NAME}/"
# 如果有其他必要文件，也在这里添加 cp 命令

# --- 进入包含插件文件的目录并打包 ---
echo "Packaging extension..."
cd "${OUTPUT_DIR}/${PLUGIN_NAME}" # 进入到包含 manifest.json 等文件的目录

# 将 ZIP 文件输出到上一级目录 (即项目根目录下的 dist/ 目录)
# 如果想输出到项目根目录，则是 zip -r "../../${CHROME_ZIP_FILE}" ./*
zip -r "../${CHROME_ZIP_FILE}" ./*  # 打包当前目录下的所有文件和文件夹

cd ../.. # 返回项目根目录 (先回到 dist，再回到项目根)

echo "Chrome extension packaged to ${OUTPUT_DIR}/${CHROME_ZIP_FILE}"
echo "Done."