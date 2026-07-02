# 👻 惊吓城堡 (Haunted Castle)

> 一款 Cocos Creator 3.x 开发的 2D 休闲解谜小游戏

---

## 🎮 玩法简介

你是一只可爱的小鬼 👻，你的城堡闯进了一群不速之客！

**点击房间里的各种物品**（吊灯、椅子、收音机、冰箱...），让它们"闹鬼"动起来，制造各种灵异现象，把闯入者**吓得落荒而逃**。

- 🪑 点击家具 → 它们会抖动、闪烁、移动
- 😱 人类受惊 → 恐惧值飙升 → 尖叫逃跑
- 🔥 连续点击 → 触发连击加成，伤害更高
- ⚡ 管理能量 → 能量有限，合理分配每次闹鬼
- ⭐ 速通评级 → 越快吓跑所有人，星级越高

---

## 🎬 实机演示

▶️ **[点击观看演示视频](docs/demo.mp4)**

---

## 🚀 技术栈

| 技术 | 说明 |
|------|------|
| **引擎** | Cocos Creator 3.8.x |
| **语言** | TypeScript |
| **目标平台** | 抖音小游戏 / TapTap (Android) / Web |
| **最低系统** | Android 5.0+ / iOS 12+ |

---

## 📂 项目结构

```
assets/
├── scenes/                    # Cocos 场景文件 (.scene)
│   ├── MainMenu.scene         # 主菜单
│   ├── LevelSelect.scene      # 选关界面
│   ├── Level_01.scene ~ N     # 各关卡
│   └── Shop.scene             # 皮肤商店
│
├── scripts/                   # TypeScript 游戏脚本
│   ├── core/                  # 核心系统
│   │   ├── GameManager.ts     # 全局管理器（状态、金币、关卡切换）
│   │   ├── EventManager.ts    # 事件总线（模块间通信）
│   │   ├── AudioManager.ts    # 音频管理（BGM + SFX）
│   │   ├── SaveManager.ts     # 存档系统（本地存储、星级记录）
│   │   └── SceneManager.ts    # 场景管理（物品/人类注册）
│   │
│   ├── ghost/                 # 鬼魂系统（核心玩法）
│   │   ├── GhostController.ts # 鬼魂控制器（处理点击→闹鬼）
│   │   ├── HauntableItem.ts   # 可附身物品（动画、冷却、惊吓值）
│   │   ├── EnergySystem.ts    # 能量系统（消耗/回复）
│   │   └── ScareArea.ts       # 惊吓范围检测
│   │
│   ├── human/                 # 人类 AI 系统
│   │   ├── HumanData.ts       # 人类数据（性格、胆量、恐惧值）
│   │   ├── FearSystem.ts      # 恐惧值计算（距离/性格/人群）
│   │   ├── HumanStateMachine.ts # 状态机（外观切换）
│   │   └── HumanMovement.ts   # 移动 AI（闲逛/逃跑）
│   │
│   ├── level/                 # 关卡系统
│   │   ├── LevelConfig.ts     # 关卡配置表（物品+人类+阈值）
│   │   ├── LevelManager.ts    # 关卡管理器（计时/胜负判定）
│   │   ├── WinCondition.ts    # 过关条件
│   │   └── StarRating.ts      # 星级评定
│   │
│   ├── ui/                    # UI 系统
│   │   ├── MainMenuUI.ts      # 主菜单
│   │   ├── GameHUD.ts         # 游戏内 HUD（能量条/计时/连击）
│   │   ├── PausePanel.ts      # 暂停面板
│   │   ├── ResultPanel.ts     # 结算面板（星级/金币）
│   │   ├── LevelSelectUI.ts   # 选关界面
│   │   └── SettingsPanel.ts   # 设置面板（音量）
│   │
│   ├── economy/               # 经济系统
│   │   ├── CoinSystem.ts      # 金币管理
│   │   ├── ShopPanel.ts       # 皮肤商店
│   │   └── SkinManager.ts     # 皮肤加载/切换
│   │
│   ├── combo/                 # 连击系统
│   │   └── ComboSystem.ts     # 连击计算（加成/衰减/同类识别）
│   │
│   └── utils/                 # 工具
│       └── Config.ts          # 全局配置常量
│
├── resources/                 # 运行时动态加载资源
│   ├── sprites/               # 精灵图
│   │   ├── backgrounds/       # 场景背景（客厅/厨房/卧室...）
│   │   ├── items/             # 可闹鬼物品精灵
│   │   ├── humans/            # 人类角色精灵
│   │   └── ui/                # UI 元素精灵
│   ├── sounds/                # 音效
│   │   ├── bgm/               # 背景音乐
│   │   ├── sfx/               # 音效（闹鬼/尖叫）
│   │   └── ambient/           # 环境音
│   ├── animations/            # 动画资源
│   └── fonts/                 # 字体
│
├── prefabs/                   # 预制体
│   ├── items/                 # 物品预制体
│   ├── humans/                # 人类预制体
│   └── ui/                    # UI 预制体
│
└── textures/                  # 静态贴图
```

---

## 🛠 快速开始

### 环境要求

- Cocos Dashboard 2.2+
- Cocos Creator 3.8.x
- Node.js 16+

### 拉取项目

```bash
git clone <你的仓库地址>
```

### 用 Cocos Creator 打开

1. 启动 **Cocos Dashboard**
2. 点击 **项目** → **导入**
3. 选择项目根目录 `惊吓城堡`
4. 双击打开

### 构建发布

| 平台 | 方式 |
|------|------|
| **抖音小游戏** | Cocos Creator → 构建发布 → 抖音小游戏 → 用抖音开发者工具调试 |
| **Android (TapTap)** | 构建发布 → Android → 生成 APK |
| **Web 预览** | 构建发布 → Web Mobile → 本地 HTTP 服务打开 |

---

## 🎯 开发路线图

- [x] 核心鬼魂交互（点击物品→闹鬼→惊吓）
- [x] 人类 AI（恐惧值/状态机/逃跑）
- [x] 能量系统 + 连击系统
- [x] 关卡配置 + 计时 + 三星评价
- [x] 存档系统 + 金币 + 皮肤商店
- [ ] 资产接入（美术素材 + 音效）
- [ ] 10 个关卡内容填充
- [ ] 抖音 SDK 接入（分享、激励视频）
- [ ] 性能优化 + 真机测试
- [ ] TapTap 商店页 + 上线

---

## 📄 开源协议

[MIT License](LICENSE)

---

## 🙏 致谢

- 游戏引擎: [Cocos Creator](https://www.cocos.com/creator)
- 美术素材来源: itch.io / 爱给网
- 音效来源: freesound.org / zapsplat.com

---

📮 lhgasdfghj@163.com
