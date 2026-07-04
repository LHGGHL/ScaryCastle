import { _decorator, Component, Node, Vec3, input, Input, KeyCode, EventKeyboard } from 'cc';
import { HauntableItem } from './HauntableItem';
import { EnergySystem } from './EnergySystem';
import { ComboSystem } from '../combo/ComboSystem';
import { EventManager, Events } from '../core/EventManager';

const { ccclass, property } = _decorator;

/**
 * 鬼魂控制器 — 核心玩法入口
 * 处理：WASD 移动鬼魂 → 空格附身物品 → 点击物品闹鬼
 * 挂在场景的 GameController 节点上
 */
@ccclass('GhostController')
export class GhostController extends Component {
    // ---- 编辑器属性 ----

    @property({ type: EnergySystem, tooltip: '能量系统引用' })
    public energySystem: EnergySystem | null = null;

    @property({ type: ComboSystem, tooltip: '连击系统引用' })
    public comboSystem: ComboSystem | null = null;

    @property({ type: Node, tooltip: '鬼魂可移动节点' })
    public ghostNode: Node | null = null;

    @property({ tooltip: '移动速度（像素/秒）' })
    public moveSpeed: number = 300;

    @property({ tooltip: '附身触发距离（像素）' })
    public possessRange: number = 120;

    // ---- 运行时状态 ----

    /** 当前场景所有可附身物品 */
    private _items: Map<string, HauntableItem> = new Map();

    /** 当前附身的物品（null 表示未附身） */
    private _possessedItem: HauntableItem | null = null;

    // 键盘输入状态
    private _moveLeft: boolean = false;
    private _moveRight: boolean = false;
    private _moveUp: boolean = false;
    private _moveDown: boolean = false;

    // 场景移动边界（Canvas 1280×720 本地坐标）
    private readonly MIN_X: number = -640;
    private readonly MAX_X: number = 640;
    private readonly MIN_Y: number = -360;
    private readonly MAX_Y: number = 360;

    onLoad() {
        console.log('[GhostController] onLoad, ghostNode:', this.ghostNode ? 'OK' : 'NULL');
        EventManager.on(Events.ITEM_HAUNTED, this.onItemHaunted, this);

        // 注册键盘
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    start() {
        // 自动发现场景里所有可附身物品
        const scene = this.node.scene;
        if (scene) {
            const items = scene.getComponentsInChildren(HauntableItem);
            for (const item of items) {
                this._items.set(item.itemId, item);
            }
            console.log(`[GhostController] 发现 ${this._items.size} 个可附身物品`);
        }
    }

    onDestroy() {
        EventManager.off(Events.ITEM_HAUNTED, this.onItemHaunted, this);
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    // ============================================================
    //  键盘输入
    // ============================================================

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A: case KeyCode.ARROW_LEFT:  this._moveLeft = true; break;
            case KeyCode.KEY_D: case KeyCode.ARROW_RIGHT: this._moveRight = true; break;
            case KeyCode.KEY_W: case KeyCode.ARROW_UP:    this._moveUp = true; break;
            case KeyCode.KEY_S: case KeyCode.ARROW_DOWN:  this._moveDown = true; break;
            case KeyCode.SPACE:
                this.tryPossess();
                break;
        }
    }

