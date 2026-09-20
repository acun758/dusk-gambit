/**
 * 对局内一对一语音（仅对战双方）。
 *
 * 纪律：
 *  - 默认关闭，必须手动开启；开启后默认静音，按住「说话」才发声。
 *  - 声音走点对点直连，服务器只转交连接信息，不经过、不留存任何音频。
 *  - 与棋局逻辑完全无关：本组件不读棋盘状态，也不影响计时与结算。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Radio } from "lucide-react";
import { openVoiceLink, type VoiceLink, type VoiceSignal } from "@/data/realtime";
import { useT } from "@/lib/i18n";

type Phase = "off" | "connecting" | "connected" | "denied" | "failed";

const ICE: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
};

export function DuelVoice({
  matchId,
  selfId,
  initiator,
  opponentName,
}: {
  matchId: string;
  selfId: string;
  /** 由执白一方发起连接，避免双方同时发起撞车 */
  initiator: boolean;
  opponentName: string;
}) {
  const t = useT();
  const [phase, setPhase] = useState<Phase>("off");
  const [talking, setTalking] = useState(false);
  const [peerReady, setPeerReady] = useState(false);

  const linkRef = useRef<VoiceLink | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  const teardown = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    linkRef.current?.send({ from: selfId, kind: "bye" });
    linkRef.current?.close();
    linkRef.current = null;
    setPeerReady(false);
    setTalking(false);
    setPhase("off");
  }, [selfId]);

  useEffect(() => teardown, [teardown]);

  const start = useCallback(async () => {
    setPhase("connecting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setPhase("denied");
      return;
    }
    // 默认静音：按住说话时才打开麦克风轨
    stream.getAudioTracks().forEach((track) => (track.enabled = false));
    streamRef.current = stream;

    const pc = new RTCPeerConnection(ICE);
    pcRef.current = pc;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      const el = audioRef.current;
      if (el && event.streams[0]) {
        el.srcObject = event.streams[0];
        void el.play().catch(() => {});
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setPhase("connected");
      else if (pc.connectionState === "failed") setPhase("failed");
    };

    const link = openVoiceLink(matchId, selfId, (signal: VoiceSignal) => {
      void handleSignal(signal);
    });
    linkRef.current = link;

    pc.onicecandidate = (event) => {
      if (event.candidate) link.send({ from: selfId, kind: "ice", data: event.candidate.toJSON() });
    };

    async function handleSignal(signal: VoiceSignal) {
      const peer = pcRef.current;
      if (!peer) return;
      if (signal.kind === "hello") {
        setPeerReady(true);
        if (initiator) await makeOffer();
        return;
      }
      if (signal.kind === "offer") {
        setPeerReady(true);
        await peer.setRemoteDescription(signal.data as RTCSessionDescriptionInit);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        linkRef.current?.send({ from: selfId, kind: "answer", data: answer });
        return;
      }
      if (signal.kind === "answer") {
        if (peer.signalingState === "have-local-offer") {
          await peer.setRemoteDescription(signal.data as RTCSessionDescriptionInit);
        }
        return;
      }
      if (signal.kind === "ice") {
        try {
          await peer.addIceCandidate(signal.data as RTCIceCandidateInit);
        } catch {
          /* 候选迟到时忽略 */
        }
        return;
      }
      if (signal.kind === "bye") {
        setPeerReady(false);
        setPhase("connecting");
      }
    }

    async function makeOffer() {
      const peer = pcRef.current;
      if (!peer) return;
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      linkRef.current?.send({ from: selfId, kind: "offer", data: offer });
    }

    link.send({ from: selfId, kind: "hello" });
  }, [initiator, matchId, selfId]);

  const setMic = useCallback((on: boolean) => {
    streamRef.current?.getAudioTracks().forEach((track) => (track.enabled = on));
    setTalking(on);
  }, []);

  const statusText =
    phase === "connected" && peerReady
      ? t(`语音已接通 · ${opponentName}`, `Voice connected · ${opponentName}`)
      : phase === "connecting"
        ? peerReady
          ? t("正在接通…", "Connecting…")
          : t("等待对手开启语音…", "Waiting for opponent to join voice…")
        : phase === "denied"
          ? t("麦克风未授权，请在系统设置里允许后重试。", "Microphone blocked. Allow access and try again.")
          : phase === "failed"
            ? t("语音连接失败，可重试。", "Voice connection failed. Try again.")
            : t("对局语音默认关闭，仅你与对手两人。", "Voice is off by default, just you and your opponent.");

  return (
    <div className="home-glass-card rounded-[12px] p-4">
      <div className="flex items-center gap-2">
        <Radio className="h-4 w-4 text-primary" aria-hidden />
        <span className="cjk font-label-md text-label-md text-on-surface">{t("对局语音", "Match voice")}</span>
      </div>
      <p className="cjk mt-1 font-body-sm text-body-sm text-on-surface-variant">{statusText}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {phase === "off" || phase === "denied" || phase === "failed" ? (
          <button
            type="button"
            className="home-glass-control cjk rounded-[12px] px-4 py-2 font-label-md text-label-md text-on-surface"
            onClick={() => void start()}
          >
            {t("开启语音", "Turn on voice")}
          </button>
        ) : (
          <>
            <button
              type="button"
              className={`cjk rounded-[12px] px-4 py-2 font-label-md text-label-md ${
                talking ? "bg-primary text-on-primary" : "home-glass-control text-on-surface"
              }`}
              onPointerDown={() => setMic(true)}
              onPointerUp={() => setMic(false)}
              onPointerLeave={() => setMic(false)}
              onPointerCancel={() => setMic(false)}
            >
              {talking ? (
                <span className="inline-flex items-center gap-2">
                  <Mic className="h-4 w-4" aria-hidden />
                  {t("正在说话", "Talking")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <MicOff className="h-4 w-4" aria-hidden />
                  {t("按住说话", "Hold to talk")}
                </span>
              )}
            </button>
            <button
              type="button"
              className="home-glass-control cjk inline-flex items-center gap-2 rounded-[12px] px-4 py-2 font-label-md text-label-md text-secondary"
              onClick={teardown}
            >
              <PhoneOff className="h-4 w-4" aria-hidden />
              {t("挂断", "Hang up")}
            </button>
          </>
        )}
      </div>
      <audio ref={audioRef} autoPlay playsInline className="hidden" />
    </div>
  );
}
