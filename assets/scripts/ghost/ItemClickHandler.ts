import { _decorator, Component } from 'cc';
import { HauntableItem } from './HauntableItem';
import { GhostController } from './GhostController';

const { ccclass, property } = _decorator;

/**
 * 物品点击转发器
 * 挂在每个可闹鬼物品节点上，配合 Button 组件使用
 *
 * 使用方法：
 * 1. 给物品节点添加 Button + ItemClickHandler + HauntableItem
 * 2. Button 的 ClickEvents 设为 1，target 选本节点，component 选 ItemClickHandler，method 选 onClick
 * 3. ItemClickHandler 的 ghostController 拖入场景中的 GhostController 组件
 */
@ccclass('ItemClickHandler')
export class ItemClickHandler extends Component {
    @property({ type: GhostController, tooltip: '场景中的鬼魂控制器' })
    public ghostController: GhostController | null = null;

    /**
     * 当玩家点击此物品时调用
     * 由 Button 组件的 ClickEvents 触发
     */
    public onClick() {
        if (!this.ghostController) {
            console.warn('ItemClickHandler: ghostController 未绑定！');
            return;
        }

        const item = this.node.getComponent(HauntableItem);
        if (!item) {
            console.warn('ItemClickHandler: 此节点没有 HauntableItem 组件！');
            return;
        }

        // 检查是否已附身
        if (!item.isPossessed) {
            console.log(`👻 请先控制鬼魂靠近并按空格附身 ${item.itemName}！`);
            return;
        }

        this.ghostController.onItemClicked(item);
    }
}
