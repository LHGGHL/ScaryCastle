import { _decorator, Component, Slider, Toggle, Button } from 'cc';
import { AudioManager } from '../core/AudioManager';

const { ccclass, property } = _decorator;

/**
 * 设置面板 — BGM/SFX 音量调节
 * 可挂在主菜单或游戏内暂停面板
 */
@ccclass('SettingsPanel')
export class SettingsPanel extends Component {
    @property({ type: Slider, tooltip: 'BGM 音量滑块' })
    public bgmSlider: Slider | null = null;

    @property({ type: Slider, tooltip: 'SFX 音量滑块' })
    public sfxSlider: Slider | null = null;

    @property({ type: Button, tooltip: '关闭按钮' })
    public closeBtn: Button | null = null;

    @property({ type: Button, tooltip: '清除存档按钮' })
    public clearDataBtn: Button | null = null;

    onLoad() {
        // 从 AudioManager 读取当前音量
        if (this.bgmSlider) {
            this.bgmSlider.progress = 0.6; // 默认值
            this.bgmSlider.node.on('slide', (slider: Slider) => {
                AudioManager.instance?.setBGMVolume(slider.progress);
            });
        }

        if (this.sfxSlider) {
            this.sfxSlider.progress = 0.8;
            this.sfxSlider.node.on('slide', (slider: Slider) => {
                AudioManager.instance?.setSFXVolume(slider.progress);
            });
        }

        this.closeBtn?.node.on(Button.EventType.CLICK, () => {
            this.node.active = false;
        });

        this.clearDataBtn?.node.on(Button.EventType.CLICK, () => {
            const { SaveManager } = require('../core/SaveManager');
            SaveManager.clear();
        });
    }
}
