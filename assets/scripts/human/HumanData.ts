import { _decorator, Component, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

/** 人物性格（影响恐惧反应） */
export enum Personality {
    /** 胆小鬼 — 恐惧值涨得快、阈值低 */
    COWARD = 'coward',
    /** 普通人 */
    NORMAL = 'normal',
    /** 胆大的 — 恐惧值涨得慢、阈值高 */
    BRAVE = 'brave',
    /** 怀疑论者 — 需要多次证实灵异才信 */
    SKEPTIC = 'skeptic',
}

/** 人物状态 */
export enum HumanState {
    /** 闲逛 — 正常在房间里走动 */
    IDLE = 'idle',
    /** 怀疑 — 注意到异常，停下观察 */
    SUSPICIOUS = 'suspicious',
    /** 害怕 — 明显受惊，开始远离闹鬼源 */
    SCARED = 'scared',
    /** 极度恐惧 — 尖叫乱跑 */
    TERRIFIED = 'terrified',
    /** 逃跑中 — 正在冲向出口 */
    FLEEING = 'fleeing',
    /** 已逃走 — 离开房子 */
    ESCAPED = 'escaped',
}

/**
 * 人类基础数据
 * 挂在每个人类角色节点上
 */
@ccclass('HumanData')
export class HumanData extends Component {
    @property({ tooltip: '角色唯一标识' })
    public humanId: string = '';

    @property({ tooltip: '角色名字' })
    public humanName: string = '路人';

    @property({ tooltip: '性格类型' })
    public personality: string = Personality.NORMAL;

    @property({ tooltip: '胆量值 0~100（越小越胆小）' })
    public bravery: number = 50;

    @property({ tooltip: '最大恐惧值（满值触发逃跑）' })
    public maxFear: number = 100;

    @property({ tooltip: '每秒恐惧衰减量（不吓他时冷静）' })
    public fearDecay: number = 2;

    @property({ tooltip: '受惊后怀疑持续时间（秒）' })
    public suspicionTime: number = 3;

    // ---- 运行时数据 ----
    public currentFear: number = 0;           // 当前恐惧值
    public state: HumanState = HumanState.IDLE;
    public suspicionTimer: number = 0;        // 怀疑倒计时
    public lastScarePos: Vec3 | null = null;  // 最后一次被吓的来源位置

    /** 恐惧百分比 */
    public get fearPercent(): number {
        return this.currentFear / this.maxFear;
    }

    /** 是否已处于逃跑或逃走状态 */
    public get isFleeingOrEscaped(): boolean {
        return this.state === HumanState.FLEEING || this.state === HumanState.ESCAPED;
    }

    /** 根据性格计算实际受惊倍数 */
    public get fearMultiplier(): number {
        switch (this.personality) {
            case Personality.COWARD: return 1.5;
            case Personality.BRAVE:   return 0.6;
            case Personality.SKEPTIC: return 0.5;
            default:                  return 1.0;
        }
    }
}
