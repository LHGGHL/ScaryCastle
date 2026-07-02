import { _decorator, Component, Node, Vec3, tween } from 'cc';
import { HumanData, HumanState } from './HumanData';

const { ccclass, property } = _decorator;

/**
 * 人类移动 AI
 * 闲逛时在房间内随机走动
 * 受惊时远离闹鬼源
 * 恐惧满值时跑向出口
 * 挂在每个人类角色节点上
 */
@ccclass('HumanMovement')
export class HumanMovement extends Component {
    @property({ type: Node, tooltip: '移动到左侧的极限点' })
    public leftBound: Node | null = null;

    @property({ type: Node, tooltip: '移动到右侧的极限点' })
    public rightBound: Node | null = null;

    @property({ type: Node, tooltip: '逃跑目标点（房间出口）' })
    public exitPoint: Node | null = null;

    @property({ tooltip: '闲逛移动速度（像素/秒）' })
    public walkSpeed: number = 80;

    @property({ tooltip: '受惊移动速度' })
    public scaredSpeed: number = 120;

    @property({ tooltip: '逃跑移动速度' })
    public fleeSpeed: number = 200;

    @property({ tooltip: '闲逛时在目标点停留的最小/最大时间（秒）' })
    public idleStayMin: number = 2;
    public idleStayMax: number = 5;

    private _humanData: HumanData | null = null;
    private _isMoving: boolean = false;
    private _lastState: HumanState = HumanState.IDLE;
    private _fleeStartTime: number = 0;  // 开始逃跑的时间，用于超时强制消失

    onLoad() {
        this._humanData = this.node.getComponent(HumanData);
        if (!this._humanData) return;
        this.startIdleRoam();
    }

    update(dt: number) {
        if (!this._humanData) return;

        const state = this._humanData.state;
        if (state === this._lastState) {
            // 逃跑超时保护：如果逃跑超过 10 秒还没消失，强制处理
            if (state === HumanState.FLEEING && this._fleeStartTime > 0) {
                this._fleeStartTime += dt;
                if (this._fleeStartTime >= 10) {
                    console.warn(`[HumanMovement] ${this._humanData.humanName} 逃跑超时，强制消失`);
                    this.forceDisappear();
                }
            }
            return;
        }

        // 状态切换时停止当前的 tween
        tween(this.node).stop();
        this._lastState = state;

        console.log(`[HumanMovement] ${this._humanData.humanName} 状态切换: ${state}`);

        switch (state) {
            case HumanState.FLEEING:
                this._fleeStartTime = 0;  // 开始计时
                this.fleeToExit();
                break;
            case HumanState.SCARED:
            case HumanState.TERRIFIED:
                // 跑离闹鬼源
                if (this._humanData.lastScarePos) {
                    this.runAwayFrom(this._humanData.lastScarePos);
                }
                break;
            case HumanState.SUSPICIOUS:
                // 怀疑：停下观察，不恢复闲逛
                break;
            case HumanState.IDLE:
                // 冷静下来：恢复闲逛
                this.startIdleRoam();
                break;
            case HumanState.ESCAPED:
                // 已逃走：确保消失
                if (this.node.active) {
                    this.node.active = false;
                }
                break;
        }
    }

    /** 开始闲逛循环 */
    private startIdleRoam() {
        this.walkToRandomPoint();
    }

    /** 走到一个随机位置 */
    private walkToRandomPoint() {
        if (!this._humanData || this._humanData.isFleeingOrEscaped) return;

        const leftX = this.leftBound ? this.leftBound.worldPosition.x : this.node.worldPosition.x - 150;
        const rightX = this.rightBound ? this.rightBound.worldPosition.x : this.node.worldPosition.x + 150;
        const targetX = leftX + Math.random() * (rightX - leftX);
        const target = new Vec3(targetX, this.node.worldPosition.y, this.node.worldPosition.z);

        const duration = Vec3.distance(this.node.worldPosition, target) / this.walkSpeed;

        this._isMoving = true;
        tween(this.node)
            .to(duration, { worldPosition: target }, { easing: 'linear' })
            .call(() => {
                this._isMoving = false;
                if (!this._humanData || this._humanData.isFleeingOrEscaped) return;
                // 停留一会再走
                const stay = this.idleStayMin + Math.random() * (this.idleStayMax - this.idleStayMin);
                this.scheduleOnce(() => {
                    if (this._humanData && !this._humanData.isFleeingOrEscaped) {
                        this.walkToRandomPoint();
                    }
                }, stay);
            })
            .start();
    }

    /** 受惊时远离某个位置 */
    public runAwayFrom(sourcePos: Vec3) {
        if (!this._humanData || this._humanData.isFleeingOrEscaped) return;

        // 停止当前移动
        tween(this.node).stop();

        // 计算远离方向
        const myPos = this.node.worldPosition;
        const dirX = myPos.x - sourcePos.x;
        const sign = dirX >= 0 ? 1 : -1;  // 向左还是向右跑
        const leftX = this.leftBound ? this.leftBound.worldPosition.x : myPos.x - 200;
        const rightX = this.rightBound ? this.rightBound.worldPosition.x : myPos.x + 200;
        const targetX = Math.max(leftX, Math.min(rightX, myPos.x + sign * 120));
        const target = new Vec3(targetX, myPos.y, myPos.z);

        const speed = this._humanData.state === HumanState.SCARED ? this.scaredSpeed : this.scaredSpeed * 0.7;
        const duration = Vec3.distance(myPos, target) / speed;

        console.log(`[HumanMovement] ${this._humanData.humanName} 跑离: targetX=${targetX.toFixed(0)}`);

        tween(this.node)
            .to(duration, { worldPosition: target }, { easing: 'sineOut' })
            .start();
    }

    /** 恐惧满值 — 跑向出口 */
    public fleeToExit() {
        if (!this._humanData) return;

        tween(this.node).stop();

        console.log(`[HumanMovement] ${this._humanData.humanName} 开始逃跑!`);

        if (this.exitPoint) {
            const exitPos = this.exitPoint.worldPosition;
            const duration = Vec3.distance(this.node.position, exitPos) / this.fleeSpeed;

            console.log(`[HumanMovement] 跑向出口: (${exitPos.x.toFixed(0)}, ${exitPos.y.toFixed(0)}), 耗时 ${duration.toFixed(1)}s`);

            tween(this.node)
                .to(duration, { worldPosition: exitPos }, { easing: 'sineIn' })
                .call(() => {
                    console.log(`[HumanMovement] ${this._humanData!.humanName} 到达出口，消失`);
                    this.forceDisappear();
                })
                .start();
        } else {
            // 没有出口配置就直接消失
            this.scheduleOnce(() => {
                this.forceDisappear();
            }, 1.5);
        }
    }

    /** 强制让人物消失 */
    private forceDisappear() {
        if (!this._humanData) return;
        this._humanData.state = HumanState.ESCAPED;
        this._lastState = HumanState.ESCAPED;
        this.node.active = false;
    }
}
