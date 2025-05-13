# 业务组件测试方案

我们的业务组件采用 storybook 自带的针对不同场景的用户行为模拟测试，详见：https://storybook.js.org/docs/writing-tests

## 如何启动 Storybook 用户行为模拟测试

> 在启动测试之前必须先启动需要测试的 Storybook 文档，否则会报错。

通过以下命令启动包含特定业务包的 Storybook：

```bash
npm run storybook
```

### 测试所有的组件

```bash
npm run test:storybook
```

### 测试特定组件或 stories 文件

你也可以更精确地指定测试范围：

```bash
# 测试特定包下的组件文件夹
npm run test:storybook <folder-name>

# 测试特定包下的 stories 文件
npm run test:storybook <story-filename>
```

示例：

```bash
# 比如测试 StorybookExample 组件，只需直接输入组件的文件夹名 StorybookExample
npm run test:storybook StorybookExample

# 比如测试 AppHeader.stories.tsx 文件，只需直接输入文件名
npm run test:storybook AppHeader.stories.tsx
```

## 常见问题

### AI 如何辅助基于现有业务组件代码生成用户行为模拟测试

1. 打开 Cursor Agent，选择代码能力最佳的模型（写该文档时是：Claude-3.7-Sonnet）

2. 输入 compoder storybook-test

3. 把所需要添加 stoybook 测试的组件文件夹拖过来

Cursor Agent 将会依次执行 👇

1. 基于拖进来的组件代码，生成 feature 文件
2. 基于 feature 文件，生成（优化现有） stories 文件，生成测试
3. 跑测试，遇到报错则根据报错信息自动修复
4. 再次验证测试的正确性（健壮性、覆盖率）

最终生成的文件包含：

- [ComponentName].feature // 描述组件的 feature 文件
- [ComponentName].stories.tsx // stories 文件，包含针对 feature 中补充场景下的变体和对应的测试
- coverage-analysis.md // 测试覆盖率分析报告

经测试，在 cursor0.48.7 版本中，整个流程基本上是全自动的，在流程跑完之后，需要人工介入的环节有：

- 确认 feature 文件是否符合预期
- 确认测试断言是否符合预期，有可能 ai 在修复测试失败的过程中，“偷懒”用了一些“不严谨”的断言，导致测试结果不准确。
