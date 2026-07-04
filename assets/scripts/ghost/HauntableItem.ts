import { _decorator, Component, Node, Animation, Sprite, UITransform, Vec3 } from 'cc';
import { EventManager, Events } from '../core/EventManager';

const { ccclass, property } = _decorator;

/** 鬼魂效果类型 */
export enum HauntType {
    /** 突然抖动 */
    SHAKE = 'shake',
    /** 闪烁 */
    FLICKER = 'flicker',
    /** 位移 */
    MOVE = 'move',
    /** 发出怪声 */
    SOUND = 'sound',
    /** 鬼影浮现 */
    GHOST_IMAGE = 'ghostImage',
    /** 砸向人 */
    THROW = 'throw',
}

/**
 * 可附身物品组件
 * 挂在场景中每个可闹鬼的物品节点上
 */
@ccclass('HauntableItem')
export class HauntableItem extends Component {
    @property({ tooltip: '物品唯一标识' })
    public itemId: string = '';

    @property({ tooltip: '物品名称' })
    public itemName: string = '';

    @property({ tooltip: '鬼魂效果类型' })
    public hauntType: string = HauntType.SHAKE;

    @property({ tooltip: '基础惊吓值' })
    public baseScareValue: number = 10;

    @property({ tooltip: '冷却时间（秒）' })
    public cooldown: number = 2.0;

    @property({ tooltip: '消耗能量' })
    public energyCost: number = 15;

    @property({ tooltip: '有效惊吓半径（像素）' })
    public scareRadius: number = 200;

    @property({ tooltip: '连击分组名（同类物品连续点击有加成）' })
    public comboGroup: string = '';

    @property({ type: Node, tooltip: '闹鬼特效节点（可选）' })
    public effectNode: Node | null = null;

    // 状态
    private _isOnCooldown: boolean = false;
    private _cooldownTimer: number = 0;
    private _originalPos: Vec3 = new Vec3();
    private _isPossessed: boolean = false;

    onLoad() {
        this._originalPos.set(this.node.position);
    }

    update(dt: number) {
        if (this._isOnCooldown) {
            this._cooldownTimer -= dt;
            if (this._cooldownTimer <= 0) {
                this._isOnCooldown = false;
                // 恢复外观：如果正被附身保持绿色，否则白色
                const sprite = this.node.getComponent(Sprite);
                if (sprite) {
                    if (this._isPossessed) {
                        sprite.color.set(200, 255, 200, 255);
                    } else {
                        sprite.color.set(255, 255, 255, 255);
                    }
                }
            }
        }
    }

    /**
     * 触发闹鬼效果 — 由 GhostController 调用
     * @returns 实际造成的惊吓值（0 表示冷却中或条件不满足）
     */
    public haunt(): number {
        if (this._isOnCooldown) return 0;

        const scareValue = this.calculateScareValue();
        this._isOnCooldown = true;
        this._cooldownTimer = this.cooldown;
        this.playHauntEffect();

        // 通知全局：物品闹鬼了
        EventManager.emit(Events.ITEM_HAUNTED, {
            itemId: this.itemId,
            itemName: this.itemName,
            scareValue,
            position: this.node.worldPosition,
            radius: this.scareRadius,
        });

        return scareValue;
    }

    /** 计算实际惊吓值（可被子类重写，加入连击加成） */
    public calculateScareValue(): number {
        return this.baseScareValue;
    }

    /** 播放闹鬼动画效果 */
    private playHauntEffect() {
        switch (this.hauntType) {
            case HauntType.SHAKE:
                this.playShake();
                break;
            case HauntType.FLICKER:
                this.playFlicker();
                break;
            case HauntType.MOVE:
                this.playMove();
                break;
            case HauntType.GHOST_IMAGE:
                this.playGhostImage();
                break;
            default:
                this.playShake();
                break;
        }
        // 播放音效
        this.playSound();
    }

