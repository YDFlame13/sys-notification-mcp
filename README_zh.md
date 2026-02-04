# MCP 跨平台系统通知服务器

[English](README.md)

AI Coding 时喜欢摸鱼玩手机，需要点运行都不知道，试试这个mcp+rule的解决方案。
一个为AI助手提供跨平台系统通知功能的MCP服务器，支持macOS、Windows和Linux三大操作系统，并具备完整的提示音支持。

## 🎯 功能特性

### 跨平台通知支持
- **macOS**: 原生系统通知，完全支持14种系统提示音
- **Windows**: Toast通知 + SystemSounds系统声音播放
- **Linux**: 桌面通知 + canberra-gtk-play/paplay系统声音

### 通知类型
- **authorization**: 需要用户授权时（如运行终端命令）
- **completed**: 任务完成时（如代码生成完成）
- **waiting**: 等待用户响应时
- **error**: 发生错误时
- **info**: 一般信息通知

### 提示音支持
所有平台都支持相同的14种提示音，系统会自动进行跨平台映射：

| 提示音 | macOS | Windows | Linux |
|--------|-------|---------|-------|
| Basso | ✅ 原生 | SystemExclamation | dialog-warning |
| Blow | ✅ 原生 | SystemHand | dialog-error |
| Bottle | ✅ 原生 | SystemAsterisk | message |
| Frog | ✅ 原生 | SystemQuestion | dialog-question |
| Funk | ✅ 原生 | SystemExclamation | dialog-information |
| Glass | ✅ 原生 | SystemNotification | complete |
| Hero | ✅ 原生 | SystemNotification | complete |
| Morse | ✅ 原生 | SystemExclamation | dialog-warning |
| Ping | ✅ 原生 | SystemNotification | message |
| Pop | ✅ 原生 | SystemDefault | dialog-information |
| Purr | ✅ 原生 | SystemDefault | dialog-information |
| Sosumi | ✅ 原生 | SystemHand | dialog-error |
| Submarine | ✅ 原生 | SystemAsterisk | message |
| Tink | ✅ 原生 | SystemDefault | dialog-information |

## 📋 使用方法

### 基本通知
```json
{
  "serverName": "sys-notification-mcp",
  "toolName": "notify",
  "arguments": {
    "type": "completed",
    "message": "代码生成已完成，请查看结果"
  }
}
```

### 自定义通知
```json
{
  "serverName": "sys-notification-mcp",
  "toolName": "notify",
  "arguments": {
    "type": "authorization",
    "message": "需要您的授权来运行终端命令",
    "title": "🔐 权限请求",
    "sound": "Glass"
  }
}
```

### 查询功能
```json
// 列出所有通知类型
{
  "serverName": "sys-notification-mcp",
  "toolName": "list_notification_types"
}

// 获取系统信息
{
  "serverName": "sys-notification-mcp",
  "toolName": "get_system_info"
}
```

## 🔧 安装配置

### 依赖要求
- Node.js 18+
- 各平台系统通知支持：
  - macOS: 无需额外依赖
  - Windows: PowerShell 5.0+
  - Linux: notify-send (通常随桌面环境安装)

### 方式一：npm全局安装（推荐）
```bash
# 全局安装MCP服务器
npm install -g sys-notification-mcp

# 验证安装
sys-notification-mcp --help
```

### 方式二：本地源码安装
```bash
# 克隆项目
git clone <repository-url>
cd sys-notification-mcp

# 安装依赖
npm install

# 本地运行测试
node index.js
```

### MCP客户端配置

#### 全局安装配置（方式一）
在MCP客户端配置文件中添加：
```json
{
  "mcpServers": {
    "sys-notification-mcp": {
      "command": "sys-notification-mcp"
    }
  }
}
```

#### 本地安装配置（方式二）
在MCP客户端配置文件中添加（使用绝对路径）：
```json
{
  "mcpServers": {
    "sys-notification-mcp": {
      "command": "node",
      "args": ["/path/to/sys-notification-mcp/index.js"]
    }
  }
}
```

### 配置验证
配置完成后，重启MCP客户端，AI助手应该能够识别并使用通知功能。

