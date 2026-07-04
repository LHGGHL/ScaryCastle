import { _decorator, Component, AudioClip, AudioSource, resources, tween } from 'cc';
import { EventManager, Events } from './EventManager';

const { ccclass, property } = _decorator;

/**
 * 音频管理器 — 统一管理 BGM + SFX
 * 挂在常驻节点上
 */
@ccclass('AudioManager')
export class AudioManager extends Component {
    private static _instance: AudioManager | null = null;
    public static get instance(): AudioManager {
        return this._instance!;
    }

    @property(AudioSource)
    public bgmSource: AudioSource | null = null;   // BGM 播放器

    @property(AudioSource)
    public sfxSource: AudioSource | null = null;   // SFX 播放器

    private _bgmVolume: number = 0.6;
    private _sfxVolume: number = 0.8;

    // BGM 缓存
    private bgmCache: Map<string, AudioClip> = new Map();
    // SFX 缓存
    private sfxCache: Map<string, AudioClip> = new Map();

    onLoad() {
        if (AudioManager._instance) {
            this.node.destroy();
            return;
        }
        AudioManager._instance = this;

        // 监听音效播放事件（模块通过 emit('playSFX', path) 触发）
        EventManager.on('playSFX', (path: string) => {
            this.playSFX(`sounds/sfx/${path}`);
        }, this);
    }

    onDestroy() {
        EventManager.off('playSFX', undefined, this);
    }

    /** 播放背景音乐（可渐变切换） */
    public playBGM(path: string, fadeIn: boolean = true) {
        if (this.bgmCache.has(path)) {
            this._playBGMClip(this.bgmCache.get(path)!, fadeIn);
            return;
        }
        resources.load(path, AudioClip, (err, clip) => {
            if (err) { console.warn(`BGM 加载失败: ${path}`, err); return; }
            this.bgmCache.set(path, clip);
            this._playBGMClip(clip, fadeIn);
        });
    }

    private _playBGMClip(clip: AudioClip, fadeIn: boolean) {
        if (!this.bgmSource) return;
        if (this.bgmSource.clip === clip) return;
        this.bgmSource.clip = clip;
        this.bgmSource.volume = fadeIn ? 0 : this._bgmVolume;
        this.bgmSource.loop = true;
        this.bgmSource.play();
        if (fadeIn) {
            tween(this.bgmSource).to(0.8, { volume: this._bgmVolume }).start();
        }
    }

    /** 停止背景音乐 */
    public stopBGM(fadeOut: boolean = true) {
        if (!this.bgmSource) return;
        if (fadeOut) {
            tween(this.bgmSource).to(0.4, { volume: 0 }).call(() => {
                this.bgmSource!.stop();
            }).start();
        } else {
            this.bgmSource.stop();
        }
    }

    /** 播放音效 */
    public playSFX(path: string, volumeScale: number = 1.0) {
        if (this.sfxCache.has(path)) {
            this._playSFXOneShot(this.sfxCache.get(path)!, volumeScale);
            return;
        }
        resources.load(path, AudioClip, (err, clip) => {
            if (err) { console.warn(`SFX 加载失败: ${path}`, err); return; }
            this.sfxCache.set(path, clip);
            this._playSFXOneShot(clip, volumeScale);
        });
    }

    private _playSFXOneShot(clip: AudioClip, volumeScale: number) {
        if (!this.sfxSource) return;
        this.sfxSource.playOneShot(clip, this._sfxVolume * volumeScale);
    }

    /** 设置 BGM 音量 0~1 */
    public setBGMVolume(v: number) {
        this._bgmVolume = Math.max(0, Math.min(1, v));
        if (this.bgmSource) this.bgmSource.volume = this._bgmVolume;
    }

    /** 设置 SFX 音量 0~1 */
    public setSFXVolume(v: number) {
        this._sfxVolume = Math.max(0, Math.min(1, v));
    }
}
