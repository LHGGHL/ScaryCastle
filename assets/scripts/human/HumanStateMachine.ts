import { _decorator, Component, Sprite, Label, Color } from 'cc';
import { HumanData, HumanState } from './HumanData';
import { EventManager, Events } from '../core/EventManager';

const { ccclass, property } = _decorator;

/**
 * 人类状态机 — 控制外观表现
 * 根据 HumanData 的状态切换表情/动画/气泡
 * 挂在每个人类角色节点上
 */
@ccclass('HumanStateMachine')
export class HumanStateMachine extends Component {
    @property({ type: Sprite, tooltip: '角色精灵' })
    public characterSprite: Sprite | null = null;

    @property({ type: Sprite, tooltip: '情绪气泡图标（!、?、💀）' })
    public bubbleIcon: Sprite | null = null;

    @property({ type: Label, tooltip: '头顶文字气泡' })
    public bubbleLabel: Label | null = null;

    // ---- 不同状态的表情帧名/颜色 ----
    @property({ type: Color, tooltip: '正常颜色' })
    public idleColor: Color = new Color(255, 255, 255, 255);

    @property({ type: Color, tooltip: '怀疑颜色（偏黄）' })
    public suspiciousColor: Color = new Color(255, 255, 150, 255);

    @property({ type: Color, tooltip: '害怕颜色（偏蓝）' })
    public scaredColor: Color = new Color(180, 200, 255, 255);

    @property({ type: Color, tooltip: '极度恐惧颜色（惨白）' })
    public terrifiedColor: Color = new Color(220, 220, 255, 255);

    @property({ type: Color, tooltip: '逃跑颜色（红色）' })
    public fleeingColor: Color = new Color(255, 150, 150, 255);

    private _humanData: HumanData | null = null;
    private _lastState: HumanState = HumanState.IDLE;

    onLoad() {
        this._humanData = this.node.getComponent(HumanData);
        if (this.bubbleIcon) this.bubbleIcon.node.active = false;
    }

    update(_dt: number) {
        if (!this._humanData) return;

        const state = this._humanData.state;
        if (state === this._lastState) return;
        this._lastState = state;

        // 根据状态切换外观
        switch (state) {
            case HumanState.IDLE:
                this.setAppearance(this.idleColor, '');
                break;
            case HumanState.SUSPICIOUS:
                this.setAppearance(this.suspiciousColor, '?');
                break;
            case HumanState.SCARED:
                this.setAppearance(this.scaredColor, '!');
                break;
            case HumanState.TERRIFIED:
                this.setAppearance(this.terrifiedColor, '!!');
                break;
            case HumanState.FLEEING:
                this.setAppearance(this.fleeingColor, '...');
                break;
            case HumanState.ESCAPED:
                this.node.active = false; // 消失
                break;
        }
    }

    private setAppearance(color: Color, bubbleText: string) {
        if (this.characterSprite) {
            this.characterSprite.color = color;
        }
        if (this.bubbleLabel) {
            this.bubbleLabel.string = bubbleText;
            this.bubbleLabel.node.active = bubbleText.length > 0;
        }
    }
}
