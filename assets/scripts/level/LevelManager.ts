import { _decorator, Component } from 'cc';
import { LevelConfig, LEVEL_01 } from './LevelConfig';
import { EventManager, Events } from '../core/EventManager';
import { GameManager } from '../core/GameManager';
import { GhostController } from '../ghost/GhostController';
import { EnergySystem } from '../ghost/EnergySystem';

const { ccclass, property } = _decorator;

/**
 * 关卡管理器 — 控制单局游戏流程
 * 挂在每个关卡场景的主控节点上
 */
@ccclass('LevelManager')
export class LevelManager extends Component {
    @property({ type: GhostController, tooltip: '鬼魂控制器' })
    public ghostController: GhostController | null = null;

    @property({ type: EnergySystem, tooltip: '能量系统' })
    public energySystem: EnergySystem | null = null;

    /** 本关配置（由 GameManager 传入或自动加载） */
    private _config: LevelConfig | null = null;

    // 关卡状态
    private _elapsedTime: number = 0;        // 已用时间
    private _fledCount: number = 0;          // 已逃跑人数
    private _totalHumans: number = 0;        // 总人数
    private _isOver: boolean = false;        // 是否已结束

    onLoad() {
        EventManager.on(Events.HUMAN_FLED, this.onHumanFled, this);
    }

    start() {
        // 自动初始化：用 LEVEL_01 配置（后续从 GameManager 传入）
        if (!this._config) {
            this.init(LEVEL_01);
        }
    }

    onDestroy() {
        EventManager.off(Events.HUMAN_FLED, this.onHumanFled, this);
    }

    /**
     * 初始化关卡 — 在场景 onLoad 后调用
     */
    public init(config: LevelConfig) {
        this._config = config;
        this._elapsedTime = 0;
        this._fledCount = 0;
        this._isOver = false;

        // 设置能量
        if (this.energySystem) {
            this.energySystem.maxEnergy = config.maxEnergy;
        }

        this._totalHumans = config.humans.length;

        EventManager.emit(Events.LEVEL_STARTED, config);
    }

    update(dt: number) {
        if (this._isOver || !this._config) return;

        this._elapsedTime += dt;

        // 超时检查
        if (this._config.timeLimit > 0 && this._elapsedTime >= this._config.timeLimit) {
            this.onLevelFailed();
        }
    }

    /** 人类逃跑回调 */
    private onHumanFled(_data: { humanId: string }) {
        this._fledCount++;

        // 全部吓跑 → 胜利
        if (this._fledCount >= this._totalHumans) {
            this.onLevelComplete();
        }
    }

    /** 关卡完成 */
    private onLevelComplete() {
        if (this._isOver) return;
        this._isOver = true;

        const stars = this.calculateStars();
        const coinReward = this.calculateCoinReward(stars);

        // 更新存档
        const gm = GameManager.instance;
        gm.addCoin(coinReward);

        // TODO: 暂时不自动解锁下一关（Level_02 场景还没创建）
        // const nextLevel = this._config!.levelId + 1;
        // if (nextLevel <= gm.unlockedLevelCount + 1) {
        //     gm.unlockLevel(nextLevel);
        // }

        EventManager.emit(Events.LEVEL_COMPLETE, {
            levelId: this._config!.levelId,
            stars,
            coinReward,
            time: this._elapsedTime,
        });
    }

    /** 关卡失败（超时） */
    private onLevelFailed() {
        if (this._isOver) return;
        this._isOver = true;
        EventManager.emit(Events.LEVEL_FAILED, { levelId: this._config!.levelId });
    }

    /** 根据用时计算星级 */
    private calculateStars(): number {
        if (!this._config) return 1;
        const thresholds = this._config.starThresholds;
        if (this._elapsedTime <= thresholds[0]) return 3;
        if (this._elapsedTime <= thresholds[1]) return 2;
        return 1;
    }

    /** 计算金币奖励 */
    private calculateCoinReward(stars: number): number {
        const baseReward = 10 * this._config!.levelId;
        return baseReward * stars;
    }

    // ---- getters ----
    public get elapsedTime(): number { return this._elapsedTime; }
    public get remainingTime(): number {
        return this._config ? Math.max(0, this._config.timeLimit - this._elapsedTime) : 0;
    }
    public get fledCount(): number { return this._fledCount; }
    public get totalHumans(): number { return this._totalHumans; }
    public get isOver(): boolean { return this._isOver; }
}
