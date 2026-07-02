import { _decorator, Component } from 'cc';
import { EventManager, Events } from '../core/EventManager';

const { ccclass, property } = _decorator;

/**
 * 鬼魂能量系统
 * 能量不足时无法触发物品闹鬼
 * 挂在关卡场景主控节点上
 */
@ccclass('EnergySystem')
export class EnergySystem extends Component {
    @property({ tooltip: '最大能量值' })
    public maxEnergy: number = 100;

    @property({ tooltip: '每秒自动回复量' })
    public regenPerSec: number = 3;

    private _currentEnergy: number = 100;

    onLoad() {
        this._currentEnergy = this.maxEnergy;
        EventManager.emit(Events.ENERGY_CHANGED, { current: this._currentEnergy, max: this.maxEnergy });
    }

    update(dt: number) {
        // 自动回复
        if (this._currentEnergy < this.maxEnergy) {
            this._currentEnergy = Math.min(this.maxEnergy, this._currentEnergy + this.regenPerSec * dt);
            EventManager.emit(Events.ENERGY_CHANGED, { current: this._currentEnergy, max: this.maxEnergy });
        }
    }

    /** 消耗能量 */
    public consume(amount: number) {
        this._currentEnergy = Math.max(0, this._currentEnergy - amount);
        EventManager.emit(Events.ENERGY_CHANGED, { current: this._currentEnergy, max: this.maxEnergy });
    }

    /** 是否有足够能量 */
    public hasEnough(amount: number): boolean {
        return this._currentEnergy >= amount;
    }

    /** 立即回复一定能量（道具或过关奖励） */
    public restore(amount: number) {
        this._currentEnergy = Math.min(this.maxEnergy, this._currentEnergy + amount);
        EventManager.emit(Events.ENERGY_CHANGED, { current: this._currentEnergy, max: this.maxEnergy });
    }

    /** 能量百分比 */
    public get energyPercent(): number {
        return this._currentEnergy / this.maxEnergy;
    }

    /** 当前能量 */
    public get currentEnergy(): number {
        return this._currentEnergy;
    }
}
