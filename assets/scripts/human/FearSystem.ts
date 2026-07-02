import { _decorator, Component, Node, Vec3 } from 'cc';
import { HumanData, HumanState } from './HumanData';
import { EventManager, Events } from '../core/EventManager';

const { ccclass, property } = _decorator;

/**
 * 恐惧值计算系统
 * 监听物品闹鬼事件 → 判断是否在范围内 → 计算恐惧值增量 → 更新人类状态
 * 挂在场景主控节点上
 */
@ccclass('FearSystem')
export class FearSystem extends Component {
    @property({ type: [Node], tooltip: '场景中所有人类节点' })
    public humans: Node[] = [];

    onLoad() {
        EventManager.on(Events.ITEM_HAUNTED, this.onItemHaunted, this);
    }

    onDestroy() {
        EventManager.off(Events.ITEM_HAUNTED, this.onItemHaunted, this);
    }

    update(dt: number) {
        // 每秒衰减每个不在追逐中的人类的恐惧值
        for (const humanNode of this.humans) {
            if (!humanNode.active) continue;
            const data = humanNode.getComponent(HumanData);
            if (!data) continue;
            if (data.isFleeingOrEscaped) continue;

            // 恐惧衰减
            if (data.currentFear > 0 && data.state !== HumanState.SUSPICIOUS) {
                data.currentFear = Math.max(0, data.currentFear - data.fearDecay * dt);
            }

            // 怀疑状态计时
            if (data.state === HumanState.SUSPICIOUS) {
                data.suspicionTimer -= dt;
                if (data.suspicionTimer <= 0) {
                    data.state = data.currentFear > 20 ? HumanState.SCARED : HumanState.IDLE;
                }
            }
        }
    }

    /**
     * 当物品闹鬼时，计算所有人类的恐惧变化
     */
    private onItemHaunted(data: { itemId: string; scareValue: number; position: Vec3; radius: number }) {
        console.log(`[FearSystem] 物品闹鬼: ${data.itemId}, 惊吓值=${data.scareValue}, 范围=${data.radius}, 位置=(${data.position.x.toFixed(0)},${data.position.y.toFixed(0)}), 人类数=${this.humans.length}`);

        for (const humanNode of this.humans) {
            if (!humanNode.active) {
                console.log(`[FearSystem]   ${humanNode.name} 未激活，跳过`);
                continue;
            }
            const humanData = humanNode.getComponent(HumanData);
            if (!humanData || humanData.isFleeingOrEscaped) {
                console.log(`[FearSystem]   ${humanNode.name} 无HumanData或已逃跑，跳过`);
                continue;
            }

            // 计算距离
            const dist = Vec3.distance(data.position, humanNode.worldPosition);
            console.log(`[FearSystem]   ${humanData.humanName}: 距离=${dist.toFixed(0)} (范围${data.radius})`);
            if (dist > data.radius) {
                console.log(`[FearSystem]   ${humanData.humanName}: 超出范围，无效果`);
                continue;
            }

            // 距离衰减：越近越吓人
            const distFactor = 1 - dist / data.radius; // 0~1
            // 性格系数
            const personalityMul = humanData.fearMultiplier;
            // 人群效应：如果附近有其他人，胆小的更易被带节奏
            const groupFactor = this.calcGroupFactor(humanNode, data.position, data.radius);

            // 最终恐惧增量
            const fearDelta = data.scareValue * distFactor * personalityMul * groupFactor;
            // 把闹鬼来源位置存到人类身上（用于逃跑方向）
            humanData.lastScarePos = data.position.clone();
            this.applyFear(humanNode, humanData, fearDelta);
        }
    }

    /**
     * 人群效应：附近有其他人时恐惧加成
     * 身边的人要是也在害怕，恐惧传播更快
     */
    private calcGroupFactor(self: Node, sourcePos: Vec3, radius: number): number {
        let nearbyCount = 0;
        for (const humanNode of this.humans) {
            if (humanNode === self || !humanNode.active) continue;
            const humanData = humanNode.getComponent(HumanData);
            if (!humanData) continue;
            const d = Vec3.distance(self.worldPosition, humanNode.worldPosition);
            if (d <= radius && humanData.currentFear > 30) {
                nearbyCount++;
            }
        }
        // 旁边每多一个害怕的人，加成 15%
        return 1 + nearbyCount * 0.15;
    }

    /** 给指定人类施加恐惧 */
    private applyFear(node: Node, data: HumanData, delta: number) {
        data.currentFear = Math.min(data.maxFear, data.currentFear + delta);

        console.log(`[FearSystem]   → ${data.humanName}: +${delta.toFixed(1)} 恐惧, 当前=${data.currentFear.toFixed(1)}/${data.maxFear}`);

        // 状态转换
        if (data.currentFear >= data.maxFear) {
            // 满恐惧 → 逃跑
            console.log(`[FearSystem]   → ${data.humanName}: 恐惧满值，开始逃跑!!!`);
            data.state = HumanState.FLEEING;
            EventManager.emit(Events.HUMAN_FLED, { humanId: data.humanId });
        } else if (data.currentFear >= data.maxFear * 0.7) {
            data.state = HumanState.TERRIFIED;
        } else if (data.currentFear >= data.maxFear * 0.3) {
            data.state = HumanState.SCARED;
        } else {
            data.state = HumanState.SUSPICIOUS;
            data.suspicionTimer = data.suspicionTime;
        }

        EventManager.emit(Events.HUMAN_SCARED, {
            humanId: data.humanId,
            fearDelta: delta,
            currentFear: data.currentFear,
            state: data.state,
        });
    }
}
