import { EventTarget } from 'cc';

/**
 * 事件管理器 - 全局事件总线
 * 用于模块间解耦通信
 *
 * 使用方式：
 *   EventManager.on('事件名', callback, this)
 *   EventManager.emit('事件名', 参数)
 *   EventManager.off('事件名', callback, this)
 */
class _EventManager {
    private _target: EventTarget = new EventTarget();

    public on(event: string, callback: (...args: any[]) => void, target?: any) {
        this._target.on(event, callback, target);
    }

    public once(event: string, callback: (...args: any[]) => void, target?: any) {
        this._target.once(event, callback, target);
    }

    public off(event: string, callback?: (...args: any[]) => void, target?: any) {
        this._target.off(event, callback, target);
    }

    public emit(event: string, ...args: any[]) {
        this._target.emit(event, ...args);
    }

    /** 清除所有事件监听 */
    public clear() {
        this._target.clear();
    }
}

/** 全局事件管理器单例 */
export const EventManager = new _EventManager();

// ========== 预定义事件名 ==========
export enum Events {
    /** 金币变动 {number} */
    COIN_CHANGED = 'coinChanged',
    /** 游戏暂停 */
    GAME_PAUSED = 'gamePaused',
    /** 游戏继续 */
    GAME_RESUMED = 'gameResumed',
    /** 物品被点击触发闹鬼 {itemId: string, scareValue: number} */
    ITEM_HAUNTED = 'itemHaunted',
    /** 人类受惊 {humanId: string, fearDelta: number, currentFear: number} */
    HUMAN_SCARED = 'humanScared',
    /** 人类逃跑 {humanId: string} */
    HUMAN_FLED = 'humanFled',
    /** 所有人类逃跑成功，关卡通关 */
    LEVEL_COMPLETE = 'levelComplete',
    /** 时间耗尽，关卡失败 */
    LEVEL_FAILED = 'levelFailed',
    /** 连击触发 {comboCount: number} */
    COMBO_TRIGGERED = 'comboTriggered',
    /** 能量变化 {current: number, max: number} */
    ENERGY_CHANGED = 'energyChanged',
    /** 关卡开始 */
    LEVEL_STARTED = 'levelStarted',
}
