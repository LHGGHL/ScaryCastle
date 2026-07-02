import { _decorator, Component, Node, Camera, Vec3, PhysicsSystem2D, geometry } from 'cc';
import { HauntableItem } from './HauntableItem';
import { EnergySystem } from './EnergySystem';
import { ComboSystem } from '../combo/ComboSystem';
import { EventManager, Events } from '../core/EventManager';

const { ccclass, property } = _decorator;

/**
 * 鬼魂控制器 — 核心玩法入口
 * 处理玩家点击物品 → 触发闹鬼 → 消耗能量 → 造成惊吓
 * 挂在场景的主控节点上
 */
@ccclass('GhostController')
export class GhostController extends Component {
    @property({ type: EnergySystem, tooltip: '能量系统引用' })
    public energySystem: EnergySystem | null = null;

    @property({ type: ComboSystem, tooltip: '连击系统引用' })
    public comboSystem: ComboSystem | null = null;

    @property({ type: Node, tooltip: '鬼魂光标跟随节点' })
    public ghostCursor: Node | null = null;

    /** 当前场景所有可附身物品的映射 */
    private _items: Map<string, HauntableItem> = new Map();

    onLoad() {
        // 注册事件
        EventManager.on(Events.ITEM_HAUNTED, this.onItemHaunted, this);
    }

    onDestroy() {
        EventManager.off(Events.ITEM_HAUNTED, this.onItemHaunted, this);
    }

    /**
     * 处理玩家点击物品
     * @param item 被点击的物品组件
     */
    public onItemClicked(item: HauntableItem): boolean {
        // 1. 检查冷却
        if (item.isOnCooldown) {
            console.log(`${item.itemName} 冷却中...`);
            return false;
        }

        // 2. 检查能量
        if (this.energySystem) {
            if (!this.energySystem.hasEnough(item.energyCost)) {
                console.log('能量不足！');
                return false;
            }
        }

        // 3. 消耗能量
        if (this.energySystem) {
            this.energySystem.consume(item.energyCost);
        }

        // 4. 触发闹鬼
        const scareValue = item.haunt();

        // 5. 连击计数
        if (this.comboSystem) {
            this.comboSystem.registerHaunt(item.comboGroup, scareValue);
        }

        // 6. 鬼魂光标动画（可选）
        this.showGhostAt(item.node.worldPosition);

        return true;
    }

    /** 在指定位置短暂显示鬼魂 */
    private showGhostAt(pos: Vec3) {
        if (!this.ghostCursor) return;
        this.ghostCursor.active = true;
        this.ghostCursor.worldPosition = pos;
        // 显示 0.5 秒
        this.scheduleOnce(() => {
            if (this.ghostCursor) this.ghostCursor.active = false;
        }, 0.5);
    }

    /**
     * 注册可附身物品（由物品自己调用或场景管理器调用）
     */
    public registerItem(item: HauntableItem) {
        this._items.set(item.itemId, item);
    }

    /** 根据 ID 获取物品 */
    public getItem(id: string): HauntableItem | undefined {
        return this._items.get(id);
    }

    /** 当物品闹鬼后的回调 — 查找范围内的人类并施加恐惧 */
    private onItemHaunted(data: { itemId: string; scareValue: number; position: Vec3; radius: number }) {
        // 人类 AI 侧会监听此事件来响应
        // 这里也可以通过物理系统做范围检测
    }
}
