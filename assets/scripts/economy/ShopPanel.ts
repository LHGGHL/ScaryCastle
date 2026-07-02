import { _decorator, Component, Node, Prefab, instantiate, Button, Label } from 'cc';
import { GameManager } from '../core/GameManager';
import { SaveManager } from '../core/SaveManager';

const { ccclass, property } = _decorator;

/**
 * 皮肤商店数据
 */
interface SkinItem {
    id: string;
    name: string;
    price: number;          // 金币价格，0 表示默认拥有
    preview: string;        // 预览图路径
}

const SKINS: SkinItem[] = [
    { id: 'default', name: '小白鬼', price: 0, preview: '' },
    { id: 'flame_ghost', name: '火焰鬼', price: 200, preview: '' },
    { id: 'ice_ghost', name: '冰霜鬼', price: 300, preview: '' },
    { id: 'cat_ghost', name: '猫猫鬼', price: 500, preview: '' },
    { id: 'king_ghost', name: '鬼王', price: 1000, preview: '' },
];

/**
 * 商店面板 — 购买/装备鬼魂皮肤
 * 挂在 Shop.scene 的 Canvas 上
 */
@ccclass('ShopPanel')
export class ShopPanel extends Component {
    @property({ type: Node, tooltip: '皮肤列表容器' })
    public skinListContainer: Node | null = null;

    @property({ type: Prefab, tooltip: '单个皮肤条目预制体' })
    public skinItemPrefab: Prefab | null = null;

    @property({ type: Button, tooltip: '返回按钮' })
    public backBtn: Button | null = null;

    onLoad() {
        this.backBtn?.node.on(Button.EventType.CLICK, () => {
            GameManager.instance.goToMainMenu();
        });
        this.buildSkinList();
    }

    private buildSkinList() {
        if (!this.skinItemPrefab || !this.skinListContainer) return;

        const save = SaveManager.load();
        const gm = GameManager.instance;

        for (const skin of SKINS) {
            const itemNode = instantiate(this.skinItemPrefab);
            itemNode.parent = this.skinListContainer;

            const owned = save.ownedSkins.includes(skin.id);
            const equipped = gm.equippedSkinId === skin.id;

            // 根据预制体结构设置标签 (此处简化)
            const labels = itemNode.getComponentsInChildren(Label);
            // labels[0].string = skin.name;
            // labels[1].string = owned ? (equipped ? '已装备' : '装备') : `${skin.price}金币`;

            const btn = itemNode.getComponent(Button);
            if (btn) {
                btn.node.on(Button.EventType.CLICK, () => {
                    if (owned) {
                        this.equipSkin(skin.id);
                    } else {
                        this.buySkin(skin);
                    }
                });
            }
        }
    }

    private buySkin(skin: SkinItem) {
        const gm = GameManager.instance;
        if (gm.totalCoin < skin.price) {
            console.log('金币不足');
            return;
        }
        gm.spendCoin(skin.price);
        // 添加到已拥有列表
        const save = SaveManager.load();
        save.ownedSkins.push(skin.id);
        SaveManager.save({ ownedSkins: save.ownedSkins });
        this.equipSkin(skin.id);
        // 刷新列表
        this.skinListContainer?.destroyAllChildren();
        this.buildSkinList();
    }

    private equipSkin(skinId: string) {
        const gm = GameManager.instance;
        gm.equippedSkinId = skinId;
        gm.saveGameData();
        // 刷新列表
        this.skinListContainer?.destroyAllChildren();
        this.buildSkinList();
    }
}
