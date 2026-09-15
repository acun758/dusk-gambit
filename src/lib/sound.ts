/**
 * 音效层：只负责播放，不参与任何对局逻辑。
 * 资源全部本地打包，断网可用；静音状态存本地，默认开启。
 */
import { useCallback, useEffect, useState } from "react";
import moveUrl from "@/assets/sfx/move.mp3";
import captureUrl from "@/assets/sfx/capture.mp3";
import checkUrl from "@/assets/sfx/check.mp3";
import endUrl from "@/assets/sfx/end.mp3";
import tickUrl from "@/assets/sfx/tick.mp3";

export type SoundKind = "move" | "capture" | "check" | "end" | "tick";

const SOURCES: Record<SoundKind, string> = {
  move: moveUrl,
  capture: captureUrl,
  check: checkUrl,
  end: endUrl,
  tick: tickUrl,
};

const VOLUME: Record<SoundKind, number> = {
  move: 0.5,
  capture: 0.62,
  check: 0.45,
  end: 0.55,
  tick: 0.28,
};

export const SOUND_STORAGE_KEY = "bs.sound";
export const SOUND_EVENT = "bs:sound";

export function soundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* 隐私模式下忽略 */
  }
  window.dispatchEvent(new Event(SOUND_EVENT));
}

type Ctx = AudioContext;
let ctx: Ctx | null = null;
const buffers = new Map<SoundKind, AudioBuffer>();
const pending = new Map<SoundKind, Promise<AudioBuffer | null>>();

function audioContext(): Ctx | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

async function load(kind: SoundKind): Promise<AudioBuffer | null> {
  const cached = buffers.get(kind);
  if (cached) return cached;
  const inflight = pending.get(kind);
  if (inflight) return inflight;
  const task = (async () => {
    const context = audioContext();
    if (!context) return null;
    try {
      const res = await fetch(SOURCES[kind]);
      const raw = await res.arrayBuffer();
      const buffer = await context.decodeAudioData(raw);
      buffers.set(kind, buffer);
      return buffer;
    } catch {
      return null;
    } finally {
      pending.delete(kind);
    }
  })();
  pending.set(kind, task);
  return task;
}

/** 播放一枚音效；静音或不支持时静默跳过。 */
export function playSound(kind: SoundKind) {
  if (typeof window === "undefined" || !soundEnabled()) return;
  void (async () => {
    const context = audioContext();
    const buffer = await load(kind);
    if (!context || !buffer) {
      // 退回到普通音频元素（极老浏览器）
      try {
        const el = new Audio(SOURCES[kind]);
        el.volume = VOLUME[kind];
        void el.play();
      } catch {
        /* 忽略 */
      }
      return;
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    const gain = context.createGain();
    gain.gain.value = VOLUME[kind];
    source.connect(gain).connect(context.destination);
    source.start();
  })();
}

/** 预热解码，避免首次落子有延迟。 */
export function primeSounds() {
  if (typeof window === "undefined" || !soundEnabled()) return;
  (Object.keys(SOURCES) as SoundKind[]).forEach((kind) => void load(kind));
}

export function useSound(): { enabled: boolean; toggle: () => void } {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    const read = () => setEnabled(soundEnabled());
    read();
    window.addEventListener(SOUND_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(SOUND_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);
  const toggle = useCallback(() => {
    const next = !soundEnabled();
    setSoundEnabled(next);
    if (next) {
      primeSounds();
      playSound("move");
    }
  }, []);
  return { enabled, toggle };
}
