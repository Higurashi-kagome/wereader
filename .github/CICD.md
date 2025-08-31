# CI/CD 流程说明

## 概述

项目现在配置了完整的持续集成和持续部署流程，确保代码质量和稳定性。

## 工作流程

### 1. 持续集成 (CI) - `.github/workflows/ci.yml`

**触发条件:**
- 推送到 `master`, `main`, `develop` 分支
- 向这些分支创建 Pull Request

**执行步骤:**
1. **代码质量检查** - 在多个Node.js版本(18, 20)上运行
2. **ESLint检查** - 确保代码符合规范
3. **单元测试** - 运行所有测试用例
4. **测试覆盖率** - 生成并上传到Codecov
5. **构建测试** - 验证代码可以正常构建

### 2. 部署流程 (CD) - `.github/workflows/deploy.yml`

**触发条件:**
- 手动触发 (workflow_dispatch)
- 推送版本标签 (v*.*.*)

**执行阶段:**

#### 阶段1: 预部署质量检查
- ESLint代码规范检查
- 运行所有单元测试
- 执行生产环境构建测试

#### 阶段2: 构建和打包
- 构建扩展程序
- 更新版本号
- 创建发布包
- 生成GitHub Release

#### 阶段3: 发布
- 上传到Chrome Web Store
- 发布到Microsoft Edge Add-ons

## 质量保证

### 测试要求
- 所有单元测试必须通过
- ESLint检查必须无错误
- 代码覆盖率报告自动生成

### 构建要求
- 开发环境构建成功
- 生产环境构建成功
- 必要文件检查通过

## 本地开发工作流

1. **开发代码**
2. **运行检查:**
   ```bash
   npm run lint        # 代码规范检查
   npm test            # 运行测试
   npm run build-dev   # 测试构建
   ```
3. **提交代码** - CI自动运行检查
4. **创建PR** - 所有检查必须通过才能合并
5. **发布版本** - 触发完整的部署流程

## 故障处理

### CI失败时
- 检查ESLint错误并修复
- 查看测试失败日志
- 确保所有依赖正确安装

### 部署失败时
- 检查版本号格式是否正确
- 验证所有secrets配置是否完整
- 查看构建日志中的错误信息

## 配置说明

### 环境变量 (Secrets)
部署需要以下GitHub Secrets:

**Chrome Web Store:**
- `CI_GOOGLE_EXTENSION_ID`
- `CI_GOOGLE_CLIENT_ID`
- `CI_GOOGLE_CLIENT_SECRET`
- `CI_GOOGLE_REFRESH_TOKEN`

**Microsoft Edge:**
- `CI_EDGE_PRODUCT_ID`
- `CI_EDGE_CLIENT_ID`
- `CI_EDGE_CLIENT_SECRET`
- `CI_EDGE_ACCESS_TOKEN_URL`

### Node.js版本
- CI测试: Node.js 18, 20
- 部署构建: Node.js 18

这个CI/CD配置确保了每次代码变更都经过严格的质量检查，只有通过所有测试的代码才能被部署到生产环境。