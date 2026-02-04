# MCP Cross-Platform System Notification Server

[中文](README_zh.md)

Tired of missing important notifications while coding? Try this MCP + rule solution to never miss a beat.

A Model Context Protocol (MCP) server that provides cross-platform system notification functionality for AI assistants, supporting macOS, Windows, and Linux with complete sound support.

## 🎯 Features

### Cross-Platform Notification Support
- **macOS**: Native system notifications with full support for 14 system sounds
- **Windows**: Toast notifications + SystemSounds playback
- **Linux**: Desktop notifications + canberra-gtk-play/paplay system sounds

### Notification Types
- **authorization**: When user authorization is required (e.g., running terminal commands)
- **completed**: When tasks are completed (e.g., code generation finished)
- **waiting**: When waiting for user response
- **error**: When errors occur
- **info**: General information notifications

### Sound Support
All platforms support the same 14 sounds with automatic cross-platform mapping:

| Sound | macOS | Windows | Linux |
|-------|-------|---------|-------|
| Basso | ✅ Native | SystemExclamation | dialog-warning |
| Blow | ✅ Native | SystemHand | dialog-error |
| Bottle | ✅ Native | SystemAsterisk | message |
| Frog | ✅ Native | SystemQuestion | dialog-question |
| Funk | ✅ Native | SystemExclamation | dialog-information |
| Glass | ✅ Native | SystemNotification | complete |
| Hero | ✅ Native | SystemNotification | complete |
| Morse | ✅ Native | SystemExclamation | dialog-warning |
| Ping | ✅ Native | SystemNotification | message |
| Pop | ✅ Native | SystemDefault | dialog-information |
| Purr | ✅ Native | SystemDefault | dialog-information |
| Sosumi | ✅ Native | SystemHand | dialog-error |
| Submarine | ✅ Native | SystemAsterisk | message |
| Tink | ✅ Native | SystemDefault | dialog-information |

## 📋 Usage

### Basic Notification
```json
{
  "serverName": "sys-notification-mcp",
  "toolName": "notify",
  "arguments": {
    "type": "completed",
    "message": "Code generation completed, please check the result"
  }
}
```

### Custom Notification
```json
{
  "serverName": "sys-notification-mcp",
  "toolName": "notify",
  "arguments": {
    "type": "authorization",
    "message": "Your authorization is required to run terminal commands",
    "title": "🔐 Permission Request",
    "sound": "Glass"
  }
}
```

### Query Functions
```json
// List all notification types
{
  "serverName": "sys-notification-mcp",
  "toolName": "list_notification_types"
}

// Get system information
{
  "serverName": "sys-notification-mcp",
  "toolName": "get_system_info"
}
```

## 🔧 Installation & Configuration

### Requirements
- Node.js 18+
- Platform-specific notification support:
  - macOS: No additional dependencies
  - Windows: PowerShell 5.0+
  - Linux: notify-send (usually installed with desktop environment)

### Method 1: Global npm Installation (Recommended)
```bash
# Install MCP server globally
npm install -g sys-notification-mcp

# Verify installation
sys-notification-mcp --help
```

### Method 2: Local Source Installation
```bash
# Clone the project
git clone <repository-url>
cd sys-notification-mcp

# Install dependencies
npm install

# Run local tests
node index.js
```

### MCP Client Configuration

#### Global Installation (Method 1)
Add to MCP client configuration file:
```json
{
  "mcpServers": {
    "sys-notification-mcp": {
      "command": "sys-notification-mcp"
    }
  }
}
```

#### Local Installation (Method 2)
Add to MCP client configuration file (use absolute path):
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

### Configuration Verification
After configuration, restart the MCP client. AI assistants should be able to recognize and use the notification functionality.

## 📜 Recommended: Use with Rule File

### Why Use the Rule File?
The project includes a carefully designed rule file `rule.txt` that is strongly recommended for all AI assistants to ensure:

