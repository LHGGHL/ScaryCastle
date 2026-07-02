import { _decorator, Component, Node, Button } from 'cc';
import { GameManager } from '../core/GameManager';
import { SaveManager } from '../core/SaveManager';

const { ccclass, property } = _decorator;

/**
 * 主菜单 UI
 * 挂在 MainMenu.scene 的 Canvas 上
 */
@ccclass('MainMenuUI')
export class MainMenuUI extends Component {
    @property({ type: Button, tooltip: '开始游戏按钮' })
    public startBtn: Button | null = null;

    @property({ type: Button, tooltip: '选关按钮' })
    public levelSelectBtn: Button | null = null;

    @property({ type: Button, tooltip: '商店按钮' })
    public shopBtn: Button | null = null;

    @property({ type: Button, tooltip: '设置按钮' })
    public settingsBtn: Button | null = null;

    @property({ type: Node, tooltip: '设置面板' })
    public settingsPanel: Node | null = null;

    onLoad() {
        // TODO: 清一次脏存档，后续删掉这行
        SaveManager.clear();

        this.startBtn?.node.on(Button.EventType.CLICK, this.onStart, this);
        this.levelSelectBtn?.node.on(Button.EventType.CLICK, this.onLevelSelect, this);
        this.shopBtn?.node.on(Button.EventType.CLICK, this.onShop, this);
        this.settingsBtn?.node.on(Button.EventType.CLICK, this.onSettings, this);

        if (this.settingsPanel) this.settingsPanel.active = false;
    }

    /** 开始游戏 → 直接进最新解锁关卡 */
    private onStart() {
        const gm = GameManager.instance;
        gm.loadLevel(gm.unlockedLevelCount);
    }

    /** 选关界面 */
    private onLevelSelect() {
        // 加载选关场景
        const { director } = require('cc');
        director.loadScene('LevelSelect');
    }

    /** 商店 */
    private onShop() {
        const { director } = require('cc');
        director.loadScene('Shop');
    }

    /** 设置面板 */
    private onSettings() {
        if (this.settingsPanel) {
            this.settingsPanel.active = !this.settingsPanel.active;
        }
    }
}
