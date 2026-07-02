import { _decorator, Component, Sprite, resources, SpriteFrame } from 'cc';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

/**
 * 皮肤管理器 — 加载并显示当前装备的鬼魂皮肤
 * 挂在鬼魂精灵节点上
 */
@ccclass('SkinManager')
export class SkinManager extends Component {
    @property({ type: Sprite, tooltip: '鬼魂的精灵组件' })
    public ghostSprite: Sprite | null = null;

    private _currentSkinId: string = '';

    onLoad() {
        this.applySkin(GameManager.instance.equippedSkinId);
    }

    /** 切换皮肤 */
    public applySkin(skinId: string) {
        if (skinId === this._currentSkinId) return;
        this._currentSkinId = skinId;

        const path = `sprites/skins/${skinId}`;
        resources.load(path, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.warn(`皮肤加载失败: ${path}`, err);
                return;
            }
            if (this.ghostSprite) {
                this.ghostSprite.spriteFrame = spriteFrame;
            }
        });
    }

    /** 获取当前皮肤 ID */
    public get currentSkinId(): string {
        return this._currentSkinId;
    }
}
