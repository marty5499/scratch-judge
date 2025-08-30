#!/bin/bash

# 自動更新文檔的 hook 腳本
# 當檢測到成功的 git commit 後觸發

# 獲取專案根目錄
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# 檢查最後一個命令是否包含 git commit 並成功執行
if [[ "$CLAUDE_LAST_COMMAND" == *"git commit"* ]] && [[ "$CLAUDE_LAST_EXIT_CODE" == "0" ]]; then
    echo "檢測到成功的 git commit，準備更新文檔..."
    
    # 記錄更新開始
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 開始自動更新文檔" >> "$PROJECT_DIR/.claude/hooks/update-docs.log"
    
    # 檢查是否有 dashboard.html 的變更
    if git diff HEAD~1 --name-only 2>/dev/null | grep -q "dashboard.html"; then
        echo "檢測到 dashboard.html 變更，需要更新 dashboard.md"
        touch "$PROJECT_DIR/.claude/hooks/.update-dashboard-flag"
    fi
    
    # 建立更新標記文件，供 Claude 檢測
    echo "$(date '+%Y-%m-%d %H:%M:%S')" > "$PROJECT_DIR/.claude/hooks/.docs-update-needed"
    
    # 提示用戶可以執行 /update-docs 命令
    echo ""
    echo "========================================="
    echo "📝 提示：偵測到新的提交！"
    echo "您可以執行 /update-docs 來自動更新所有文檔"
    echo "========================================="
    echo ""
    
    # 記錄更新觸發
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 文檔更新標記已設置" >> "$PROJECT_DIR/.claude/hooks/update-docs.log"
fi

exit 0