    private onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A: case KeyCode.ARROW_LEFT:  this._moveLeft = false; break;
            case KeyCode.KEY_D: case KeyCode.ARROW_RIGHT: this._moveRight = false; break;
            case KeyCode.KEY_W: case KeyCode.ARROW_UP:    this._moveUp = false; break;
            case KeyCode.KEY_S: case KeyCode.ARROW_DOWN:  this._moveDown = false; break;
        }
    }

    // ============================================================
    //  移动
    // ============================================================

    update(dt: number) {
        // 附身中不能移动
        if (this._possessedItem || !this.ghostNode) return;

        let dx = 0;
        let dy = 0;
        if (this._moveLeft)  dx -= 1;
        if (this._moveRight) dx += 1;
        if (this._moveDown)  dy -= 1;
        if (this._moveUp)    dy += 1;

        if (dx === 0 && dy === 0) return;

        // 斜向归一化（保持速度一致）
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;

        const pos = this.ghostNode.position;
        const newX = Math.max(this.MIN_X, Math.min(this.MAX_X, pos.x + dx * this.moveSpeed * dt));
        const newY = Math.max(this.MIN_Y, Math.min(this.MAX_Y, pos.y + dy * this.moveSpeed * dt));
        this.ghostNode.setPosition(new Vec3(newX, newY, pos.z));
    }

    // ============================================================
    //  附身 / 脱离
    // ============================================================

    /**
     * 尝试附身最近的物品
     * 如果已经附身中，则脱离
     */
    public tryPossess() {
        // 已附身 → 按空格脱离
        if (this._possessedItem) {
            this.unpossess();
            return;
        }

        if (!this.ghostNode) return;

        // 找最近的、在范围内的物品
        let nearest: HauntableItem | null = null;
        let nearestDist = Infinity;

        for (const item of this._items.values()) {
            const dist = item.getDistanceTo(this.ghostNode.position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = item;
            }
        }

        if (nearest && nearestDist <= this.possessRange) {
            this._possessedItem = nearest;
            nearest.possess();
            // 鬼魂视觉上"进入"物品
            this.ghostNode.active = false;
            console.log(`[GhostController] 👻 附身: ${nearest.itemName}`);
            EventManager.emit('playSFX', 'possess');
        }
    }

    /** 脱离当前附身的物品 */
    private unpossess() {
        if (!this._possessedItem || !this.ghostNode) return;

        const itemName = this._possessedItem.itemName;
        this._possessedItem.unpossess();
        console.log(`[GhostController] 👻 脱离: ${itemName}`);
        EventManager.emit('playSFX', 'unpossess');

        // 鬼魂出现在物品旁边
        const itemPos = this._possessedItem.node.position;
        this.ghostNode.setPosition(new Vec3(itemPos.x + 80, itemPos.y, itemPos.z));
        this.ghostNode.active = true;
        this._possessedItem = null;
    }

    // ============================================================
    //  物品点击 — 加入附身检查
    // ============================================================

    /**
     * 处理玩家点击物品
     * 只有已附身的物品才能闹鬼
     */
    public onItemClicked(item: HauntableItem): boolean {
        // 检查是否附身了此物品
        if (this._possessedItem !== item) {
            console.log(`[GhostController] ⚠ 请先附身 ${item.itemName}！`);
            return false;
        }

        // 检查冷却
        if (item.isOnCooldown) {
            console.log(`${item.itemName} 冷却中...`);
            return false;
        }

        // 检查能量
        if (this.energySystem) {
            if (!this.energySystem.hasEnough(item.energyCost)) {
                console.log('⚡ 能量不足！');
                return false;
            }
        }

        // 消耗能量
        if (this.energySystem) {
            this.energySystem.consume(item.energyCost);
        }

        // 触发闹鬼
        const scareValue = item.haunt();

        // 连击计数
        if (this.comboSystem) {
            this.comboSystem.registerHaunt(item.comboGroup, scareValue);
        }

        // 闹鬼后保持附身，玩家按空格主动脱离
        console.log(`[GhostController] 💥 ${item.itemName} 闹鬼！按空格脱离`);

        return true;
    }

    // ============================================================
    //  物品注册
    // ============================================================

    /** 注册可附身物品 */
    public registerItem(item: HauntableItem) {
        this._items.set(item.itemId, item);
    }

    /** 根据 ID 获取物品 */
    public getItem(id: string): HauntableItem | undefined {
        return this._items.get(id);
    }

    /** 当前附身的物品（null = 没有） */
    public get possessedItem(): HauntableItem | null {
        return this._possessedItem;
    }

    // ============================================================
    //  内部事件
    // ============================================================

    private onItemHaunted(_data: { itemId: string; scareValue: number; position: Vec3; radius: number }) {
        // 人类 AI（FearSystem）监听此事件来施加恐惧
    }
}
