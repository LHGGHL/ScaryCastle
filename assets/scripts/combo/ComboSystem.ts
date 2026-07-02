import { _decorator, Component } from 'cc';
import { EventManager, Events } from '../core/EventManager';

const { ccclass, property } = _decorator;

/**
 * 连击系统
 * 连续在短时间内触发闹鬼会获得连击加成
 * 同类物品连续点击加成更高
 * 挂在关卡场景主控节点上
 */
@ccclass('ComboSystem')
export class ComboSystem extends Component {
    @property({ tooltip: '连击有效时间窗口（秒）' })
    public comboWindow: number = 1.5;

    @property({ tooltip: '连击伤害加成（每次连击增加的百分比）' })
    public comboDamageBonus: number = 0.15;  // 15%

    private _comboCount: number = 0;
    private _comboTimer: number = 0;
    private _lastComboGroup: string = '';     // 上次闹鬼的物品分组
    private _maxCombo: number = 0;             // 本关最高连击数

    update(dt: number) {
        if (this._comboCount > 0) {
            this._comboTimer -= dt;
            if (this._comboTimer <= 0) {
                this.resetCombo();
            }
        }
    }

    /**
     * 记录一次闹鬼，更新连击
     * @param comboGroup 物品的连击分组
     * @param scareValue 基础惊吓值
     * @returns 连击加成后的实际惊吓值
     */
    public registerHaunt(comboGroup: string, scareValue: number): number {
        // 同类物品连续点击，连击不重置
        if (comboGroup && comboGroup === this._lastComboGroup && this._comboCount > 0) {
            // 同类 bonus
            this._comboCount++;
        } else {
            // 不同类 — 如果在时间窗口内就加连击，否则重置
            if (this._comboTimer > 0) {
                this._comboCount++;
            } else {
                this._comboCount = 1;
            }
        }

        this._comboTimer = this.comboWindow;
        this._lastComboGroup = comboGroup;

        if (this._comboCount > this._maxCombo) {
            this._maxCombo = this._comboCount;
        }

        // 计算加成
        const bonus = 1 + (this._comboCount - 1) * this.comboDamageBonus;
        const finalValue = Math.round(scareValue * bonus);

        if (this._comboCount >= 3) {
            EventManager.emit(Events.COMBO_TRIGGERED, {
                comboCount: this._comboCount,
                bonusMultiplier: bonus,
                finalScareValue: finalValue,
            });
        }

        return finalValue;
    }

    /** 重置连击 */
    private resetCombo() {
        this._comboCount = 0;
        this._comboTimer = 0;
        this._lastComboGroup = '';
    }

    /** 获取本关最高连击 */
    public get maxCombo(): number { return this._maxCombo; }

    /** 当前连击数 */
    public get comboCount(): number { return this._comboCount; }
}
