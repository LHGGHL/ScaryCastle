import { _decorator, Component, Node, Prefab, instantiate, Button } from 'cc';
import { GameManager } from '../core/GameManager';
import { SaveManager, SaveData } from '../core/SaveManager';
import { ALL_LEVELS } from '../level/LevelConfig';

const { ccclass, property } = _decorator;

/**
 * 选关界面
 * 挂在 LevelSelect.scene 的 Canvas 上
 */
@ccclass('LevelSelectUI')
export class LevelSelectUI extends Component {
    @property({ type: Node, tooltip: '关卡按钮的容器' })
    public levelListContainer: Node | null = null;

    @property({ type: Prefab, tooltip: '单个关卡按钮预制体' })
    public levelBtnPrefab: Prefab | null = null;

    @property({ type: Button, tooltip: '返回主菜单' })
    public backBtn: Button | null = null;

    onLoad() {
        this.backBtn?.node.on(Button.EventType.CLICK, () => {
            GameManager.instance.goToMainMenu();
        });
        this.buildLevelList();
    }

    /** 根据关卡配置动态生成关卡按钮 */
    private buildLevelList() {
        if (!this.levelBtnPrefab || !this.levelListContainer) return;

        const save = SaveManager.load();
        const gm = GameManager.instance;

        for (const config of ALL_LEVELS) {
            const btnNode = instantiate(this.levelBtnPrefab);
            btnNode.parent = this.levelListContainer;

            // 设置关卡号文本（带星星）
            const stars = SaveManager.getLevelStar(config.levelId);
            const labels = btnNode.getComponentsInChildren('cc.Label' as any);
            // 遍历标签设置文本...
            // 这里简化，实际需要根据预制体结构调整

            const isUnlocked = config.levelId <= gm.unlockedLevelCount;
            // 锁定状态下禁用按钮
            const btn = btnNode.getComponent(Button);
            if (btn) {
                btn.interactable = isUnlocked;
                btn.node.on(Button.EventType.CLICK, () => {
                    if (isUnlocked) {
                        gm.loadLevel(config.levelId);
                    }
                });
            }
        }
    }
}
