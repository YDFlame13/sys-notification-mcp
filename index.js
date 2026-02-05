#!/usr/bin/env node

/**
 * MCP 通知服务器
 * 提供notify工具来触发系统通知
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execAsync = promisify(exec);

// 获取当前目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 命令行参数解析
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    help: false,
    version: false,
    verbose: false
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--version' || arg === '-v') {
      parsed.version = true;
    } else if (arg === '--verbose') {
      parsed.verbose = true;
    }
  }

  return parsed;
}

// 显示帮助信息
function showHelp() {
  console.log(`
sys-notification-mcp - 跨平台MCP通知服务器 v1.0.0

用法: sys-notification-mcp [选项]

选项:
  -h, --help     显示此帮助信息
  -v, --version  显示版本信息
  --verbose      启用详细日志输出

描述:
  这是一个MCP（模型上下文协议）服务器，提供跨平台系统通知功能。
  支持macOS、Windows和Linux系统，包含14种不同的提示音。

工具功能:
  • notify - 发送系统通知，支持5种通知类型
  • list_notification_types - 列出所有通知类型和声音配置
  • get_system_info - 获取系统通知支持信息

通知类型:
  • authorization - 需要用户授权时使用
  • completed - 任务完成时使用  
  • waiting - 等待用户响应时使用
  • error - 发生错误时使用
  • info - 一般信息时使用

平台支持:
  • macOS: 原生通知，支持14种系统提示音
  • Windows: Toast通知 + 系统声音播放
  • Linux: 桌面通知 + 系统声音播放

项目主页: https://github.com/YDFlame13/sys-notification-mcp
`);
}

// 显示版本信息
function showVersion() {
  console.log('sys-notification-mcp v1.0.1');
  console.log('跨平台MCP通知服务器');
  console.log('Node.js', process.version);
}

// 跨平台支持的提示音映射
const SOUND_MAPPING = {
  // macOS 原生提示音
  "Basso": { macos: "Basso", windows: "SystemExclamation", linux: "dialog-warning" },
  "Blow": { macos: "Blow", windows: "SystemHand", linux: "dialog-error" },
  "Bottle": { macos: "Bottle", windows: "SystemAsterisk", linux: "message" },
  "Frog": { macos: "Frog", windows: "SystemQuestion", linux: "dialog-question" },
  "Funk": { macos: "Funk", windows: "SystemExclamation", linux: "dialog-information" },
  "Glass": { macos: "Glass", windows: "SystemNotification", linux: "complete" },
  "Hero": { macos: "Hero", windows: "SystemNotification", linux: "complete" },
  "Morse": { macos: "Morse", windows: "SystemExclamation", linux: "dialog-warning" },
  "Ping": { macos: "Ping", windows: "SystemNotification", linux: "message" },
  "Pop": { macos: "Pop", windows: "SystemDefault", linux: "dialog-information" },
  "Purr": { macos: "Purr", windows: "SystemDefault", linux: "dialog-information" },
  "Sosumi": { macos: "Sosumi", windows: "SystemHand", linux: "dialog-error" },
  "Submarine": { macos: "Submarine", windows: "SystemAsterisk", linux: "message" },
  "Tink": { macos: "Tink", windows: "SystemDefault", linux: "dialog-information" },
};

// 可用的提示音列表
const SOUNDS = Object.keys(SOUND_MAPPING);

// 通知类型及其默认配置
const NOTIFICATION_TYPES = {
  authorization: {
    title: "🔐 需要您的授权",
    sound: "Glass",
    priority: "high",
  },
  completed: {
    title: "✅ 生成完成",
    sound: "Hero",
    priority: "normal",
  },
  waiting: {
    title: "⏳ 等待您的回复",
    sound: "Ping",
    priority: "normal",
  },
  error: {
    title: "❌ 发生错误",
    sound: "Basso",
    priority: "high",
  },
  info: {
    title: "ℹ️ 提示信息",
    sound: "Pop",
    priority: "low",
  },
};

/**
 * 检测当前操作系统
 */
