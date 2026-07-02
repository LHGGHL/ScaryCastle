/**
 * 关卡配置数据结构
 * 每个关卡的完整配置在此定义
 */

/** 关卡中的可闹鬼物品配置 */
export interface LevelItemConfig {
    id: string;             // 物品 ID
    name: string;           // 显示名称
    hauntType: string;      // 闹鬼类型：shake/flicker/move/sound/ghostImage/throw
    scareValue: number;     // 基础惊吓值
    cooldown: number;       // 冷却秒数
    energyCost: number;     // 能量消耗
    comboGroup: string;     // 连击分组
    posX: number;           // 场景坐标 X
    posY: number;           // 场景坐标 Y
}

/** 关卡中的人类配置 */
export interface LevelHumanConfig {
    id: string;             // 角色 ID
    name: string;           // 名字
    personality: string;    // coward/normal/brave/skeptic
    bravery: number;        // 胆量 0-100
    maxFear: number;        // 最大恐惧值
    posX: number;
    posY: number;
    patrolMinX: number;     // 巡逻左界
    patrolMaxX: number;     // 巡逻右界
}

/** 关卡配置 */
export interface LevelConfig {
    levelId: number;                // 关卡序号
    levelName: string;              // 关卡名
    description: string;            // 关卡描述
    timeLimit: number;              // 时间限制（秒，0 表示不限时）
    maxEnergy: number;              // 初始最大能量
    items: LevelItemConfig[];       // 可闹鬼物品列表
    humans: LevelHumanConfig[];     // 人类列表
    starThresholds: number[];       // 三星时间阈值 [3星, 2星, 1星]（秒）
    unlockCost: number;             // 解锁所需星数
    backgroundPath: string;         // 背景图路径
}

// ========== 示例关卡数据 ==========

/** 第 1 关 - 教学关：一间客厅，2 个胆小鬼，3 件物品 */
export const LEVEL_01: LevelConfig = {
    levelId: 1,
    levelName: '初次闹鬼',
    description: '两个胆小鬼闯进了客厅，给他们点颜色看看！',
    timeLimit: 60,
    maxEnergy: 100,
    items: [
        { id: 'lamp_01',    name: '吊灯',     hauntType: 'flicker',   scareValue: 15, cooldown: 2, energyCost: 10, comboGroup: 'light', posX: -200, posY: 150 },
        { id: 'chair_01',   name: '椅子',     hauntType: 'shake',     scareValue: 10, cooldown: 1.5, energyCost: 8, comboGroup: 'furniture', posX: -350, posY: -80 },
        { id: 'radio_01',   name: '收音机',   hauntType: 'sound',     scareValue: 20, cooldown: 3, energyCost: 15, comboGroup: 'electronic', posX: 300, posY: -60 },
    ],
    humans: [
        { id: 'human_01', name: '小明', personality: 'coward',  bravery: 20, maxFear: 80,  posX: -300, posY: -80, patrolMinX: -500, patrolMaxX: -100 },
        { id: 'human_02', name: '小红', personality: 'normal',  bravery: 50, maxFear: 100, posX: 200, posY: -80, patrolMinX: 0, patrolMaxX: 450 },
    ],
    starThresholds: [20, 35, 50],  // 20秒内通关=3星, 35秒=2星, 50秒=1星
    unlockCost: 0,
    backgroundPath: 'sprites/backgrounds/living_room',
};

/** 第 2 关 */
export const LEVEL_02: LevelConfig = {
    levelId: 2,
    levelName: '厨房派对',
    description: '3 个人在厨房开派对，闹鬼让他们滚！',
    timeLimit: 75,
    maxEnergy: 120,
    items: [
        { id: 'pan_01', name: '平底锅', hauntType: 'shake', scareValue: 12, cooldown: 1.5, energyCost: 8, comboGroup: 'kitchen', posX: 200, posY: 300 },
        { id: 'knife_01', name: '菜刀', hauntType: 'move', scareValue: 18, cooldown: 2.5, energyCost: 12, comboGroup: 'kitchen', posX: 350, posY: 320 },
        { id: 'cabinet_01', name: '橱柜', hauntType: 'shake', scareValue: 10, cooldown: 2, energyCost: 10, comboGroup: 'furniture', posX: 500, posY: 250 },
        { id: 'fridge_01', name: '冰箱', hauntType: 'flicker', scareValue: 22, cooldown: 3, energyCost: 20, comboGroup: 'electronic', posX: 600, posY: 200 },
    ],
    humans: [
        { id: 'human_03', name: '大壮', personality: 'brave', bravery: 80, maxFear: 130, posX: 150, posY: 200, patrolMinX: 100, patrolMaxX: 350 },
        { id: 'human_04', name: '阿娟', personality: 'normal', bravery: 50, maxFear: 100, posX: 400, posY: 200, patrolMinX: 300, patrolMaxX: 550 },
        { id: 'human_05', name: '老王', personality: 'skeptic', bravery: 60, maxFear: 110, posX: 550, posY: 200, patrolMinX: 450, patrolMaxX: 650 },
    ],
    starThresholds: [25, 45, 65],
    unlockCost: 3,
    backgroundPath: 'sprites/backgrounds/kitchen',
};

/** 所有关卡配置表 */
export const ALL_LEVELS: LevelConfig[] = [LEVEL_01, LEVEL_02];
