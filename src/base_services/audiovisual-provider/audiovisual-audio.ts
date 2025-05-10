import EventEmitter from 'eventemitter3'
import { debounce } from 'lodash-es'

export interface AudiovisualAudioOptions {
  id?: string
}
export class AudiovisualAudio extends EventEmitter {
  wrapper: HTMLDivElement
  audio: HTMLAudioElement | null
  audioStream: MediaStream
  audioMuted = false
  emitPlayFailed = debounce(() => {
    this.emit('autoplayFailed')
  }, 600)
  eventHandler = {
    visibilitychange: () => {
      if (!document.hidden) {
        if (!this.audioMuted && this.audio?.paused) {
          this.mountPlayer(this.audio, true)
        }
      }
    },
    canPlayAudio: () => {
      this.emit('canPlayAudio')
    },
    canPlayVideo: () => {
      this.emit('canPlayVideo')
    },
  }
  constructor(options?: AudiovisualAudioOptions) {
    super()
    const { id = Date.now() } = options ?? {}
    const wrapper = document.createElement('div')
    wrapper.id = `fanbook-player_${id}`
    wrapper.setAttribute(
      'style',
      'display:flex;justify-content: center;align-items: center;width:100%;height:100%;position:relative;background-color:black;overflow:hidden;'
    )
    const audio = document.createElement('audio')
    audio.id = `fanbook-audio_${id}`
    audio.setAttribute('playsinline', '')
    audio.setAttribute('muted', '')
    audio.muted = true

    this.audioStream = new MediaStream()
    audio.srcObject = this.audioStream
    audio.addEventListener('canplay', this.eventHandler.canPlayAudio)
    //@ts-expect-error WeixinJSBridge 在微信上
    if (typeof WeixinJSBridge === 'object' && typeof WeixinJSBridge.invoke === 'function') {
      //@ts-expect-error WeixinJSBridge 在微信上
      WeixinJSBridge.invoke('getNetworkType', {}, () => {
        audio.load()
      })
    }
    this.wrapper = wrapper
    this.audio = audio
    document.addEventListener('visibilitychange', this.eventHandler.visibilitychange)
  }

  get isMounted() {
    return !!this.wrapper?.parentNode
  }

  get hasAudio() {
    const tracks = this.audioStream?.getTracks()
    return tracks.some(track => track.readyState === 'live' && !this.audioMuted)
  }

  async resume(force = false) {
    const player = this.audio
    const stream = this.audioStream
    if (this.hasAudio) {
      if (force && player) {
        player.srcObject = stream
        await new Promise(resolve => {
          const oncanplay = () => {
            player.removeEventListener('canplay', oncanplay)
            resolve(0)
          }
          player.addEventListener('canplay', oncanplay)
        })
      }
      try {
        await player?.play()
      } catch (e) {
        console.log('%c [ 🚀 ~ e ] -177-「audiovisual-view.ts」', 'font-size:14px; background:#fd6012; color:#ffa456;', e)
      }
    }
  }

  play(container: string | HTMLElement) {
    let ele = null
    if (typeof container === 'string') {
      ele = document.getElementById(container)
    } else if (container instanceof HTMLElement) {
      ele = container
    }
    if (!ele) {
      throw 'Execute `play` failed, container not exist'
    }

    if (!ele.contains(this.wrapper) && this.wrapper) {
      ele.appendChild(this.wrapper)
    }

    this.audioMuted = false
    this.audio && this.mountPlayer(this.audio, !this.audioMuted)
  }

  stop() {
    this.audio && this.mountPlayer(this.audio, false)
    const parent = this.wrapper?.parentNode
    if (parent) {
      parent.removeChild(this.wrapper)
    }
  }

  async setTracks(streams: MediaStream[], autoPlay = false) {
    const player = this.audio
    if (!player) return
    if (this.audioStream) {
      if (streams) {
        const originTracks = this.audioStream.getTracks()
        streams.forEach(stream => {
          const [audioTrack] = stream.getAudioTracks()
          if (!audioTrack || originTracks.includes(audioTrack)) {
            return
          }
          this.audioStream.addTrack(audioTrack)
        })
        this.audioStream.getTracks().forEach(track => {
          if (track.readyState === 'ended') {
            this.audioStream.removeTrack(track)
          }
        })
        player.srcObject = this.audioStream
        this.emit('_trackChange', 'audio')
        this.mountPlayer(player, !this.audioMuted)
        if (!autoPlay) return
        try {
          await this.resume(true)
        } catch (e) {
          console.log(e)
        }
      } else {
        const tracks = this.audioStream.getTracks()
        tracks.forEach(track => {
          this.audioStream.removeTrack(track)
        })
        player.srcObject = this.audioStream
        this.emit('_trackChange', 'audio')
      }
    }
  }

  setAudioMuted(muted: boolean) {
    this.audio && this.mountPlayer(this.audio, !muted)
  }

  setVolume(volume: number) {
    if (this.audio) {
      const vol = volume > 100 ? 1 : volume / 100
      this.audio.volume = vol
      if (this.audio.volume == vol) {
        return true
      }
    }
    return false
  }

  mountPlayer(player: HTMLAudioElement | HTMLVideoElement, play: boolean) {
    const stream = this.audioStream
    if (play) {
      if (stream.getTracks().some(track => track.readyState === 'live')) {
        let timeoutId: number | null = null

        const onSuccess = () => {
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          player.oncanplay = null

          player
            .play()
            .then(() => {
              player.muted = false
              console.info(`render ${player.tagName} use element success`)
            })
            .catch(err => {
              console.info(`${player.tagName} play() error: ${err.message}`)
              const mounted = this.isMounted
              const hasAudio = this.hasAudio
              const isInterrupted = (err.message || '').includes('interrupted')
              if (mounted && !isInterrupted && hasAudio) {
                this.emitPlayFailed()
              }
            })
        }
        player.muted = false
        player.play().catch(e => {
          console.log(e)
        })
        timeoutId = window.setTimeout(onSuccess, 500)
        player.oncanplay = onSuccess
      }
    } else {
      player.muted = true
      const random = 5 * Math.random() + 4
      setTimeout(() => {
        if (!player.parentNode && player.readyState > 3) {
          player.load()
        }
      }, 1000 * random)
    }

    if (!player.parentNode) {
      this.wrapper.appendChild(player)
    }
    return true
  }

  async useAudioOut(deviceId: string) {
    const setSinkId = (this.audio as HTMLMediaElement)?.setSinkId
    if (setSinkId) {
      await setSinkId.call(this.audio, deviceId)
    }
  }

  destroy() {
    this.stop()
    if (this.audio) {
      this.audio.removeEventListener('canplay', this.eventHandler.canPlayAudio)
      this.audio = null
    }
    document.removeEventListener('visibilitychange', this.eventHandler.visibilitychange)
  }
}
