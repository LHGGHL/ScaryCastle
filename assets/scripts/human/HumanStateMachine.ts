import { _decorator, Component, Sprite, Label, Color, Animation } from 'cc';
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

    @property({ type: Animation, tooltip: '动画组件（同节点）' })
    animationComp: Animation | null = null;

    @property({ tooltip: '动画剪辑名前缀（如 xiaoming_）' })
    clipPrefix: string = 'xiaoming_';

    @property({ type: Sprite, tooltip: '情绪气泡图标（!、?、💀）' })
    public bubbleIcon: Sprite | null = null;

    @property({ type: Label, tooltip: '头顶文字气泡' })
    public bubbleLabel: Label | null = null;

    private _humanData: HumanData | null = null;
    private _lastState: HumanState | null = null;

    onLoad() {
        this._humanData = this.node.getComponent(HumanData);
        if (!this.animationComp) {
            this.animationComp = this.node.getComponent(Animation);
        }
        if (this.bubbleIcon) this.bubbleIcon.node.active = false;
    }

    update(_dt: number) {
        if (!this._humanData || !this.animationComp) return;

        const state = this._humanData.state;
        if (state === this._lastState) return;
        this._lastState = state;

        // 根据状态播动画 + 气泡 + 音效
        switch (state) {
            case HumanState.IDLE:
                this.playAnim('idle', '');
                break;
            case HumanState.SUSPICIOUS:
                this.playAnim('suspicious', '?');
                EventManager.emit('playSFX', 'human_suspicious');
                break;
            case HumanState.SCARED:
                this.playAnim('scared', '!');
                EventManager.emit('playSFX', 'human_scared');
                break;
            case HumanState.TERRIFIED:
                this.playAnim('terrified', '!!');
                EventManager.emit('playSFX', 'human_terrified');
                break;
            case HumanState.FLEEING:
                this.playAnim('fleeing', '...');
                EventManager.emit('playSFX', 'human_fleeing');
                break;
            case HumanState.ESCAPED:
                this.node.active = false;
                EventManager.emit('playSFX', 'human_escaped');
                break;
        }
    }

    /** 播放动画 + 显示气泡 */
    private playAnim(stateName: string, bubbleText: string) {
        const clipName = this.clipPrefix + stateName;
        this.animationComp!.play(clipName);
        if (this.bubbleLabel) {
            this.bubbleLabel.string = bubbleText;
            this.bubbleLabel.node.active = bubbleText.length > 0;
        }
    }
}
