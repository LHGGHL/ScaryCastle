import { _decorator, Component, Node, Vec3 } from 'cc';
import { EventManager, Events } from '../core/EventManager';

const { ccclass, property } = _decorator;

/**
 * 惊吓范围检测器
 * 当物品闹鬼时，检测其 AOE 范围内所有人类
 * 挂在每个闹鬼物品上
 */
@ccclass('ScareArea')
export class ScareArea extends Component {
    @property({ tooltip: '惊吓半径（像素）' })
    public radius: number = 200;

    /**
     * 获取此范围内所有人类的节点列表
     * @param humanNodes 场景中所有人类节点
     * @returns 范围内的人类节点数组
     */
    public getHumansInRange(humanNodes: Node[]): Node[] {
        const myPos = this.node.worldPosition;
        const result: Node[] = [];

        for (const human of humanNodes) {
            if (!human.active) continue;
            const dist = Vec3.distance(myPos, human.worldPosition);
            if (dist <= this.radius) {
                result.push(human);
            }
        }
        return result;
    }

    /**
     * 检测指定人类是否在此范围内
     */
    public isHumanInRange(humanNode: Node): boolean {
        if (!humanNode.active) return false;
        const dist = Vec3.distance(this.node.worldPosition, humanNode.worldPosition);
        return dist <= this.radius;
    }

    /**
     * 获取距离系数：越近惊吓值越高（1.0 = 贴脸，0 = 刚好在边缘）
     */
    public getDistanceFactor(worldPos: Vec3): number {
        const dist = Vec3.distance(this.node.worldPosition, worldPos);
        return Math.max(0, 1 - dist / this.radius);
    }

    /** 在编辑器中可视化范围 */
    onDrawGizmos() {
        // Cocos Creator 3.x 中用 Gizmo 绘制圆形范围
        // 仅在编辑器模式下可见
    }
}
