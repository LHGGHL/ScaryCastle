import { sys } from 'cc';

/**
 * 存档数据结构
 */
export interface SaveData {
    totalCoin: number;            // 总金币
    unlockedLevelCount: number;   // 已解锁关卡数量
    equippedSkinId: string;       // 当前装备的皮肤 ID
    levelStars: Record<number, number>;  // 每关获得星数 { 关卡ID: 星数 }
    ownedSkins: string[];         // 已拥有的皮肤 ID 列表
}

const SAVE_KEY = 'haunted_house_save';

/**
 * 存档管理器 — 使用 localStorage 读写 JSON
 */
export class SaveManager {
    private static readonly DEFAULT: SaveData = {
        totalCoin: 0,
        unlockedLevelCount: 1,
        equippedSkinId: 'default',
        levelStars: {},
        ownedSkins: ['default'],
    };

    /** 读取存档 */
    static load(): SaveData {
        try {
            const raw = sys.localStorage.getItem(SAVE_KEY);
            if (!raw) return { ...this.DEFAULT, levelStars: {}, ownedSkins: ['default'] };
            return { ...this.DEFAULT, ...JSON.parse(raw) };
        } catch {
            return { ...this.DEFAULT, levelStars: {}, ownedSkins: ['default'] };
        }
    }

    /** 写入存档 */
    static save(data: Partial<SaveData>) {
        const current = this.load();
        const merged: SaveData = {
            ...current,
            ...data,
            levelStars: { ...current.levelStars, ...(data.levelStars ?? {}) },
            ownedSkins: data.ownedSkins ?? current.ownedSkins,
        };
        sys.localStorage.setItem(SAVE_KEY, JSON.stringify(merged));
    }

    /** 设置某关星级（只保留最高） */
    static setLevelStar(levelId: number, stars: number) {
        const data = this.load();
        const old = data.levelStars[levelId] ?? 0;
        if (stars > old) {
            data.levelStars[levelId] = stars;
        }
        this.save(data);
    }

    /** 获取某关星级 */
    static getLevelStar(levelId: number): number {
        return this.load().levelStars[levelId] ?? 0;
    }

    /** 清除所有存档 */
    static clear() {
        sys.localStorage.removeItem(SAVE_KEY);
    }
}