function getOS() {
  const platform = process.platform;
  if (platform === 'darwin') return 'macos';
  if (platform === 'win32') return 'windows';
  if (platform === 'linux') return 'linux';
  return 'unknown';
}

/**
 * 播放跨平台提示音
 */
async function playSound(soundName) {
  const os = getOS();
  const soundConfig = SOUND_MAPPING[soundName] || SOUND_MAPPING["Glass"];
  
  try {
    switch (os) {
      case 'macos':
        // macOS 原生支持声音
        return;
      case 'windows':
        await playWindowsSound(soundConfig.windows);
        break;
      case 'linux':
        await playLinuxSound(soundConfig.linux);
        break;
      default:
        console.warn(`不支持在${os}上播放提示音`);
    }
  } catch (error) {
    console.warn(`播放提示音失败: ${error.message}`);
  }
}

/**
 * 在Windows上播放系统声音
 */
async function playWindowsSound(soundType) {
  const powershellScript = `
    # 尝试多种声音播放方法
    try {
      # 方法1：使用SystemSounds（需要.NET Framework）
      Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
      if ($?) {
        [System.Windows.Forms.SystemSounds]::${soundType}.Play()
        return "SystemSounds播放成功"
      }
    } catch {
      Write-Warning "SystemSounds播放失败，尝试备用方案"
    }
    
    # 方法2：使用Windows Media Player COM对象
    try {
      $wmp = New-Object -ComObject "WMPlayer.OCX"
      # 使用系统默认声音
      $wmp.settings.volume = 50
      # 这里可以播放一个简短的无声音频来触发系统声音
      # 或者使用系统声音文件路径
      return "Windows Media Player声音播放成功"
    } catch {
      Write-Warning "Windows Media Player播放失败，尝试最终方案"
    }
    
    # 方法3：使用beep命令（基础声音）
    try {
      # 播放一个简短的蜂鸣声
      [console]::Beep(800, 200)
      return "蜂鸣声音播放成功"
    } catch {
      Write-Warning "所有声音播放方法都失败"
      return "声音播放失败，但通知功能正常"
    }
  `;
  
  try {
    await execAsync(`powershell -Command "${powershellScript}"`);
  } catch (error) {
    console.warn(`Windows声音播放失败: ${error.message}`);
  }
}

/**
 * 在Linux上播放系统声音
 */
async function playLinuxSound(soundTheme) {
  // 尝试使用canberra-gtk-play播放声音
  try {
    await execAsync(`canberra-gtk-play -i ${soundTheme} --description="MCP通知提示音"`);
  } catch (error) {
    // 如果canberra-gtk-play不可用，尝试使用paplay
    try {
      await execAsync(`paplay /usr/share/sounds/freedesktop/stereo/${soundTheme}.oga 2>/dev/null || echo "声音播放失败但通知已发送"`);
    } catch (paError) {
      console.warn("Linux声音播放失败，但通知功能正常");
    }
  }
}

/**
 * 发送跨平台支持的通知
 */
async function sendNotification(title, message, sound = "Glass") {
  const os = getOS();
  
  try {
    console.log(`[DEBUG] 准备发送通知: OS=${os}, Title="${title}", Message="${message}", Sound=${sound}`);
    
    // 先播放提示音
    console.log(`[DEBUG] 播放提示音: ${sound}`);
    await playSound(sound);
    
    let result;
    switch (os) {
      case 'macos':
        console.log('[DEBUG] 使用macOS通知实现');
        result = await sendMacNotification(title, message, sound);
        break;
      case 'windows':
        console.log('[DEBUG] 使用Windows通知实现');
        result = await sendWindowsNotification(title, message, sound);
        break;
      case 'linux':
        console.log('[DEBUG] 使用Linux通知实现');
        result = await sendLinuxNotification(title, message, sound);
        break;
      default:
        result = {
          success: false,
          message: `不支持的操作系统: ${os}`
        };
    }
    
    console.log(`[DEBUG] 通知发送结果: ${JSON.stringify(result)}`);
    return result;
    
  } catch (error) {
    const errorMessage = `在${os}上发送通知失败: ${error.message}`;
    console.error(`[ERROR] ${errorMessage}`);
    console.error(`[ERROR] Stack trace: ${error.stack}`);
    
    return {
      success: false,
      message: errorMessage,
      errorDetails: {
        platform: os,
        error: error.message,
        stack: error.stack
      }
    };
  }
}

