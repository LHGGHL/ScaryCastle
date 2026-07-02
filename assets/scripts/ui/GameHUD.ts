import { _decorator, Component, Label, Sprite, UITransform } from 'cc';
import { EventManager, Events } from '../core/EventManager';
import { LevelManager } from '../level/LevelManager';

const { ccclass, property } = _decorator;

/**
 * 游戏内 HUD — 显示能量条、剩余人数、计时器、连击数
 * 挂在关卡场景的 Canvas 上
 */
@ccclass('GameHUD')
export class GameHUD extends Component {
    @property({ type: Label, tooltip: '剩余时间文本' })
    public timeLabel: Label | null = null;

    @property({ type: Label, tooltip: '剩余人数文本（X/N）' })
    public remainLabel: Label | null = null;

    @property({ type: Label, tooltip: '连击数文本' })
    public comboLabel: Label | null = null;

    @property({ type: Sprite, tooltip: '能量条精灵（用 fill 或 scale 实现）' })
    public energyBar: Sprite | null = null;

    @property({ type: LevelManager, tooltip: '关卡管理器（用于读取时间和人数）' })
    public levelManager: LevelManager | null = null;

    private _energyMaxWidth: number = 0;
    private _lastFledCount: number = -1;

    onLoad() {
        if (this.energyBar) {
            const uiTransform = this.energyBar.node.getComponent(UITransform);
            if (uiTransform) this._energyMaxWidth = uiTransform.width;
        }

        // 监听事件
        EventManager.on(Events.ENERGY_CHANGED, this.onEnergyChanged, this);
        EventManager.on(Events.HUMAN_FLED, this.onHumanFled, this);
        EventManager.on(Events.COMBO_TRIGGERED, this.onComboTriggered, this);

        // 初始隐藏连击
        if (this.comboLabel) this.comboLabel.node.active = false;
    }

    update(_dt: number) {
        if (this.levelManager) {
            this.updateTime(this.levelManager.remainingTime);
            // 只在有人逃跑时更新显示（避免每帧改 Label 文字）
            if (this._lastFledCount !== this.levelManager.fledCount) {
                this._lastFledCount = this.levelManager.fledCount;
                this.updateRemain(this.levelManager.totalHumans, this.levelManager.fledCount);
            }
        }
    }

    onDestroy() {
        EventManager.off(Events.ENERGY_CHANGED, this.onEnergyChanged, this);
        EventManager.off(Events.HUMAN_FLED, this.onHumanFled, this);
        EventManager.off(Events.COMBO_TRIGGERED, this.onComboTriggered, this);
    }

    /** 更新剩余时间显示 */
    public updateTime(remaining: number) {
        if (!this.timeLabel) return;
        const sec = Math.max(0, Math.ceil(remaining));
        const min = Math.floor(sec / 60);
        const s = sec % 60;
        this.timeLabel.string = `${min}:${s.toString().padStart(2, '0')}`;

        // 最后 10 秒变红
        if (sec <= 10) {
            this.timeLabel.color = new (require('cc').Color)(255, 60, 60, 255);
        }
    }

    /** 更新剩余人数 */
    public updateRemain(total: number, fled: number) {
        if (!this.remainLabel) return;
        this.remainLabel.string = `${total - fled} / ${total}`;
    }

    /** 能量变化 */
    private onEnergyChanged(data: { current: number; max: number }) {
        if (this.energyBar) {
            const uiTransform = this.energyBar.node.getComponent(UITransform);
            if (uiTransform) {
                const percent = data.current / data.max;
                uiTransform.width = this._energyMaxWidth * percent;
            }
        }
    }

    /** 有人逃跑 */
    private onHumanFled(_data: { humanId: string }) {
        // 外部通过 updateRemain 更新
    }

    /** 连击触发 */
    private onComboTriggered(data: { comboCount: number }) {
        if (!this.comboLabel) return;
        if (data.comboCount >= 3) {
            this.comboLabel.node.active = true;
            this.comboLabel.string = `连击 x${data.comboCount}!`;
            // 1 秒后隐藏
            this.scheduleOnce(() => {
                if (this.comboLabel) this.comboLabel.node.active = false;
            }, 1);
        }
    }
}
