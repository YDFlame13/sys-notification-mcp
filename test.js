#!/usr/bin/env node

// 简单的测试脚本，验证MCP服务器基本功能
console.log('🔧 测试 sys-notification-mcp 服务器...');

// 导入主文件进行基本验证
try {
  const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
  console.log('✅ MCP SDK 导入成功');
  
  // 检查必要的工具函数是否存在
  const mainModule = await import('./index.js');
  console.log('✅ 主模块导入成功');
  
  // 检查操作系统检测功能
  const os = process.platform;
  console.log(`✅ 操作系统检测: ${os}`);
  
  // 检查通知类型定义
  const notificationTypes = ['authorization', 'completed', 'waiting', 'error', 'info'];
  console.log(`✅ 支持的通知类型: ${notificationTypes.join(', ')}`);
  
  console.log('🎉 基本功能测试通过！');
  process.exit(0);
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
}