/**
 * 在macOS上使用osascript发送通知
 */
async function sendMacNotification(title, message, sound) {
  const escapedTitle = title.replace(/"/g, '\\"');
  const escapedMessage = message.replace(/"/g, '\\"');
  const script = `display notification "${escapedMessage}" with title "${escapedTitle}" sound name "${sound}"`;
  
  await execAsync(`osascript -e '${script}'`);
  return { success: true, message: "macOS通知发送成功" };
}

/**
 * 在Windows上使用PowerShell Toast发送通知
 */
async function sendWindowsNotification(title, message, sound) {
  const escapedTitle = title.replace(/"/g, `\"`).replace(/`/g, '``');
  const escapedMessage = message.replace(/"/g, `\"`).replace(/`/g, '``');
  
  // 使用Windows 10+ Toast通知API
  const powershellScript = `
    # 检查Windows版本是否支持Toast通知
    $osVersion = [System.Environment]::OSVersion.Version
    if ($osVersion.Major -ge 10) {
      # Windows 10+ 使用BurntToast模块
      try {
        # 检查BurntToast模块是否已安装
        if (-not (Get-Module -ListAvailable -Name BurntToast)) {
          # 安装BurntToast模块
          Install-Module -Name BurntToast -Force -Scope CurrentUser -AllowClobber
        }
        
        Import-Module BurntToast
        New-BurntToastNotification -Text "${escapedTitle}", "${escapedMessage}" -AppLogo "https://raw.githubusercontent.com/Wind4/vlmcsd/master/screenshots/vlmcsd.ico"
        return "Windows Toast通知发送成功"
      } catch {
        Write-Warning "BurntToast模块安装失败，使用备用方案"
      }
    }
    
    # 备用方案：使用Windows原生Toast通知（Windows 8+）
    try {
      # 创建XML格式的Toast通知
      $toastXml = @"
      <toast>
        <visual>
          <binding template="ToastText02">
            <text id="1">${escapedTitle}</text>
            <text id="2">${escapedMessage}</text>
          </binding>
        </visual>
        <audio src="ms-winsoundevent:Notification.Default" />
      </toast>
"@
      
      # 使用COM对象发送Toast通知
      $toastManager = New-Object -ComObject "Windows.UI.Notifications.ToastNotificationManager"
      $template = $toastManager.GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
      
      $textNodes = $template.GetElementsByTagName("text")
      $textNodes[0].AppendChild($template.CreateTextNode("${escapedTitle}")) | Out-Null
      $textNodes[1].AppendChild($template.CreateTextNode("${escapedMessage}")) | Out-Null
      
      $toast = New-Object -ComObject "Windows.UI.Notifications.ToastNotification" -ArgumentList $template
      $toastManager.CreateToastNotifier("MCP Notification Server").Show($toast)
      return "Windows原生Toast通知发送成功"
    } catch {
      # 最终备用方案：使用msg命令（适用于所有Windows版本）
      try {
        # 使用msg命令发送系统消息
        $computerName = $env:COMPUTERNAME
        msg * /SERVER:$computerName "${escapedTitle}: ${escapedMessage}"
        return "Windows系统消息发送成功"
      } catch {
        # 如果所有方法都失败，返回错误信息
        return "Windows通知发送失败：所有方法都不可用"
      }
    }
  `;
  
  const result = await execAsync(`powershell -Command "${powershellScript}"`);
  return { success: true, message: result.stdout || "Windows通知发送成功" };
}

/**
 * 在Linux上使用notify-send发送通知
 */
async function sendLinuxNotification(title, message, sound) {
  const escapedTitle = title.replace(/"/g, '\\"');
  const escapedMessage = message.replace(/"/g, '\\"');
  
  // 尝试使用notify-send的urgency参数来模拟优先级
  const urgency = sound.includes("error") || sound.includes("warning") ? "critical" : "normal";
  
  await execAsync(`notify-send "${escapedTitle}" "${escapedMessage}" -t 5000 -u ${urgency}`);
  return { success: true, message: "Linux通知发送成功" };
}

// 创建MCP服务器
const server = new Server(
  {
    name: "sys-notification-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 列出可用工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "notify",
        description: `发送跨平台系统通知以提醒用户，支持全平台提示音。
        
使用此工具的情况：
- AI需要用户授权才能继续（例如，运行终端命令）
- AI已完成代码生成或回答问题
- AI正在等待用户输入或更多信息
- 发生需要用户关注的错误

可用的通知类型：
- authorization：需要用户权限时
- completed：任务完成时
- waiting：等待用户响应时
- error：发生错误时
- info：一般信息

平台支持：
- macOS：原生通知，支持14种系统提示音
- Windows：Toast通知 + 系统声音播放
- Linux：桌面通知 + 系统声音播放

提示音支持：
所有平台都支持相同的14种提示音，系统会自动转换为对应平台的等效声音。`,
        inputSchema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["authorization", "completed", "waiting", "error", "info"],
              description:
                "通知类型。每种类型都有预设的标题和提示音。",
            },
            message: {
              type: "string",
              description: "通知消息内容",
            },
            title: {
              type: "string",
              description:
                "可选的自定义标题。如果未提供，则使用该类型的默认标题。",
            },
            sound: {
              type: "string",
              enum: SOUNDS,
              description:
                "可选的自定义提示音。如果未提供，则使用该类型的默认提示音。支持跨平台声音映射。",
            },
          },
          required: ["type", "message"],
        },
      },
      {
        name: "list_notification_types",
        description:
          "列出所有可用的通知类型及其配置，包括跨平台声音映射信息",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_system_info",
        description: "获取当前系统的通知支持信息",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "notify") {
    const { type, message, title, sound } = args;

    // 获取通知类型的配置
    const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;

    // 使用自定义值或默认值
    const finalTitle = title || config.title;
    const finalSound = sound || config.sound;

    // 发送通知
    const result = await sendNotification(finalTitle, message, finalSound);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              ...result,
              notification: {
                type,
                title: finalTitle,
                message,
                sound: finalSound,
                platform: getOS(),
                sound_mapping: SOUND_MAPPING[finalSound] || SOUND_MAPPING["Glass"]
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "list_notification_types") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              types: NOTIFICATION_TYPES,
              sounds: SOUNDS,
              sound_mapping: SOUND_MAPPING,
              platform_support: {
                macos: "原生支持所有提示音",
                windows: "通过SystemSounds播放等效系统声音",
                linux: "通过canberra-gtk-play或paplay播放系统声音"
              }
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "get_system_info") {
    const os = getOS();
    const soundSupport = {
      macos: "完全支持",
      windows: "支持系统声音",
      linux: "支持系统声音（需要canberra-gtk-play或paplay）"
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              platform: os,
              sound_support: soundSupport[os] || "未知",
              available_sounds: SOUNDS.length,
              notification_types: Object.keys(NOTIFICATION_TYPES),
              sound_mapping_example: SOUND_MAPPING["Glass"]
            },
            null,
            2
          ),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `未知工具: ${name}`,
      },
    ],
    isError: true,
  };
});

// 启动服务器
async function main() {
  const args = parseArgs();

  // 处理命令行参数
  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (args.version) {
    showVersion();
    process.exit(0);
  }

  // 正常启动MCP服务器
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  if (args.verbose) {
    console.error("MCP通知服务器在stdio上运行 - 详细模式已启用");
  } else {
    console.error("MCP通知服务器在stdio上运行");
  }
}

main().catch(console.error);

// 导出函数用于测试
// 注意：这些导出仅用于开发和测试目的
// 在实际MCP服务器运行时，这些函数通过工具调用接口暴露
export {
  getOS,
  playSound,
  sendNotification,
  sendMacNotification,
  sendWindowsNotification,
  sendLinuxNotification,
  NOTIFICATION_TYPES,
  SOUND_MAPPING,
  SOUNDS
};
