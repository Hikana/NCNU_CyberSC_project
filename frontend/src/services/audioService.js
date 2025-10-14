/**
 * 音頻管理服務
 * 負責管理背景音樂和音效的播放
 */

class AudioService {
  constructor() {
    this.bgmAudio = null
    this.isPlaying = false
    this.volume = 0.5 // 預設音量 50%
    this.isMuted = this.loadMuteState() // 從 localStorage 載入靜音狀態
    this.isInitialized = false
  }
  
  /**
   * 從 localStorage 載入靜音狀態
   */
  loadMuteState() {
    try {
      const saved = localStorage.getItem('audioMuted')
      return saved === 'true'
    } catch (error) {
      console.warn('無法載入靜音狀態:', error)
      return false
    }
  }
  
  /**
   * 保存靜音狀態到 localStorage
   */
  saveMuteState() {
    try {
      localStorage.setItem('audioMuted', this.isMuted.toString())
    } catch (error) {
      console.warn('無法保存靜音狀態:', error)
    }
  }

  /**
   * 初始化音頻服務
   * @param {string} bgmPath - 背景音樂文件路徑
   */
  async init(bgmPath) {
    try {
      console.log('🎵 開始初始化音頻服務，文件路徑:', bgmPath)
      
      // 創建背景音樂音頻對象
      this.bgmAudio = new Audio(bgmPath)
      this.bgmAudio.loop = true // 循環播放
      this.bgmAudio.volume = this.volume
      this.bgmAudio.preload = 'auto'
      this.bgmAudio.load() // 立即開始載入
      
      console.log('🎵 音頻對象創建完成:', this.bgmAudio)
      
      // 設置音頻事件監聽器
      this.bgmAudio.addEventListener('canplaythrough', () => {
        console.log('✅ 背景音樂載入完成')
        this.isInitialized = true
        // 自動開始播放
        this.autoPlay()
      })
      
      this.bgmAudio.addEventListener('error', (e) => {
        console.error('❌ 背景音樂載入失敗:', e)
        console.error('❌ 錯誤詳情:', {
          error: e,
          src: this.bgmAudio.src,
          readyState: this.bgmAudio.readyState,
          networkState: this.bgmAudio.networkState
        })
        this.isInitialized = false
      })
      
      this.bgmAudio.addEventListener('loadstart', () => {
        console.log('🎵 開始載入音頻文件...')
      })
      
      this.bgmAudio.addEventListener('loadeddata', () => {
        console.log('🎵 音頻數據載入完成')
      })
      
      this.bgmAudio.addEventListener('progress', () => {
        if (this.bgmAudio.buffered.length > 0) {
          const buffered = this.bgmAudio.buffered.end(0)
          const duration = this.bgmAudio.duration
          if (duration > 0) {
            const percent = Math.round((buffered / duration) * 100)
            console.log(`🎵 音頻載入進度: ${percent}%`)
          }
        }
      })
      
      // 載入音頻
      console.log('🎵 開始載入音頻...')
      await this.bgmAudio.load()
      
      console.log('✅ 音頻服務初始化完成')
    } catch (error) {
      console.error('❌ 音頻服務初始化失敗:', error)
      this.isInitialized = false
    }
  }

  /**
   * 自動播放（嘗試播放，如果失敗則等待用戶交互）
   */
  async autoPlay() {
    try {
      console.log('🎵 嘗試自動播放背景音樂...')
      await this.bgmAudio.play()
      this.isPlaying = true
      
      // 應用當前的靜音狀態
      if (this.isMuted) {
        this.bgmAudio.volume = 0
        console.log('🔇 音頻已靜音')
      } else {
        this.bgmAudio.volume = this.volume
        console.log('🔊 音頻正常播放')
      }
      
      console.log('✅ 背景音樂自動播放成功')
    } catch (error) {
      console.log('⚠️ 自動播放失敗，等待用戶交互:', error.name)
      // 即使失敗也設置為播放狀態，讓用戶知道可以播放
      this.isPlaying = true
    }
  }

  /**
   * 播放背景音樂
   */
  async playBGM() {
    if (!this.bgmAudio || !this.isInitialized) {
      console.warn('⚠️ 音頻未初始化，無法播放')
      return
    }

    try {
      console.log('🎵 嘗試播放背景音樂...')
      console.log('🎵 音頻對象:', this.bgmAudio)
      console.log('🎵 音頻狀態:', {
        readyState: this.bgmAudio.readyState,
        networkState: this.bgmAudio.networkState,
        src: this.bgmAudio.src
      })
      
      await this.bgmAudio.play()
      this.isPlaying = true
      console.log('✅ 背景音樂開始播放')
    } catch (error) {
      console.error('❌ 播放背景音樂失敗:', error)
      console.error('❌ 錯誤詳情:', {
        name: error.name,
        message: error.message,
        code: error.code
      })
      
      // 某些瀏覽器需要用戶交互後才能播放音頻
      if (error.name === 'NotAllowedError') {
        console.warn('⚠️ 需要用戶交互後才能播放音頻')
      }
    }
  }

  /**
   * 暫停背景音樂
   */
  pauseBGM() {
    if (!this.bgmAudio) return

    this.bgmAudio.pause()
    this.isPlaying = false
    console.log('⏸️ 背景音樂已暫停')
  }

  /**
   * 停止背景音樂
   */
  stopBGM() {
    if (!this.bgmAudio) return

    this.bgmAudio.pause()
    this.bgmAudio.currentTime = 0
    this.isPlaying = false
    console.log('⏹️ 背景音樂已停止')
  }

  /**
   * 切換播放/暫停狀態
   */
  async toggleBGM() {
    if (this.isPlaying) {
      this.pauseBGM()
    } else {
      await this.playBGM()
    }
  }

  /**
   * 設置音量
   * @param {number} volume - 音量 (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.volume
    }
    
    console.log(`🔊 音量設置為: ${Math.round(this.volume * 100)}%`)
  }

  /**
   * 靜音/取消靜音
   */
  toggleMute() {
    this.isMuted = !this.isMuted
    
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.volume
    }
    
    // 保存靜音狀態
    this.saveMuteState()
    
    console.log(this.isMuted ? '🔇 已靜音' : '🔊 已取消靜音')
  }

  /**
   * 獲取當前播放狀態
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      volume: this.volume,
      isMuted: this.isMuted,
      isInitialized: this.isInitialized
    }
  }

  /**
   * 銷毀音頻服務
   */
  destroy() {
    if (this.bgmAudio) {
      this.bgmAudio.pause()
      this.bgmAudio.src = ''
      this.bgmAudio = null
    }
    
    this.isPlaying = false
    this.isInitialized = false
    console.log('🎵 音頻服務已銷毀')
  }
}

// 創建單例實例
export const audioService = new AudioService()
export default audioService
