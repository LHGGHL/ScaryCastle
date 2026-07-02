import { _decorator, Component } from 'cc';
import { EventManager, Events } from '../core/EventManager';
import { GameManager } from '../core/GameManager';

const { ccclass } = _decorator;

/**
 * 金币系统 — 关卡内金币获取展示
 * 挂在关卡场景 Canvas 上，只做展示，实际数据在 GameManager
 */
@ccclass('CoinSystem')
export class CoinSystem extends Component {
    private _earnedThisLevel: number = 0;

    onLoad() {
        EventManager.on(Events.LEVEL_COMPLETE, this.onLevelComplete, this);
    }

    onDestroy() {
        EventManager.off(Events.LEVEL_COMPLETE, this.onLevelComplete, this);
    }

    /** 结算时记录本关金币 */
    private onLevelComplete(data: { coinReward: number }) {
        this._earnedThisLevel = data.coinReward;
    }

    /** 获取总金币 */
    public get totalCoin(): number {
        return GameManager.instance.totalCoin;
    }

    /** 本关获得的金币 */
    public get earnedThisLevel(): number {
        return this._earnedThisLevel;
    }
}
