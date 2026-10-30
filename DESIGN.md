# 设计系统 · 海岸与纸页

此页面应用以下两个开源项目。V1 使用文档方法；V2 已在项目外准备官方 Windows Impeccable CLI 并执行 context 与一次 detect 文件扫描。未全局安装插件。

1. https://github.com/pbakaus/impeccable ：V2 采用 distill、clarify、animate 与 craft-floor/polish。精简泛化文案，栏目标题直接说明内容，海浪作为唯一主要动效。CLI 结果与逐项处理见 VERIFICATION-V2.md，不将扫描结果冒充全量质量认证。
2. https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/oura/DESIGN.md ：借鉴 Oura 的暖纸底、摄影主导、衬线显示字与无衬线正文搭配、宽留白、细分隔线与明确主行动。未复制品牌标志、商业字体或原站布局。

## Tokens

| Token | Value | 用途 |
| --- | --- | --- |
| paper | #f6f4ee | 主底色 |
| white | #fffefa | 轻浅表面 |
| ink | #173c45 | 标题、正文 |
| muted | #526769 | 次级文字 |
| ocean | #183f49 | 深色段落与 CTA |
| sea | #326e6a | 可交互强调 |
| line | #d9ddd5 | 分隔线 |
| sand | #e5d5b7 | 深色段落的暖色强调 |

标题：自托管 Noto Serif SC，正文：Microsoft YaHei / PingFang SC / sans-serif，英文展示 Georgia。大标题最大 72px，正文 16px / 1.8。容器最大 1200px，桌面横向边距48px，手机24px；主段落间距96px，手机64px。

## 页面组成

- 纯色页眉与低噪声锚点导航。
- 真实瓦努阿图圣埃斯皮里图海岸摄影大幅首屏，标题与主要入口置左。图片自身承担表达，不使用虚构护照与政府背书。
- 项目概览：非等分卡片的编辑式说明与定义表。
- 费用：四种家庭构成切换，清楚分开基础金额和额外费用。
- 条件：主申请人强调区与随行人分组列表。
- 流程：七个有实际顺序意义的编号步骤。
- 服务与案例：保留真实空状态，不编造客户、获批数量和证言。
- FAQ：原生 details，可键盘操作；资料清单使用本地勾选与文本下载。

## 适配与交互

980px 下简化导航；760px 下两栏堆叠、图片构图转为顶部海岸、费用按钮两列；最低320px无水平溢出。触控目标至少44px，功能性小字至少11px，清晰 focus-visible，跳转内容链接。内容默认可见，不使用全页淡入或重复的逐项滚入。

## V2 海浪动效

- 焦点：既有海岸照片上的海面折射与光照变化；不移动页面正文。
- 实现：原生 WebGL，无外部运行库。叠加三个行进波高度场，按波面梯度计算三维法线，再计算照片采样折射、定向光照与局部高光。按照片水色减弱沙地与植被的形变。
- 范围：这是基于照片的立体水面着色（2.5D），不是三维网格海洋、完整流体模拟或实拍视频。
- 控制：首屏提供播放/暂停。prefers-reduced-motion 默认暂停；离屏、页面隐藏或 pagehide 停止请求渲染帧；恢复可见后按原状态继续。
- 预算：桌面最高30次绘制/秒，手机最高24次/秒；画布DPR不超过1.25，宽不超过1600像素。真实设备流畅度仍需验收，内置浏览器存在整体rAF限帧。
- 回退：WebGL不可用、纹理加载失败或上下文丢失时保留原照片；恢复上下文后重新初始化。无声音、追踪与额外网络素材请求。

## 验证边界

以实际浏览器桌面和手机截图、DOM尺寸、费用切换、导航、FAQ、清单下载行为作为验收证据。此文件描述本地预览，不代表政府核准或生产网站已上线。

## Round 6 polish
- Reference: impeccable polish/craft passes; awesome-design-md Bugatti (austere luxury: hairlines, wide tracking, restraint) + Oura (warm calm).
- Existing palette kept; added gold hairline accent #b08d57 for ornaments only. No new copy.
- Serif subset covers all page characters; flag/other emoji removed.
- Compact service grid (4/3/2 columns), card lift on hover, button sheen, diamond-bullet support list, subtle scroll reveal (respects prefers-reduced-motion).
