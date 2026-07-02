import { _decorator, Component } from 'cc';
import { EventManager, Events } from '../core/EventManager';

const { ccclass } = _decorator;

/**
 * 过关判定组件
 * 挂在关卡场景主控节点上，监听人类全部逃跑或超时
 */
@ccclass('WinCondition')
export class WinCondition extends Component {
    private _allFled: boolean = false;

    onLoad() {
        EventManager.on(Events.HUMAN_FLED, this.checkAllFled, this);
    }

    onDestroy() {
        EventManager.off(Events.HUMAN_FLED, this.checkAllFled, this);
    }

    private checkAllFled() {
        // 由 LevelManager 维护 fledCount，这里做兜底检查
    }
}
