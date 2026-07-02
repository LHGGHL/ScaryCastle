import { _decorator, Component, Label, Button, Node, Sprite } from 'cc';
import { EventManager, Events } from '../core/EventManager';
import { GameManager } from '../core/GameManager';
import { SaveManager } from '../core/SaveManager';

const { ccclass, property } = _decorator;

/**
 * 结算面板 — 过关或失败时弹出
 * 挂在关卡场景 Canvas 上
 */
@ccclass('ResultPanel')
export class ResultPanel extends Component {
    @property({ type: Label, tooltip: '标题（通关！/ 失败！）' })
    public titleLabel: Label | null = null;

    @property({ type: Node, tooltip: '星星容器' })
    public starsContainer: Node | null = null;

    @property({ type: Label, tooltip: '用时文本' })
    public timeLabel: Label | null = null;

    @property({ type: Label, tooltip: '金币奖励' })
    public coinLabel: Label | null = null;

    @property({ type: Button, tooltip: '下一关按钮' })
    public nextBtn: Button | null = null;

    @property({ type: Button, tooltip: '重试按钮' })
    public retryBtn: Button | null = null;

    @property({ type: Button, tooltip: '返回主菜单' })
    public homeBtn: Button | null = null;

    onLoad() {
        this.node.active = false;

        EventManager.on(Events.LEVEL_COMPLETE, this.onWin, this);
        EventManager.on(Events.LEVEL_FAILED, this.onLose, this);

        this.nextBtn?.node.on(Button.EventType.CLICK, this.onNext, this);
        this.retryBtn?.node.on(Button.EventType.CLICK, this.onRetry, this);
        this.homeBtn?.node.on(Button.EventType.CLICK, this.onHome, this);
    }

    onDestroy() {
        EventManager.off(Events.LEVEL_COMPLETE, this.onWin, this);
        EventManager.off(Events.LEVEL_FAILED, this.onLose, this);
    }

    /** 通关 */
    private onWin(data: { levelId: number; stars: number; coinReward: number; time: number }) {
        this.node.active = true;

        if (this.titleLabel) this.titleLabel.string = '🎉 通关！';
        if (this.timeLabel) this.timeLabel.string = `用时: ${data.time.toFixed(1)}秒`;
        if (this.coinLabel) this.coinLabel.string = `+${data.coinReward}`;

        // 显示星星
        this.showStars(data.stars);

        // 存档星级
        SaveManager.setLevelStar(data.levelId, data.stars);

        // 下一关按钮
        if (this.nextBtn) this.nextBtn.node.active = true;
    }

    /** 失败 */
    private onLose(_data: { levelId: number }) {
        this.node.active = true;

        if (this.titleLabel) this.titleLabel.string = '😈 时间到...';
        this.showStars(0);
        if (this.nextBtn) this.nextBtn.node.active = false;
    }

    /** 显示星星 */
    private showStars(count: number) {
        if (!this.starsContainer) return;
        for (let i = 0; i < this.starsContainer.children.length; i++) {
            const child = this.starsContainer.children[i];
            child.active = i < count;
        }
    }

    private onNext() {
        const gm = GameManager.instance;
        gm.loadLevel(gm.currentLevelId + 1);
    }

    private onRetry() {
        const gm = GameManager.instance;
        gm.loadLevel(gm.currentLevelId);
    }

    private onHome() {
        GameManager.instance.goToMainMenu();
    }
}
