import { _decorator, Component, director } from 'cc';
import { EventManager } from './EventManager';
import { SaveManager } from './SaveManager';

const { ccclass, property } = _decorator;

/**
 * 游戏全局管理器
 * 负责：游戏状态控制、关卡切换时的全局数据、暂停/继续
 * 挂在第一个场景的常驻节点上，通过 director.addPersistRootNode 常驻
 */
@ccclass('GameManager')
export class GameManager extends Component {
    // ========== 单例 ==========
    private static _instance: GameManager | null = null;
    public static get instance(): GameManager {
        return this._instance!;
    }

    // ========== 全局状态 ==========
    public isPaused: boolean = false;           // 是否暂停
    public currentLevelId: number = 1;          // 当前关卡
    public totalCoin: number = 0;               // 总金币
    public equippedSkinId: string = 'default';  // 当前装备的鬼魂皮肤
    public unlockedLevelCount: number = 1;       // 已解锁关卡数

    onLoad() {
        if (GameManager._instance) {
            this.node.destroy();
            return;
        }
        GameManager._instance = this;
        director.addPersistRootNode(this.node);   // 切换场景不销毁
        this.loadGameData();
    }

    /** 从存档加载数据 */
    private loadGameData() {
        const data = SaveManager.load();
        if (data) {
            this.totalCoin = data.totalCoin ?? 0;
            this.unlockedLevelCount = data.unlockedLevelCount ?? 1;
            this.equippedSkinId = data.equippedSkinId ?? 'default';
        }
    }

    /** 保存数据 */
    public saveGameData() {
        SaveManager.save({
            totalCoin: this.totalCoin,
            unlockedLevelCount: this.unlockedLevelCount,
            equippedSkinId: this.equippedSkinId,
        });
    }

    /** 增加金币 */
    public addCoin(amount: number) {
        this.totalCoin += amount;
        this.saveGameData();
        EventManager.emit('coinChanged', this.totalCoin);
    }

    /** 消耗金币（购物时调用） */
    public spendCoin(amount: number): boolean {
        if (this.totalCoin < amount) return false;
        this.totalCoin -= amount;
        this.saveGameData();
        EventManager.emit('coinChanged', this.totalCoin);
        return true;
    }

    /** 解锁新关卡 */
    public unlockLevel(levelId: number) {
        if (levelId > this.unlockedLevelCount) {
            this.unlockedLevelCount = levelId;
        }
        this.saveGameData();
    }

    /** 切换关卡 */
    public loadLevel(levelId: number) {
        this.currentLevelId = levelId;
        director.loadScene(`Level_${levelId.toString().padStart(2, '0')}`);
    }

    /** 回到主菜单 */
    public goToMainMenu() {
        director.loadScene('MainMenu');
    }

    /** 暂停游戏 */
    public pauseGame() {
        this.isPaused = true;
        director.pause();
        EventManager.emit('gamePaused');
    }

    /** 继续游戏 */
    public resumeGame() {
        this.isPaused = false;
        director.resume();
        EventManager.emit('gameResumed');
    }
}