## 📜 推荐配合规则文件使用

### 为什么需要规则文件？
项目包含一个精心设计的规则文件 `rule.txt`，强烈推荐所有AI助手使用此规则来确保：

- **一致的用户体验**：跨平台提供统一的通知行为
- **及时的用户交互**：在关键节点及时通知用户
- **错误及时处理**：遇到问题立即通知用户
- **性能优化**：避免通知过频影响用户体验

### 规则文件内容概览
规则文件定义了完整的通知行为规范：

1. **强制执行规则**：完成问题回答后必须发送通知
2. **通知类型定义**：5种标准通知类型及其使用场景
3. **调用时机规则**：何时发送通知的详细指南
4. **技术实现规范**：MCP工具调用的标准格式
5. **跨平台兼容性**：针对macOS、Windows、Linux的优化说明

### 规则文件使用示例
```json
// 根据规则文件，AI助手应在任务完成后发送通知
{
  "serverName": "sys-notification-mcp",
  "toolName": "notify",
  "arguments": {
    "type": "completed",
    "message": "代码重构已完成，请检查结果"
  }
}
```

### 获取规则文件
规则文件位于项目根目录：`rule.txt`

AI助手应定期检查规则文件的更新，以确保使用最新的最佳实践。

## 🛠️ 开发指南

### 项目结构
```
sys-notification-mcp/
├── index.js          # 主服务器文件
├── package.json      # 项目配置
├── README.md         # 说明文档（英文版）
├── README_zh.md      # 中文版文档
├── rule.txt          # AI行为规则（推荐使用）
├── test-cross-platform.js # 功能测试脚本
└── IMPLEMENTATION.md # 技术实现文档
```

### 核心函数
- `sendNotification()`: 主通知发送函数
- `playSound()`: 跨平台提示音播放
- `getOS()`: 操作系统检测
- 各平台特定的通知实现函数

### 扩展提示音
要添加新的提示音，在`SOUND_MAPPING`对象中添加新的映射：
```javascript
const SOUND_MAPPING = {
  "NewSound": { 
    macos: "NewSound", 
    windows: "SystemDefault", 
    linux: "dialog-information" 
  }
};
```

## 🌍 平台兼容性

### macOS
- ✅ 完全支持原生通知
- ✅ 支持所有14种系统提示音
- ✅ 无需额外依赖

### Windows
- ✅ 支持Toast通知
- ✅ 通过SystemSounds播放系统声音
- ✅ 需要PowerShell 5.0+

### Linux
- ✅ 支持桌面通知（notify-send）
- ✅ 通过canberra-gtk-play或paplay播放声音
- ✅ 需要桌面环境支持

## 📝 使用场景示例

### 场景1: 代码生成完成
```json
{
  "type": "completed",
  "message": "React组件已生成完成，包含完整的TypeScript类型定义"
}
```

### 场景2: 需要用户授权
```json
{
  "type": "authorization",
  "message": "需要您的确认来安装项目依赖包",
  "sound": "Glass"
}
```

### 场景3: 错误处理
```json
{
  "type": "error",
  "message": "编译失败：缺少必要的依赖包",
  "sound": "Basso"
}
```

## 🔍 故障排除

### 常见问题
1. **Linux上没有声音**
   - 安装canberra-gtk-play: `sudo apt-get install libcanberra-gtk-module`
   - 或安装pulseaudio-utils: `sudo apt-get install pulseaudio-utils`

2. **Windows通知不显示**
   - 确保PowerShell执行策略允许脚本运行
   - 检查系统通知设置是否启用

3. **macOS提示音无效**
   - 检查系统声音设置
   - 确认通知中心权限

### 调试信息
使用`get_system_info`工具获取当前系统支持信息：
```json
{
  "serverName": "sys-notification-mcp",
  "toolName": "get_system_info"
}
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**注意**: 此MCP服务器专为AI助手设计，确保在需要用户交互时能够及时通知用户，提升AI助手的交互体验。强烈推荐结合`rule.txt`规则文件使用，以获得最佳的用户体验。