---
description: 自動更新所有 README、文檔和 CLAUDE.md 文件
tools: Read, Write, Edit, Grep, Glob, Bash, Task
---

# 自動更新專案文檔

正在分析 Scratch 3.0 遊戲開發工具包並更新所有文檔文件...

## 步驟 1: 檢查最近的變更

!git log -1 --oneline
!git diff HEAD~1 --name-only 2>/dev/null || git ls-files

## 步驟 2: 使用 Task 工具自動更新文檔

使用專門的代理來分析代碼庫並更新所有相關文檔。

請分析這個 Scratch 3.0 遊戲開發工具包的代碼庫，並更新以下文檔文件：

1. **CLAUDE.md** - 確保包含：
   - 最新的開發命令
   - 更新的架構說明
   - 新增的功能或模組
   - 環境配置更新
   - Critical implementation details

2. **README.md** - 更新：
   - 專案描述
   - 安裝和使用說明
   - 工具說明文檔
   - 使用範例

3. **docs/ 目錄** - 檢查並更新：
   - plan.md - 工作流程和實作模式
   - scratch_sb3_spec.md - .sb3 檔案格式規格
   - tools.md - 工具使用說明和範例

分析以下核心文件來了解系統架構：
@gen_sb3.js - Scratch 專案產生器
@gen_imgs.js - AI 圖片產生器  
@unzip.js - .sb3 檔案解壓縮工具
@zip.js - 資料夾壓縮工具
@package.json - 專案配置

確保所有文檔保持一致性，使用中文並採用 UTF-8 編碼。

## 步驟 3: 顯示更新結果

!echo "=== Scratch 3.0 遊戲開發工具包文檔更新完成 ==="
!date '+更新時間: %Y-%m-%d %H:%M:%S'
!git status --short | grep -E "\.md$" || echo "沒有文檔變更"
