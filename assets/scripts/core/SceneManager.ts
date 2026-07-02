import { _decorator, Component, director, Node } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 场景管理器 — 负责关卡场景的初始化和房间状态管理
 * 每个关卡场景挂一个此组件
 */
@ccclass('SceneManager')
export class SceneManager extends Component {
    // 本关卡的所有可附身物品节点
    @property({ type: [Node], tooltip: '本场景中所有可闹鬼的物品' })
    public hauntableItems: Node[] = [];

    // 本关卡的所有人类节点
    @property({ type: [Node], tooltip: '本场景中所有人类角色' })
    public humans: Node[] = [];

    // 灯光节点（可选，用于氛围切换）
    @property({ type: Node, tooltip: '灯光控制节点' })
    public lightNode: Node | null = null;

    // 当前灯光状态
    private _lightOn: boolean = true;

    onLoad() {
        this.registerItems();
    }

    /** 注册场景中所有可交互物品 */
    private registerItems() {
        // 物品在各自 HauntableItem 组件的 onLoad 中自行注册
    }

    /** 切换灯光（恐怖氛围） */
    public toggleLight() {
        this._lightOn = !this._lightOn;
        if (this.lightNode) {
            this.lightNode.active = this._lightOn;
        }
    }

    /** 获取当前场景中未逃跑的人类数量 */
    public getRemainingHumans(): number {
        return this.humans.filter(n => n.active).length;
    }
}