    /** 抖动效果 */
    private playShake() {
        const orig = this._originalPos;
        const t = 0.05; // 单次抖动时间
        const offset = 8; // 抖动幅度
        // 简单的来回抖动：右→左→右→归位
        const seq = [
            () => this.node.setPosition(orig.x + offset, orig.y, orig.z),
            () => this.node.setPosition(orig.x - offset, orig.y, orig.z),
            () => this.node.setPosition(orig.x + offset * 0.5, orig.y, orig.z),
            () => this.node.setPosition(orig.x, orig.y, orig.z),
        ];
        seq.forEach((fn, i) => {
            this.scheduleOnce(fn, t * i);
        });
        // 2 秒后确保归位
        this.scheduleOnce(() => {
            this.node.setPosition(orig);
        }, t * seq.length);
    }

    /** 闪烁效果 */
    private playFlicker() {
        const sprite = this.node.getComponent(Sprite);
        if (!sprite) return;
        // 闪烁 + 变亮 + 缩放，视觉冲击更强
        const flickerCount = 6;
        for (let i = 0; i < flickerCount; i++) {
            this.scheduleOnce(() => {
                if (i % 2 === 0) {
                    // 亮帧：放大 + 亮绿色（鬼光效果）
                    sprite.color.set(180, 255, 180, 255);
                    this.node.setScale(1.3, 1.3, 1);
                } else {
                    // 暗帧：缩小 + 半透明
                    sprite.color.set(60, 80, 60, 150);
                    this.node.setScale(0.9, 0.9, 1);
                }
            }, i * 0.12);
        }
        // 恢复
        this.scheduleOnce(() => {
            sprite.color.set(255, 255, 255, 255);
            this.node.setScale(1, 1, 1);
        }, flickerCount * 0.12);
    }

    /** 平移效果 */
    private playMove() {
        const orig = this._originalPos;
        const offset = 30;
        this.scheduleOnce(() => {
            this.node.setPosition(orig.x + offset, orig.y, orig.z);
        }, 0);
        this.scheduleOnce(() => {
            this.node.setPosition(orig.x, orig.y, orig.z);
        }, 0.4);
    }

    /** 鬼影浮现效果 */
    private playGhostImage() {
        if (!this.effectNode) return;
        this.effectNode.active = true;
        // 1.5 秒后隐藏
        this.scheduleOnce(() => {
            if (this.effectNode) this.effectNode.active = false;
        }, 1.5);
    }

    /** 播放闹鬼音效 */
    private playSound() {
        // 通过事件让 AudioManager 播放（只发名字，AudioManager 会加路径前缀）
        EventManager.emit('playSFX', this.hauntType);
    }

    /** 是否在冷却中 */
    public get isOnCooldown(): boolean {
        return this._isOnCooldown;
    }

    /** 是否已被鬼魂附身 */
    public get isPossessed(): boolean {
        return this._isPossessed;
    }

    /** 鬼魂附身此物品 */
    public possess() {
        this._isPossessed = true;
        // 视觉反馈：物品变亮（绿色高亮）
        const sprite = this.node.getComponent(Sprite);
        if (sprite) sprite.color.set(200, 255, 200, 255);
    }

    /** 鬼魂脱离此物品 */
    public unpossess() {
        this._isPossessed = false;
        // 恢复正常颜色
        const sprite = this.node.getComponent(Sprite);
        if (sprite) sprite.color.set(255, 255, 255, 255);
    }

    /** 计算物品到某坐标的距离（同一坐标系下） */
    public getDistanceTo(pos: Vec3): number {
        const myPos = this.node.position;
        const dx = myPos.x - pos.x;
        const dy = myPos.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** 判断一个世界坐标是否在惊吓范围内 */
    public isInScareRange(worldPos: Vec3): boolean {
        const myPos = this.node.worldPosition;
        const dx = myPos.x - worldPos.x;
        const dy = myPos.y - worldPos.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.scareRadius;
    }
}
