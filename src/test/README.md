# 单元测试指南

本项目已配置Jest测试框架，用于进行单元测试。

## 已添加的测试

### 通用工具函数 (`src/common/`)
- **utils.test.ts**: 测试Chrome存储API、排序函数、时间戳格式化等工具函数
- **is.test.ts**: 测试对象类型判断函数

### 内容脚本工具 (`src/content/modules/`)
- **content-utils.test.ts**: 测试DOM操作、事件模拟、章节标题提取等功能

### 类型定义 (`src/worker/types/`)
- **BookInfo.test.ts**: 测试书籍详细信息类型定义
- **Book.test.ts**: 测试书籍基本信息类型定义

## 运行测试

### 基本命令
```bash
# 运行所有测试
npm test

# 监听模式（文件变化时自动运行）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 测试环境配置

测试环境已预配置以下Mock：
- **Chrome APIs**: 扩展程序API（storage, runtime, tabs等）
- **jQuery**: DOM操作库
- **SweetAlert2**: 弹窗通知库

## 编写新测试

### 测试文件命名
- 测试文件应放在 `__tests__` 目录下
- 命名格式：`[模块名].test.ts`

### 测试示例
```typescript
import { yourFunction } from '../your-module';

describe('your-module', () => {
  beforeEach(() => {
    // 测试前的setup
  });

  it('should do something', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Chrome API Mock使用
```typescript
// 在测试中使用Chrome API
(global.chrome as any).storage.local.get = jest.fn((callback: any) => {
  callback({ key: 'value' });
});
```

## 测试覆盖率

当前测试覆盖了项目的核心工具函数和类型定义。主要覆盖区域：
- 通用工具函数：100% 覆盖率
- 类型定义：完整的接口验证
- DOM操作函数：基本功能测试

## 注意事项

1. **异步测试**: 使用 `async/await` 处理Promise
2. **Mock清理**: 在 `beforeEach` 中清理Mock状态
3. **时区问题**: 时间相关测试避免硬编码具体时间值
4. **浏览器API**: 使用Jest提供的DOM环境和Mock