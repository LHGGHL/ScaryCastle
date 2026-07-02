/**
 * 星级评定工具
 */
export class StarRating {
    /**
     * 根据通关用时和阈值计算星数
     * @param elapsed 实际用时（秒）
     * @param thresholds [3星阈值, 2星阈值, 1星阈值]
     * @returns 星数 1~3
     */
    static calculate(elapsed: number, thresholds: number[]): number {
        if (elapsed <= thresholds[0]) return 3;
        if (elapsed <= thresholds[1]) return 2;
        return 1;
    }

    /**
     * 根据连击数和多余能量计算额外加分
     * @param maxCombo 最高连击数
     * @param energyLeft 剩余能量
     * @returns 附加分
     */
    static calculateBonus(maxCombo: number, energyLeft: number): number {
        let bonus = 0;
        if (maxCombo >= 10) bonus += 50;
        else if (maxCombo >= 5) bonus += 20;
        if (energyLeft > 50) bonus += 30;
        else if (energyLeft > 20) bonus += 10;
        return bonus;
    }

    /** 计算金币奖励 */
    static calculateCoin(levelId: number, stars: number, bonus: number): number {
        return levelId * 10 * stars + bonus;
    }
}