- **Consistent User Experience**: Uniform notification behavior across platforms
- **Timely User Interaction**: Notify users at critical moments
- **Error Handling**: Immediate notification when problems occur
- **Performance Optimization**: Avoid excessive notifications affecting user experience

### Rule File Content Overview
The rule file defines complete notification behavior specifications:

1. **Mandatory Rules**: Must send notifications after answering questions
2. **Notification Type Definitions**: 5 standard notification types and their usage scenarios
3. **Invocation Timing Rules**: Detailed guidelines for when to send notifications
4. **Technical Implementation Specifications**: Standard format for MCP tool calls
5. **Cross-Platform Compatibility**: Optimization instructions for macOS, Windows, Linux

### Rule File Usage Example
```json
// According to the rule file, AI assistants should send notifications after task completion
{
  "serverName": "sys-notification-mcp",
  "toolName": "notify",
  "arguments": {
    "type": "completed",
    "message": "Code refactoring completed, please check the result"
  }
}
```

### Get the Rule File
The rule file is located in the project root: `rule.txt`

AI assistants should regularly check for updates to the rule file to ensure using the latest best practices.

## 🛠️ Development Guide

### Project Structure
```
sys-notification-mcp/
├── index.js          # Main server file
├── package.json      # Project configuration
├── README.md         # Documentation (English)
├── README_zh.md      # Chinese documentation
├── rule.txt          # AI behavior rules (recommended)
├── test-cross-platform.js # Functionality test script
└── IMPLEMENTATION.md # Technical implementation documentation
```

### Core Functions
- `sendNotification()`: Main notification sending function
- `playSound()`: Cross-platform sound playback
- `getOS()`: Operating system detection
- Platform-specific notification implementation functions

### Extending Sounds
To add new sounds, add new mappings to the `SOUND_MAPPING` object:
```javascript
const SOUND_MAPPING = {
  "NewSound": { 
    macos: "NewSound", 
    windows: "SystemDefault", 
    linux: "dialog-information" 
  }
};
```

## 🌍 Platform Compatibility

### macOS
- ✅ Full native notification support
- ✅ Support for all 14 system sounds
- ✅ No additional dependencies required

### Windows
- ✅ Toast notification support
- ✅ SystemSounds playback via PowerShell
- ✅ Requires PowerShell 5.0+

### Linux
- ✅ Desktop notification support (notify-send)
- ✅ Sound playback via canberra-gtk-play or paplay
- ✅ Requires desktop environment support

## 📝 Usage Scenarios

### Scenario 1: Code Generation Completed
```json
{
  "type": "completed",
  "message": "React component generation completed with full TypeScript type definitions"
}
```

### Scenario 2: User Authorization Required
```json
{
  "type": "authorization",
  "message": "Your confirmation is required to install project dependencies",
  "sound": "Glass"
}
```

### Scenario 3: Error Handling
```json
{
  "type": "error",
  "message": "Compilation failed: Missing required dependencies",
  "sound": "Basso"
}
```

## 🔍 Troubleshooting

### Common Issues
1. **No sound on Linux**
   - Install canberra-gtk-play: `sudo apt-get install libcanberra-gtk-module`
   - Or install pulseaudio-utils: `sudo apt-get install pulseaudio-utils`

2. **Windows notifications not showing**
   - Ensure PowerShell execution policy allows script execution
   - Check if system notification settings are enabled

3. **macOS sounds not working**
   - Check system sound settings
   - Confirm Notification Center permissions

### Debug Information
Use the `get_system_info` tool to get current system support information:
```json
{
  "serverName": "sys-notification-mcp",
  "toolName": "get_system_info"
}
```

## 📄 License

MIT License

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve this project!

---

**Note**: This MCP server is specifically designed for AI assistants to ensure timely user notifications when interaction is required, enhancing the AI assistant interaction experience. Strongly recommended to use with the `rule.txt` rule file for optimal user experience.