import { _decorator, Component, Button, Node } from 'cc';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

/**
 * 暂停面板
 * 挂在关卡场景 Canvas 上的暂停面板节点
 */
@ccclass('PausePanel')
export class PausePanel extends Component {
    @property({ type: Button, tooltip: '继续按钮' })
    public resumeBtn: Button | null = null;

    @property({ type: Button, tooltip: '重新开始按钮' })
    public restartBtn: Button | null = null;

    @property({ type: Button, tooltip: '退出按钮' })
    public quitBtn: Button | null = null;

    @property({ type: Button, tooltip: '暂停按钮（始终显示）' })
    public pauseToggleBtn: Button | null = null;

    onLoad() {
        // 初始隐藏
        this.node.active = false;

        this.resumeBtn?.node.on(Button.EventType.CLICK, this.onResume, this);
        this.restartBtn?.node.on(Button.EventType.CLICK, this.onRestart, this);
        this.quitBtn?.node.on(Button.EventType.CLICK, this.onQuit, this);
        this.pauseToggleBtn?.node.on(Button.EventType.CLICK, this.toggle, this);
    }

    private toggle() {
        const gm = GameManager.instance;
        if (gm.isPaused) {
            gm.resumeGame();
            this.node.active = false;
        } else {
            gm.pauseGame();
            this.node.active = true;
        }
    }

    private onResume() {
        GameManager.instance.resumeGame();
        this.node.active = false;
    }

    private onRestart() {
        GameManager.instance.resumeGame(); // 先恢复
        const gm = GameManager.instance;
        gm.loadLevel(gm.currentLevelId);
    }

    private onQuit() {
        GameManager.instance.resumeGame();
        GameManager.instance.goToMainMenu();
    }
}
