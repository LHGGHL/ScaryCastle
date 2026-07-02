/**
 * 全局游戏配置常量
 * 所有数值集中管理，方便数值调优
 */

export const Config = {
    /** 游戏名称 */
    GAME_NAME: '惊吓城堡',

    /** 屏幕分辨率 */
    DESIGN_WIDTH: 1280,
    DESIGN_HEIGHT: 720,

    // ========== 鬼魂系统 ==========
    GHOST: {
        /** 鬼魂光标的默认跟随速度 */
        CURSOR_FOLLOW_SPEED: 300,
    },

    // ========== 能量系统 ==========
    ENERGY: {
        /** 默认最大能量 */
        DEFAULT_MAX: 100,
        /** 默认每秒回复 */
        DEFAULT_REGEN: 3,
    },

    // ========== 连击系统 ==========
    COMBO: {
        /** 连击时间窗口（秒） */
        WINDOW: 1.5,
        /** 每次连击伤害加成 */
        BONUS_PER_COMBO: 0.15,
        /** 显示的最低连击数 */
        SHOW_MIN: 3,
    },

    // ========== 人类系统 ==========
    HUMAN: {
        /** 默认恐惧衰减速度（每秒） */
        DEFAULT_FEAR_DECAY: 2,
        /** 人群效应范围（像素） */
        GROUP_EFFECT_RADIUS: 200,
        /** 人群中每人加成 */
        GROUP_EFFECT_BONUS: 0.15,
        /** 默认受害后的怀疑时间（秒） */
        DEFAULT_SUSPICION_TIME: 3,
    },

    // ========== 经济系统 ==========
    ECONOMY: {
        /** 每关基础奖励 */
        BASE_COIN_REWARD: 10,
        /** 每颗星奖励倍率 */
        STAR_MULTIPLIER: 1,
    },

    // ========== 抖音小游戏 ==========
    DOUYIN: {
        /** 激励视频广告位 ID */
        REWARDED_AD_UNIT_ID: '',
    },
};
