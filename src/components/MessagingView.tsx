import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Smile, ShieldCheck, MapPin, MoreVertical, AlertTriangle, ShieldAlert, ArrowLeft, Mic, Play, Pause, Trash2, Volume2, Square, Check, Filter, SlidersHorizontal, RotateCcw, Lock, Unlock, Sparkles, UserPlus, UserCheck, UserX, Clock, X, Phone, PhoneCall, PhoneOff, MicOff, VolumeX } from 'lucide-react';
import { Profile, Message, Language, FriendshipStatus } from '../types';
import { translations, ALGERIAN_WILAYAS } from '../data/translations';
import { AUTO_REPLIES } from '../data/mockProfiles';
import { OnlineStatusIndicator } from './OnlineStatusIndicator';

// Progressive feature unlock thresholds (mutual message counts required)
const VOICE_UNLOCK_COUNT = 20;
const IMAGE_UNLOCK_COUNT = 50;

/**
 * Anti-download and Screenshot Protection component for Received & Shared Media
 */
function ProtectedImage({
  src,
  alt,
  isRecipient,
  language,
  onSecurityAlert,
}: {
  src: string;
  alt: string;
  isRecipient: boolean;
  language: Language;
  onSecurityAlert?: () => void;
}) {
  const [showWarning, setShowWarning] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSecurityAlert) onSecurityAlert();
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      onDragStart={(e) => e.preventDefault()}
      className="relative overflow-hidden rounded-2xl select-none group border border-slate-700/60 bg-slate-950 max-w-full my-1"
      style={{
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      {/* Target Image with disabled pointer & selection */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="rounded-2xl max-w-full h-auto max-h-56 object-cover pointer-events-none select-none filter contrast-[0.98]"
        style={{
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
      />

      {/* Transparent Click & Drag Interceptor Overlay Layer */}
      <div
        className="absolute inset-0 z-10 cursor-not-allowed bg-transparent"
        onContextMenu={handleContextMenu}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* Security Protection Badge */}
      <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-sm border border-amber-500/40 text-[9px] font-bold text-amber-300 flex items-center gap-1 shadow-md">
        <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
        <span>
          {language === 'fr'
            ? 'Média protégé (anti-capture/téléchargement)'
            : 'صورة محمية (يمنع التحميل والتقاط الشاشة)'}
        </span>
      </div>

      {/* Subtle Anti-screen capture Watermark */}
      <div className="absolute inset-0 z-15 pointer-events-none flex items-center justify-center opacity-20">
        <span className="text-slate-100 font-black text-xs tracking-widest uppercase rotate-[-25deg] border border-slate-400 px-3 py-1 rounded-lg backdrop-blur-[1px]">
          🔒 MAWADA • يمنع التنزيل والتصوير
        </span>
      </div>

      {/* Interactive Protection Overlay Warning */}
      {showWarning && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center text-amber-400 animate-fadeIn">
          <ShieldAlert className="w-7 h-7 text-amber-400 mb-1 animate-bounce" />
          <p className="font-bold text-xs">
            {language === 'fr'
              ? "Téléchargement & capture d'écran interdits !"
              : 'التحميل والتقاط الشاشة غير مسموح به لهذا الملف !'}
          </p>
          <p className="text-[10px] text-slate-300 mt-1">
            {language === 'fr'
              ? 'Photos strictement sécurisées pour la vie privée des membres.'
              : 'لحماية خصوصية وأمان مستخدمي المنصة.'}
          </p>
        </div>
      )}
    </div>
  );
}

interface MessagingViewProps {
  allProfiles: Profile[];
  activeProfileId: string | null;
  setActiveProfileId: (id: string | null) => void;
  messages: Message[];
  friendshipStatuses: Record<string, FriendshipStatus>;
  onSendFriendRequest: (profileId: string) => void;
  onAcceptFriendRequest: (profileId: string) => void;
  onDeclineFriendRequest: (profileId: string) => void;
  onSendMessage: (
    receiverId: string,
    text: string,
    mediaUrl?: string,
    isAudio?: boolean,
    audioDuration?: number,
    audioUrl?: string
  ) => void;
  onDeleteMessage?: (messageId: string) => void;
  language: Language;
  onOpenReportModal: (profile: Profile) => void;
  onOpenDetails: (profile: Profile) => void;
}

const EMOJIS = ['😊', '🌹', '✨', '👍', '☕', '🇩🇿', '❤️', '🤝', '😄', '🌸'];

// Waveform bar height patterns for voice bubble visualization
const WAVEFORM_HEIGHTS = [45, 75, 30, 85, 100, 60, 90, 40, 70, 95, 50, 80, 35, 65];

// Audio Player Bubble Component
const AudioPlayerBubble: React.FC<{ msg: Message; isUser: boolean; language: Language }> = ({
  msg,
  isUser,
  language
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const duration = msg.audioDuration || 5;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (msg.audioUrl && audioRef.current) {
        audioRef.current.play().catch(() => {
          simulatePlayback();
        });
      } else {
        simulatePlayback();
      }
    }
  };

  const simulatePlayback = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Ignore audio context errors
    }

    const startTime = Date.now() - (progress / 100) * (duration * 1000);
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const currentProgress = (elapsed / duration) * 100;
      if (currentProgress >= 100) {
        setProgress(100);
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => setProgress(0), 300);
      } else {
        setProgress(currentProgress);
      }
    }, 100);
  };

  const currentSec = Math.floor((progress / 100) * duration);
  const formatTime = (s: number) => `0:${s < 10 ? '0' : ''}${s}`;

  return (
    <div className="space-y-2 py-1 min-w-[200px] sm:min-w-[240px]">
      {msg.audioUrl && (
        <audio
          ref={audioRef}
          src={msg.audioUrl}
          onEnded={() => {
            setIsPlaying(false);
            setProgress(0);
            if (intervalRef.current) clearInterval(intervalRef.current);
          }}
          className="hidden"
        />
      )}

      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md ${
            isUser
              ? 'bg-slate-950 text-amber-400 hover:bg-slate-900'
              : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5 rtl:mr-0.5 rtl:ml-0" />}
        </button>

        {/* Waveform Visualizer */}
        <div className="flex-1 flex items-center space-x-1 rtl:space-x-reverse h-7">
          {WAVEFORM_HEIGHTS.map((h, idx) => {
            const barProgress = (idx / WAVEFORM_HEIGHTS.length) * 100;
            const isActive = barProgress <= progress;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isActive
                    ? isUser
                      ? 'bg-slate-950 opacity-90'
                      : 'bg-amber-400'
                    : isUser
                    ? 'bg-slate-950/30'
                    : 'bg-slate-700/60'
                }`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Audio Info Footer */}
      <div className={`flex justify-between items-center text-[10px] ${isUser ? 'text-slate-950/80 font-semibold' : 'text-slate-400'}`}>
        <span className="flex items-center gap-1">
          <Mic className="w-3 h-3" />
          <span>{language === 'fr' ? 'Message vocal' : 'رسالة صوتية'}</span>
        </span>
        <span>
          {isPlaying ? formatTime(currentSec) : formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export const MessagingView: React.FC<MessagingViewProps> = ({
  allProfiles,
  activeProfileId,
  setActiveProfileId,
  messages,
  friendshipStatuses,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onSendMessage,
  onDeleteMessage,
  language,
  onOpenReportModal,
  onOpenDetails
}) => {
  const t = translations[language];
  const [inputText, setInputText] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Voice Call Live State & Logic
  const [isCallActive, setIsCallActive] = useState(false);
  const [callState, setCallState] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isCallSpeakerOn, setIsCallSpeakerOn] = useState(true);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callConnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (callConnectTimeoutRef.current) clearTimeout(callConnectTimeoutRef.current);
    };
  }, []);

  const handleStartVoiceCall = () => {
    if (!isFriendshipAccepted) {
      triggerToast(
        language === 'fr'
          ? "🔒 Vous devez d'abord envoyer/accepter la demande d'amitié !"
          : "🔒 يجب إرسال أو قبول طلب الصداقة أولاً لإجراء مكالمة صوتية !",
        'locked'
      );
      return;
    }
    if (!isVoiceUnlocked) {
      if (!isMutualConversation) {
        triggerToast(
          language === 'fr'
            ? `🔒 Appel vocal: 20 messages mutuels requis !`
            : `🔒 المكالمات الصوتية مقفلة. يلزم 20 رسالة متبادلة (يجب أن يرد الطرف الآخر أيضاً).`,
          'locked'
        );
        return;
      }
      const remaining = VOICE_UNLOCK_COUNT - totalMessagesCount;
      triggerToast(
        language === 'fr'
          ? `🔒 Appel vocal verrouillé. Échangez encore ${remaining} message(s) pour débloquer les appels !`
          : `🔒 المكالمات الصوتية مقفلة. تبادل ${remaining} رسالة إضافية لفتح المكالمات الصوتية !`,
        'locked'
      );
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(425, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      }
    } catch {
      // Ignore audio errors
    }

    setIsCallActive(true);
    setCallState('calling');
    setCallSeconds(0);
    setIsCallMuted(false);

    callConnectTimeoutRef.current = setTimeout(() => {
      setCallState('connected');
      callTimerRef.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }, 2500);
  };

  const handleEndVoiceCall = () => {
    if (callConnectTimeoutRef.current) clearTimeout(callConnectTimeoutRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);

    const minutes = Math.floor(callSeconds / 60);
    const secs = callSeconds % 60;
    const durationStr = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;

    if (activeProfileId) {
      if (callState === 'connected' && callSeconds > 0) {
        onSendMessage(
          activeProfileId,
          '📞 ' + (language === 'fr' ? `Appel vocal terminé (${durationStr})` : `مكالمة صوتية متصلة (${durationStr})`)
        );
      } else {
        onSendMessage(
          activeProfileId,
          '📞 ' + (language === 'fr' ? 'Appel vocal manqué' : 'مكالمة صوتية لم يتم الرد عليها')
        );
      }
    }

    setCallState('ended');
    setTimeout(() => {
      setIsCallActive(false);
      setCallSeconds(0);
    }, 500);
  };

  // Message Long-Press & Action Modal State (Only for user's own sent messages)
  const [actionMenuMsg, setActionMenuMsg] = useState<Message | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStartMsg = (msg: Message) => {
    // ONLY allow deletion for user's own sent messages!
    if (msg.senderId !== 'user') return;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setActionMenuMsg(msg);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(40);
      }
    }, 450);
  };

  const handleTouchEndMsg = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handleContextMenuMsg = (e: React.MouseEvent, msg: Message) => {
    // ONLY allow deletion for user's own sent messages!
    if (msg.senderId !== 'user') return;
    e.preventDefault();
    setActionMenuMsg(msg);
  };

  // Inbox Filtering State (Applied vs Pending/Temporary)
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Applied values (actually used to filter the contacts list)
  const [appliedWilayas, setAppliedWilayas] = useState<string[]>([]);
  const [appliedMinAge, setAppliedMinAge] = useState<number>(18);
  const [appliedMaxAge, setAppliedMaxAge] = useState<number>(65);
  const [appliedGender, setAppliedGender] = useState<'all' | 'female' | 'male'>('all');

  // Temporary draft values modified inside the filter panel before clicking OK
  const [tempWilayas, setTempWilayas] = useState<string[]>([]);
  const [tempMinAge, setTempMinAge] = useState<number>(18);
  const [tempMaxAge, setTempMaxAge] = useState<number>(65);
  const [tempGender, setTempGender] = useState<'all' | 'female' | 'male'>('all');

  const activeFiltersCount =
    (appliedWilayas.length > 0 ? 1 : 0) +
    (appliedMinAge > 18 || appliedMaxAge < 65 ? 1 : 0) +
    (appliedGender !== 'all' ? 1 : 0);

  // Sync temp values when panel opens
  const toggleFilterPanel = () => {
    if (!showFilterPanel) {
      setTempWilayas(appliedWilayas);
      setTempMinAge(appliedMinAge);
      setTempMaxAge(appliedMaxAge);
      setTempGender(appliedGender);
    }
    setShowFilterPanel(!showFilterPanel);
  };

  const toggleTempWilaya = (wilayaName: string) => {
    setTempWilayas((prev) =>
      prev.includes(wilayaName)
        ? prev.filter((w) => w !== wilayaName)
        : [...prev, wilayaName]
    );
  };

  const applyFilters = () => {
    setAppliedWilayas(tempWilayas);
    setAppliedMinAge(tempMinAge);
    setAppliedMaxAge(tempMaxAge);
    setAppliedGender(tempGender);
    setShowFilterPanel(false);
  };

  const resetFilters = () => {
    setTempWilayas([]);
    setTempMinAge(18);
    setTempMaxAge(65);
    setTempGender('all');
    setAppliedWilayas([]);
    setAppliedMinAge(18);
    setAppliedMaxAge(65);
    setAppliedGender('all');
  };

  // Feature Unlock Toast Notification State
  const [toastNotice, setToastNotice] = useState<{ text: string; type: 'unlock' | 'locked' } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (text: string, type: 'unlock' | 'locked' = 'unlock') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastNotice({ text, type });
    toastTimerRef.current = setTimeout(() => {
      setToastNotice(null);
    }, 4500);
  };

  const activeProfile = allProfiles.find((p) => p.id === activeProfileId);
  const currentFriendshipStatus = activeProfile ? (friendshipStatuses[activeProfile.id] || 'none') : 'none';
  const isFriendshipAccepted = currentFriendshipStatus === 'accepted';

  // Sort and filter profiles by search contact, region/wilaya, age, and gender
  const sortedProfiles = [...allProfiles].sort((a, b) => {
    const aMsgs = messages.filter(m => m.senderId === a.id || m.receiverId === a.id).length;
    const bMsgs = messages.filter(m => m.senderId === b.id || m.receiverId === b.id).length;
    return bMsgs - aMsgs;
  }).filter(p => {
    // 1. Search filter
    if (searchContact.trim()) {
      const term = searchContact.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(term);
      const matchesCity = p.city.toLowerCase().includes(term);
      if (!matchesName && !matchesCity) return false;
    }
    // 2. Region / Wilaya filter (Applied Multi-select)
    if (appliedWilayas.length > 0) {
      const profileCity = p.city.toLowerCase();
      const matchesAny = appliedWilayas.some((w) => {
        const target = w.toLowerCase();
        return profileCity.includes(target) || target.includes(profileCity);
      });
      if (!matchesAny) return false;
    }
    // 3. Age filter
    if (p.age < appliedMinAge || p.age > appliedMaxAge) {
      return false;
    }
    // 4. Gender filter
    if (appliedGender !== 'all' && p.gender !== appliedGender) {
      return false;
    }
    return true;
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, activeProfileId, isRecording]);

  const startRecording = async () => {
    if (!isFriendshipAccepted) {
      triggerToast(
        language === 'fr'
          ? "🔒 Vous devez d'abord envoyer/accepter la demande d'amitié !"
          : "🔒 يجب إرسال أو قبول طلب الصداقة أولاً !",
        'locked'
      );
      return;
    }
    setIsRecording(true);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start();
      }
    } catch {
      // Fallback seamlessly if mic denied or sandbox restricted
    }
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const stopAndSendRecording = () => {
    const finalDuration = Math.max(1, recordingSeconds);

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const realAudioUrl = URL.createObjectURL(audioBlob);
        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
        
        if (activeProfileId) {
          onSendMessage(
            activeProfileId,
            '🎤 ' + (language === 'fr' ? 'Message vocal' : 'رسالة صوتية'),
            undefined,
            true,
            finalDuration,
            realAudioUrl
          );
        }
      };
      mediaRecorderRef.current.stop();
    } else {
      if (activeProfileId) {
        onSendMessage(
          activeProfileId,
          '🎤 ' + (language === 'fr' ? 'Message vocal' : 'رسالة صوتية'),
          undefined,
          true,
          finalDuration,
          undefined
        );
      }
    }

    setIsRecording(false);
    setRecordingSeconds(0);

    // Bot auto reply after voice message
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const shouldReplyVoice = Math.random() > 0.4;
      if (shouldReplyVoice) {
        onSendMessage(
          'user',
          '🎤 ' + (language === 'fr' ? 'Message vocal' : 'رسالة صوتية'),
          undefined,
          true,
          Math.floor(Math.random() * 5) + 3,
          undefined
        );
      } else {
        const replies = AUTO_REPLIES[language] || AUTO_REPLIES.fr;
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        onSendMessage('user', randomReply, undefined);
      }
    }, 2000);
  };

  // Filter messages for active profile
  const currentConversation = messages.filter(
    (m) =>
      (m.senderId === 'user' && m.receiverId === activeProfileId) ||
      (m.senderId === activeProfileId && m.receiverId === 'user')
  );

  const userMsgsCount = currentConversation.filter((m) => m.senderId === 'user').length;
  const partnerMsgsCount = currentConversation.filter((m) => m.senderId === activeProfileId).length;
  const isMutualConversation = userMsgsCount > 0 && partnerMsgsCount > 0;

  const totalMessagesCount = currentConversation.length;
  const isVoiceUnlocked = isMutualConversation && totalMessagesCount >= VOICE_UNLOCK_COUNT;
  const isImageUnlocked = isMutualConversation && totalMessagesCount >= IMAGE_UNLOCK_COUNT;

  const prevCountRef = useRef<number>(totalMessagesCount);

  // Keyboard shortcut listener to protect screenshots and print dialogs
  useEffect(() => {
    const handleGlobalSecurityKeys = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 'p') ||
        (e.metaKey && e.shiftKey && (e.key === '4' || e.key === '3' || e.key === '5'))
      ) {
        triggerToast(
          language === 'fr'
            ? "🔒 Protection de confidentialité: Captures d'écran & enregistrements strictement désactivés !"
            : "🔒 حماية الخصوصية: التقاط الشاشة وتنزيل الصور غير مسموح به لحماية صور الأعضاء !",
          'locked'
        );
      }
    };
    window.addEventListener('keydown', handleGlobalSecurityKeys);
    return () => window.removeEventListener('keydown', handleGlobalSecurityKeys);
  }, [language]);

  // Monitor unlock thresholds to trigger automatic congratulatory toast
  useEffect(() => {
    if (!activeProfileId) return;
    const prev = prevCountRef.current;

    if (prev < VOICE_UNLOCK_COUNT && isVoiceUnlocked) {
      triggerToast(
        language === 'fr'
          ? '🎉 Félicitations! Vous avez débloqué les messages vocaux (🎙️) après 20 messages mutuels !'
          : '🎉 تهانينا! لقد تم فتح ميزة الرسائل الصوتية 🎙️ بعد تبادل 20 رسالة متبادلة!',
        'unlock'
      );
    }

    if (prev < IMAGE_UNLOCK_COUNT && isImageUnlocked) {
      triggerToast(
        language === 'fr'
          ? '🎉 Félicitations! Vous avez débloqué l\'envoi de photos (📸) après 50 messages mutuels !'
          : '🎉 تهانينا! لقد تم فتح ميزة إرسال الصور 📸 بعد تبادل 50 رسالة متبادلة!',
        'unlock'
      );
    }

    prevCountRef.current = totalMessagesCount;
  }, [totalMessagesCount, isVoiceUnlocked, isImageUnlocked, activeProfileId, language]);

  const handleMicClick = () => {
    if (!isFriendshipAccepted) {
      triggerToast(
        language === 'fr'
          ? "🔒 Vous devez d'abord envoyer/accepter la demande d'amitié !"
          : "🔒 يجب إرسال أو قبول طلب الصداقة أولاً !",
        'locked'
      );
      return;
    }
    if (!isVoiceUnlocked) {
      if (!isMutualConversation) {
        triggerToast(
          language === 'fr'
            ? `🔒 Messages vocaux: 20 messages mutuels requis (l'autre personne doit aussi répondre) !`
            : `🔒 الرسائل الصوتية: يلزم 20 رسالة متبادلة (يجب أن يرد الطرف الآخر أيضاً).`,
          'locked'
        );
        return;
      }
      const remaining = VOICE_UNLOCK_COUNT - totalMessagesCount;
      triggerToast(
        language === 'fr'
          ? `🔒 Messages vocaux verrouillés. Échangez encore ${remaining} message(s) mutuel(s) pour débloquer le vocal!`
          : `🔒 الرسائل الصوتية مقفلة. تبادل ${remaining} رسالة متبادلة إضافية لفتح الصوت!`,
        'locked'
      );
      return;
    }
    startRecording();
  };

  const handleImageClick = () => {
    if (!isFriendshipAccepted) {
      triggerToast(
        language === 'fr'
          ? "🔒 Vous devez d'abord envoyer/accepter la demande d'amitié !"
          : "🔒 يجب إرسال أو قبول طلب الصداقة أولاً !",
        'locked'
      );
      return;
    }
    if (!isImageUnlocked) {
      if (!isMutualConversation) {
        triggerToast(
          language === 'fr'
            ? `🔒 Photos: 50 messages mutuels requis (l'autre personne doit aussi répondre) !`
            : `🔒 إرسال الصور: يلزم 50 رسالة متبادلة (يجب أن يرد الطرف الآخر أيضاً).`,
          'locked'
        );
        return;
      }
      const remaining = IMAGE_UNLOCK_COUNT - totalMessagesCount;
      triggerToast(
        language === 'fr'
          ? `🔒 Envoi de photos verrouillé. Échangez encore ${remaining} message(s) mutuel(s) pour débloquer les photos!`
          : `🔒 إرسال الصور مقفل. تبادل ${remaining} رسالة متبادلة إضافية لفتح الصور!`,
        'locked'
      );
      return;
    }
    sendMockImage();
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeProfileId) return;

    if (!isFriendshipAccepted) {
      triggerToast(
        language === 'fr'
          ? "🔒 Vous devez d'abord envoyer/accepter la demande d'amitié !"
          : "🔒 يجب إرسال أو قبول طلب الصداقة أولاً !",
        'locked'
      );
      return;
    }

    const textToSend = inputText;
    setInputText('');
    setShowEmojiPicker(false);

    // Send user message
    onSendMessage(activeProfileId, textToSend);

    // Simulate typing indicator & bot auto-reply
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const replies = AUTO_REPLIES[language] || AUTO_REPLIES.fr;
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      onSendMessage('user', randomReply, undefined); // Note: sender is activeProfileId when receiver is user
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sendMockImage = () => {
    if (!activeProfileId) return;
    const mockImages = [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80'
    ];
    const img = mockImages[Math.floor(Math.random() * mockImages.length)];
    onSendMessage(activeProfileId, '📸 ' + t.photoAttachment, img);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-6 py-4 h-[calc(100vh-5rem)] flex flex-col">
      
      <div className="bg-[#0F172A] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-1 max-h-full">
        
        {/* Contact List Sidebar */}
        <div 
          className={`w-full md:w-80 lg:w-96 border-r rtl:border-r-0 rtl:border-l border-slate-800 bg-[#0F172A] flex flex-col ${
            activeProfileId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-100 font-serif">
                {t.navMessages}
              </h2>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={toggleFilterPanel}
                  className={`flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    activeFiltersCount > 0 || showFilterPanel
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={language === 'fr' ? 'Filtres de réception' : 'تصفية الوارد'}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>{language === 'fr' ? 'Filtres' : 'تصفية'}</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[10px] flex items-center justify-center font-extrabold ml-0.5 rtl:mr-0.5 rtl:ml-0">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {sortedProfiles.length}
                </span>
              </div>
            </div>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher un contact...' : 'بحث في الرسائل...'}
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />

            {/* Expandable Filter Panel */}
            {showFilterPanel && (
              <div className="p-3 bg-[#0A0F1D] rounded-2xl border border-slate-800 space-y-3 animate-fadeIn text-slate-200 shadow-xl max-h-[60vh] sm:max-h-[70vh] overflow-y-auto custom-scrollbar relative">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 sticky top-0 bg-[#0A0F1D] z-10 pt-0.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    {language === 'fr' ? 'Filtres de réception' : 'تصفية الوارد'}
                  </span>
                  {(tempWilayas.length > 0 || tempMinAge > 18 || tempMaxAge < 65 || tempGender !== 'all') && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 underline transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{language === 'fr' ? 'Réinitialiser' : 'إعادة ضبط'}</span>
                    </button>
                  )}
                </div>

                {/* Filter: Wilaya / Region (Multi-Select) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'fr' ? 'Wilayas (Choix multiple)' : 'الولايات (اختيار متعدد)'}</span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {tempWilayas.length === 0
                        ? (language === 'fr' ? 'Toutes les wilayas' : 'جميع الولايات')
                        : `${tempWilayas.length} ${language === 'fr' ? 'sélectionnée(s)' : 'محددة'}`}
                    </span>
                  </div>

                  {/* Active Wilayas Chips */}
                  {tempWilayas.length > 0 && (
                    <div className="flex flex-wrap gap-1 py-1">
                      {tempWilayas.map((w) => (
                        <span
                          key={w}
                          className="inline-flex items-center space-x-1 rtl:space-x-reverse text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-sm"
                        >
                          <span>{w.split('.')[1] || w}</span>
                          <button
                            type="button"
                            onClick={() => toggleTempWilaya(w)}
                            className="hover:text-slate-800 font-extrabold ml-0.5 rtl:mr-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => setTempWilayas([])}
                        className="text-[10px] text-slate-400 hover:text-amber-400 underline px-1"
                      >
                        {language === 'fr' ? 'Tout décocher' : 'إلغاء الكل'}
                      </button>
                    </div>
                  )}

                  {/* Wilaya Selection Grid */}
                  <div className="max-h-36 overflow-y-auto p-2 bg-[#0F172A] rounded-xl border border-slate-800 space-y-1 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => setTempWilayas([])}
                      className={`w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        tempWilayas.length === 0
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold'
                          : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span>{language === 'fr' ? 'Toutes les wilayas (Algérie entière)' : 'جميع الولايات (كل الجزائر)'}</span>
                      {tempWilayas.length === 0 && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                      {ALGERIAN_WILAYAS.map((w) => {
                        const isSelected = tempWilayas.includes(w);
                        return (
                          <button
                            key={w}
                            type="button"
                            onClick={() => toggleTempWilaya(w)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] text-left rtl:text-right flex items-center justify-between transition-colors border ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                                : 'bg-[#0A0F1D] text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span className="truncate">{w}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1 rtl:mr-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Filter: Age Range */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>{language === 'fr' ? 'Tranche d\'âge' : 'الفئة العمرية'}</span>
                    <span className="text-amber-400 font-bold">{tempMinAge} - {tempMaxAge} {language === 'fr' ? 'ans' : 'سنة'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500">{language === 'fr' ? 'Min' : 'أدنى'}</span>
                      <select
                        value={tempMinAge}
                        onChange={(e) => setTempMinAge(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded-lg bg-[#0F172A] border border-slate-700 text-xs text-slate-100 focus:outline-none"
                      >
                        {[18, 20, 25, 30, 35, 40, 45, 50].map((a) => (
                          <option key={a} value={a}>{a} {language === 'fr' ? 'ans' : 'سنة'}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">{language === 'fr' ? 'Max' : 'أقصى'}</span>
                      <select
                        value={tempMaxAge}
                        onChange={(e) => setTempMaxAge(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded-lg bg-[#0F172A] border border-slate-700 text-xs text-slate-100 focus:outline-none"
                      >
                        {[25, 30, 35, 40, 45, 50, 60, 70].map((a) => (
                          <option key={a} value={a}>{a} {language === 'fr' ? 'ans' : 'سنة'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filter: Gender */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">
                    {language === 'fr' ? 'Genre' : 'الجنس'}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTempGender('all')}
                      className={`py-1 text-xs font-semibold rounded-lg transition-colors ${
                        tempGender === 'all'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-[#0F172A] text-slate-300 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {language === 'fr' ? 'Tous' : 'الكل'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempGender('female')}
                      className={`py-1 text-xs font-semibold rounded-lg transition-colors ${
                        tempGender === 'female'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-[#0F172A] text-slate-300 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {language === 'fr' ? 'Femmes' : 'إناث'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempGender('male')}
                      className={`py-1 text-xs font-semibold rounded-lg transition-colors ${
                        tempGender === 'male'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-[#0F172A] text-slate-300 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {language === 'fr' ? 'Hommes' : 'ذكور'}
                    </button>
                  </div>
                </div>

                {/* Submit Action: OK / Appliquer Button (Sticky at bottom) */}
                <div className="pt-2 pb-1 border-t border-slate-800 flex items-center space-x-2 rtl:space-x-reverse sticky bottom-0 bg-[#0A0F1D] z-10 shadow-lg">
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-amber-900/20 transition-all active:scale-[0.98]"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{language === 'fr' ? 'OK - Appliquer' : 'موافق - تطبيق'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilterPanel(false)}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    {language === 'fr' ? 'Fermer' : 'إغلاق'}
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Contact List items */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60">
            {sortedProfiles.length > 0 ? (
              sortedProfiles.map((profile) => {
                const isSelected = profile.id === activeProfileId;
                const profileMsgs = messages.filter(
                  (m) =>
                    (m.senderId === 'user' && m.receiverId === profile.id) ||
                    (m.senderId === profile.id && m.receiverId === 'user')
                );
                const lastMsg = profileMsgs[profileMsgs.length - 1];

                return (
                  <div
                    key={profile.id}
                    onClick={() => setActiveProfileId(profile.id)}
                    className={`p-3.5 flex items-center space-x-3 rtl:space-x-reverse cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-800/80 border-l-4 rtl:border-l-0 rtl:border-r-4 border-amber-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-800">
                      <img
                        src={profile.photos[0]}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0.5 right-0.5 rtl:left-0.5 rtl:right-auto">
                        <OnlineStatusIndicator
                          isOnline={profile.isOnline}
                          lastSeen={profile.lastSeen}
                          language={language}
                          showText={false}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-slate-100 text-sm truncate">
                          {profile.name}
                        </h3>
                        {lastMsg && (
                          <span className="text-[10px] text-slate-500">
                            {lastMsg.timestamp}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-slate-400 truncate flex-1">
                          {lastMsg ? lastMsg.text : `${t.startChat} 👋`}
                        </p>
                        {(() => {
                          const status = friendshipStatuses[profile.id] || 'none';
                          if (status === 'accepted') {
                            return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shrink-0 ml-1 rtl:mr-1">{language === 'fr' ? 'Amis' : 'مقبول'}</span>;
                          }
                          if (status === 'pending_received') {
                            return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold shrink-0 ml-1 rtl:mr-1">{language === 'fr' ? 'Demande' : 'طلب'}</span>;
                          }
                          if (status === 'pending_sent') {
                            return <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-semibold border border-amber-500/20 shrink-0 ml-1 rtl:mr-1">{language === 'fr' ? 'En attente' : 'معلق'}</span>;
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-3">
                <Filter className="w-8 h-8 text-slate-600 mx-auto" />
                <p>
                  {language === 'fr'
                    ? 'Aucune conversation ne correspond à ces critères.'
                    : 'لا توجد محادثات تطابق المعايير المختارة.'}
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      resetFilters();
                      setSearchContact('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20 hover:bg-amber-500/20 transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'fr' ? 'Effacer les filtres' : 'إلغاء التصفية'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Active Conversation Main Area */}
        <div 
          className={`flex-1 flex flex-col bg-[#0A0F1D] ${
            !activeProfileId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeProfile ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-3.5 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between z-10">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setActiveProfileId(null)}
                    className="md:hidden p-1.5 text-slate-300 hover:bg-slate-800 rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                  </button>

                  <div 
                    onClick={() => onOpenDetails(activeProfile)}
                    className="relative w-10 h-10 rounded-2xl overflow-hidden cursor-pointer border border-slate-800"
                  >
                    <img
                      src={activeProfile.photos[0]}
                      alt={activeProfile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div 
                    onClick={() => onOpenDetails(activeProfile)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      <h3 className="font-bold text-slate-100 text-sm">
                        {activeProfile.name}, {activeProfile.age}
                      </h3>
                      {activeProfile.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{activeProfile.city}</span>
                      <span>•</span>
                      <OnlineStatusIndicator
                        isOnline={activeProfile.isOnline}
                        lastSeen={activeProfile.lastSeen}
                        language={language}
                        showText={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Header Options */}
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {/* Voice Call Button */}
                  <button
                    type="button"
                    onClick={handleStartVoiceCall}
                    className={`p-2 rounded-xl transition-all font-bold flex items-center space-x-1 rtl:space-x-reverse ${
                      isVoiceUnlocked && isFriendshipAccepted
                        ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 shadow-md'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/60'
                    }`}
                    title={
                      language === 'fr'
                        ? isVoiceUnlocked ? 'Lancer un appel vocal' : 'Appels vocaux verrouillés'
                        : isVoiceUnlocked ? 'إجراء مكالمة صوتية' : 'المكالمات الصوتية مقفلة'
                    }
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">
                      {language === 'fr' ? 'Appel' : 'اتصال'}
                    </span>
                  </button>

                  {currentFriendshipStatus === 'accepted' ? (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'Amis' : 'أصدقاء'}</span>
                    </span>
                  ) : currentFriendshipStatus === 'pending_sent' ? (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'En attente' : 'طلب معلق'}</span>
                    </span>
                  ) : currentFriendshipStatus === 'pending_received' ? (
                    <button
                      onClick={() => onAcceptFriendRequest(activeProfile.id)}
                      className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-all inline-flex items-center gap-1 shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'Accepter' : 'قبول الطلب'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSendFriendRequest(activeProfile.id)}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'Demander' : 'طلب صداقة'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenReportModal(activeProfile)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
                    title={t.reportProfile}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Floating Toast Notification for Feature Unlocks */}
              {toastNotice && (
                <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-30 max-w-md w-[90%] animate-bounce">
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
                      toastNotice.type === 'unlock'
                        ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-amber-500/30'
                        : 'bg-slate-900/95 text-amber-300 border-amber-500/40 backdrop-blur-md shadow-slate-950/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {toastNotice.type === 'unlock' ? (
                        <Sparkles className="w-5 h-5 shrink-0 text-slate-950 animate-spin" />
                      ) : (
                        <Lock className="w-5 h-5 shrink-0 text-amber-400" />
                      )}
                      <span className="leading-snug">{toastNotice.text}</span>
                    </div>
                    <button
                      onClick={() => setToastNotice(null)}
                      className="text-xs font-black opacity-70 hover:opacity-100 p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Messages Stream Timeline */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!isFriendshipAccepted && (
                  <div className="my-4 p-5 rounded-2xl bg-[#0F172A] border-2 border-amber-500/40 shadow-2xl text-center space-y-3 animate-fadeIn">
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">
                        {language === 'fr'
                          ? `Demande d'amitié requise`
                          : `طلب الصداقة مطلوب أولاً`}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {currentFriendshipStatus === 'pending_sent'
                          ? (language === 'fr'
                              ? `En attente de la réponse de ${activeProfile.name}... La messagerie s'ouvrira dès qu'il/elle aura accepté.`
                              : `طلب الصداقة معلق في انتظار موافقة ${activeProfile.name}... ستتمكن من التحدث فور القبول.`)
                          : currentFriendshipStatus === 'pending_received'
                          ? (language === 'fr'
                              ? `${activeProfile.name} vous a envoyé une demande d'amitié !`
                              : `${activeProfile.name} أرسل(ت) لك طلب صداقة. يمكنك القبول لبدء التحدث.`)
                          : (language === 'fr'
                              ? `Envoyez une demande d'amitié à ${activeProfile.name} pour débloquer le chat.`
                              : `قم بإرسال طلب صداقة إلى ${activeProfile.name} أولاً. بعد القبول، ستفتح المحادثة الكتابية.`)}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      {currentFriendshipStatus === 'none' || currentFriendshipStatus === 'declined' ? (
                        <button
                          onClick={() => onSendFriendRequest(activeProfile.id)}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-900/30 transition-all inline-flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>{language === 'fr' ? "Envoyer demande d'amitié" : "إرسال طلب صداقة"}</span>
                        </button>
                      ) : currentFriendshipStatus === 'pending_received' ? (
                        <>
                          <button
                            onClick={() => onAcceptFriendRequest(activeProfile.id)}
                            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all inline-flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>{language === 'fr' ? "Accepter la demande" : "قبول طلب الصداقة"}</span>
                          </button>
                          <button
                            onClick={() => onDeclineFriendRequest(activeProfile.id)}
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                          >
                            <X className="w-4 h-4" />
                            <span>{language === 'fr' ? "Décliner" : "رفض"}</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5">
                            <Clock className="w-4 h-4 animate-spin" />
                            <span>{language === 'fr' ? "Demande en attente de confirmation..." : "طلب الصداقة قيد الانتظار..."}</span>
                          </span>
                          <button
                            onClick={() => onAcceptFriendRequest(activeProfile.id)}
                            className="text-[11px] text-emerald-400 underline hover:text-emerald-300 font-semibold"
                          >
                            ⚡ {language === 'fr' ? "Simuler acceptation par le destinataire (Test)" : "محاكاة موافقة الطرف الآخر (للتجربة)"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentConversation.map((msg, index) => {
                  const isUser = msg.senderId === 'user';
                  return (
                    <React.Fragment key={msg.id}>
                      {/* Voice Unlock System Celebration Card */}
                      {index === VOICE_UNLOCK_COUNT - 1 && (
                        <div className="my-3 flex justify-center animate-fadeIn">
                          <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-500/40 rounded-2xl px-4 py-2.5 text-center max-w-sm shadow-inner">
                            <div className="flex items-center justify-center gap-1.5 text-amber-400 font-extrabold text-xs mb-0.5">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span>{language === 'fr' ? '🎉 ÉTAPE FRANCHIE !' : '🎉 تهانينا! ميزة الصوت مفتوحة'}</span>
                            </div>
                            <p className="text-[11px] text-slate-200 font-semibold">
                              {language === 'fr'
                                ? 'Félicitations! Vous avez débloqué les messages vocaux (🎙️) après 20 messages mutuels !'
                                : 'تهانينا! تم فتح ميزة الرسائل الصوتية 🎙️ بعد تبادل 20 رسالة متبادلة!'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Photo Unlock System Celebration Card */}
                      {index === IMAGE_UNLOCK_COUNT - 1 && (
                        <div className="my-3 flex justify-center animate-fadeIn">
                          <div className="bg-gradient-to-r from-emerald-500/20 via-amber-400/10 to-emerald-500/20 border border-emerald-500/40 rounded-2xl px-4 py-2.5 text-center max-w-sm shadow-inner">
                            <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-extrabold text-xs mb-0.5">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span>{language === 'fr' ? '🎉 ÉTAPE FRANCHIE !' : '🎉 تهانينا! فتح إرسال الصور'}</span>
                            </div>
                            <p className="text-[11px] text-slate-200 font-semibold">
                              {language === 'fr'
                                ? 'Félicitations! Vous avez débloqué l\'envoi de photos (📸) après 50 messages mutuels !'
                                : 'تهانينا! تم فتح ميزة إرسال الصور 📸 بعد تبادل 50 رسالة متبادلة!'}
                            </p>
                          </div>
                        </div>
                      )}

                      <div
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} relative`}
                      >
                        <div
                          onTouchStart={() => handleTouchStartMsg(msg)}
                          onTouchEnd={handleTouchEndMsg}
                          onTouchMove={handleTouchEndMsg}
                          onContextMenu={(e) => handleContextMenuMsg(e, msg)}
                          className={`relative max-w-[85%] sm:max-w-[75%] p-3.5 rounded-3xl shadow-md space-y-1.5 select-none transition-transform active:scale-[0.98] ${
                            isUser
                              ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-medium rounded-br-none rtl:rounded-br-3xl rtl:rounded-bl-none cursor-pointer'
                              : 'bg-[#0F172A] text-slate-100 border border-slate-800 rounded-bl-none rtl:rounded-bl-3xl rtl:rounded-br-none'
                          }`}
                          title={
                            isUser
                              ? (language === 'fr' ? 'Appuyez longuement pour supprimer' : 'اضغط مطولاً خيارات الحذف')
                              : undefined
                          }
                        >
                          {msg.isAudio ? (
                            <AudioPlayerBubble msg={msg} isUser={isUser} language={language} />
                          ) : (
                            <>
                              {msg.mediaUrl && (
                                <ProtectedImage
                                  src={msg.mediaUrl}
                                  alt="Media"
                                  isRecipient={!isUser}
                                  language={language}
                                  onSecurityAlert={() =>
                                    triggerToast(
                                      language === 'fr'
                                        ? "🔒 Protection médias: Téléchargement et capture d'écran désactivés !"
                                        : "🔒 حماية الوسائط: التحميل والتقاط الشاشة غير مسموح به لحماية الخصوصية !",
                                      'locked'
                                    )
                                  }
                                />
                              )}
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </>
                          )}
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <span className={`block text-[10px] ${isUser ? 'text-slate-950/70 font-semibold' : 'text-slate-400'}`}>
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-400 p-2">
                    <div className="flex space-x-1 rtl:space-x-reverse">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-200" />
                    </div>
                    <span>{activeProfile.name} {t.typing}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Emoji Quick Picker */}
              {showEmojiPicker && (
                <div className="p-2 bg-[#0F172A] border-t border-slate-800 flex items-center space-x-2 rtl:space-x-reverse overflow-x-auto">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setInputText((prev) => prev + emoji)}
                      className="text-lg p-1.5 hover:bg-slate-800 rounded-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 bg-[#0F172A] border-t border-slate-800">
                {!isFriendshipAccepted ? (
                  <div className="flex items-center justify-between gap-3 p-2 bg-[#0A0F1D] rounded-2xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 flex items-center gap-2 px-2">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        {language === 'fr'
                          ? "Messagerie verrouillée — Demande d'amitié requise"
                          : "المحادثة مغلقة — يلزم إرسال وقبول طلب الصداقة أولاً"}
                      </span>
                    </span>
                    {currentFriendshipStatus === 'none' || currentFriendshipStatus === 'declined' ? (
                      <button
                        onClick={() => onSendFriendRequest(activeProfile.id)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 inline-flex items-center gap-1.5 transition-all shadow-md"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{language === 'fr' ? "Demander" : "طلب صداقة"}</span>
                      </button>
                    ) : currentFriendshipStatus === 'pending_received' ? (
                      <button
                        onClick={() => onAcceptFriendRequest(activeProfile.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 inline-flex items-center gap-1.5 transition-all shadow-md"
                      >
                        <Check className="w-4 h-4" />
                        <span>{language === 'fr' ? "Accepter" : "قبول"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onAcceptFriendRequest(activeProfile.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold shrink-0 hover:bg-emerald-500/30"
                      >
                        ⚡ {language === 'fr' ? "Simuler موافقة" : "قبول (تجربة)"}
                      </button>
                    )}
                  </div>
                ) : isRecording ? (
                  /* Active Recording Bar */
                  <div className="flex items-center justify-between space-x-3 rtl:space-x-reverse px-3 py-1 animate-fadeIn">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <button
                        onClick={cancelRecording}
                        className="p-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-full transition-colors"
                        title={language === 'fr' ? 'Annuler' : 'إلغاء'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                        <span className="text-xs font-mono font-bold text-rose-400">
                          0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
                        </span>
                      </div>
                    </div>

                    {/* Animated Waveform Bars during recording */}
                    <div className="flex-1 max-w-[140px] hidden sm:flex items-center space-x-1 rtl:space-x-reverse h-6">
                      {[40, 70, 90, 50, 80, 100, 60, 30, 85, 45].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-amber-500 rounded-full animate-pulse"
                          style={{
                            height: `${h}%`,
                            animationDelay: `${(i % 5) * 150}ms`
                          }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={stopAndSendRecording}
                      className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-900/30 flex items-center space-x-1.5 rtl:space-x-reverse"
                    >
                      <Send className="w-4 h-4 rtl:rotate-180" />
                      <span className="text-xs font-bold hidden sm:inline">
                        {language === 'fr' ? 'Envoyer' : 'إرسال'}
                      </span>
                    </button>
                  </div>
                ) : (
                  /* Standard Input Bar */
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2.5 text-slate-400 hover:text-amber-400 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    <button
                      onClick={handleImageClick}
                      className={`p-2.5 rounded-xl transition-all relative ${
                        isImageUnlocked
                          ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                          : 'text-slate-600 hover:text-amber-400/80 hover:bg-slate-800/60'
                      }`}
                      title={
                        isImageUnlocked
                          ? (language === 'fr' ? 'Partager une photo' : 'مشاركة صورة')
                          : (language === 'fr'
                              ? `Photos verrouillées (${totalMessagesCount}/${IMAGE_UNLOCK_COUNT})`
                              : `الصور مقفلة (${totalMessagesCount}/${IMAGE_UNLOCK_COUNT})`)
                      }
                    >
                      <Image className="w-5 h-5" />
                      {!isImageUnlocked && (
                        <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 bg-slate-900 text-amber-400 p-0.5 rounded-full border border-amber-500/40">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>

                    <input
                      type="text"
                      placeholder={t.typeMessage}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-[#0A0F1D] border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />

                    {inputText.trim() ? (
                      <button
                        onClick={handleSend}
                        className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-all shadow-md shadow-amber-900/20"
                      >
                        <Send className="w-4 h-4 rtl:rotate-180" />
                      </button>
                    ) : (
                      <button
                        onClick={handleMicClick}
                        className={`p-3 rounded-2xl font-bold transition-all shadow-sm relative ${
                          isVoiceUnlocked
                            ? 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400'
                            : 'bg-slate-800/80 text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                        }`}
                        title={
                          isVoiceUnlocked
                            ? (language === 'fr' ? 'Enregistrer un message vocal' : 'تسجيل رسالة صوتية')
                            : (language === 'fr'
                                ? `Vocal verrouillé (${totalMessagesCount}/${VOICE_UNLOCK_COUNT})`
                                : `الصوت مقفل (${totalMessagesCount}/${VOICE_UNLOCK_COUNT})`)
                        }
                      >
                        <div className="relative flex items-center justify-center">
                          <Mic className="w-4 h-4" />
                          {!isVoiceUnlocked && (
                            <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1.5 -right-1.5 rtl:-right-auto rtl:-left-1.5" />
                          )}
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty state when no conversation is selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
                <Send className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-300">{t.selectConversation}</p>
            </div>
          )}
        </div>

      </div>

      {/* Long-Press Action Modal (Only for user's sent messages) */}
      {actionMenuMsg && actionMenuMsg.senderId === 'user' && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActionMenuMsg(null)}
        >
          <div
            className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4 text-center animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-slate-100 font-bold text-sm">
                {language === 'fr' ? 'Supprimer ce message ?' : 'خيارات الرسالة (حذف)'}
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                {language === 'fr'
                  ? 'Voulez-vous vraiment supprimer ce message envoyé ?'
                  : 'هل تريد حذف هذه الرسالة المرسلة من المحادثة؟'}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  if (onDeleteMessage && actionMenuMsg) {
                    onDeleteMessage(actionMenuMsg.id);
                    triggerToast(
                      language === 'fr' ? 'Message supprimé !' : 'تم حذف الرسالة بنجاح !',
                      'unlock'
                    );
                  }
                  setActionMenuMsg(null);
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'fr' ? 'Oui, supprimer' : 'حذف الرسالة'}</span>
              </button>

              <button
                onClick={() => setActionMenuMsg(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                {language === 'fr' ? 'Annuler' : 'إلغاء'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Voice Call Fullscreen Overlay Modal */}
      {isCallActive && activeProfile && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 text-slate-100 animate-fadeIn select-none">
          {/* Top Security Header */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-amber-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {language === 'fr' ? 'Appel vocal sécurisé Mawada' : 'مكالمة صوتية آمنة ومشفرة مودة'}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {language === 'fr' ? 'Qualité HD' : 'جودة عالية HD'}
            </span>
          </div>

          {/* Center Profile Avatar & Calling Status */}
          <div className="flex flex-col items-center justify-center space-y-6 my-auto text-center">
            <div className="relative">
              {/* Pulse rings */}
              <div className={`absolute -inset-4 rounded-full bg-amber-500/20 border border-amber-500/40 ${
                callState === 'connected' ? 'animate-ping opacity-75' : 'animate-pulse'
              }`} />
              <div className={`absolute -inset-8 rounded-full bg-amber-500/10 border border-amber-500/20 ${
                callState === 'connected' ? 'animate-pulse' : ''
              }`} />

              <img
                src={activeProfile.photos[0]}
                alt={activeProfile.name}
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-amber-500 shadow-2xl z-10"
              />
            </div>

            <div className="space-y-1.5 z-10">
              <h3 className="font-extrabold text-2xl text-slate-100">
                {activeProfile.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 inline" />
                <span>{activeProfile.city}</span>
              </p>

              <div className="pt-2">
                {callState === 'calling' ? (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40 animate-pulse">
                    <PhoneCall className="w-4 h-4 animate-bounce" />
                    <span>{language === 'fr' ? 'Connexion en cours...' : 'جاري الاتصال وسماع الرنين...'}</span>
                  </span>
                ) : callState === 'connected' ? (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-extrabold text-sm border border-emerald-500/40 shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>
                      0:{Math.floor(callSeconds / 60)}:{callSeconds % 60 < 10 ? '0' : ''}{callSeconds % 60}
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/40">
                    <span>{language === 'fr' ? 'Appel terminé' : 'انتهت المكالمة'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Call Controls Bar */}
          <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse max-w-sm mx-auto w-full pb-4">
            {/* Mute Mic Button */}
            <button
              onClick={() => setIsCallMuted(!isCallMuted)}
              className={`p-4 rounded-full transition-all shadow-lg flex items-center justify-center ${
                isCallMuted
                  ? 'bg-rose-500 text-white shadow-rose-900/50'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={language === 'fr' ? 'Mute' : 'كتم الصوت'}
            >
              {isCallMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndVoiceCall}
              className="p-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-2xl shadow-rose-950/90 active:scale-95 transition-all"
              title={language === 'fr' ? 'Raccrocher' : 'إنهاء المكالمة'}
            >
              <PhoneOff className="w-7 h-7" />
            </button>

            {/* Speaker Button */}
            <button
              onClick={() => setIsCallSpeakerOn(!isCallSpeakerOn)}
              className={`p-4 rounded-full transition-all shadow-lg flex items-center justify-center ${
                !isCallSpeakerOn
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={language === 'fr' ? 'Haut-parleur' : 'مكبر الصوت'}
            >
              {isCallSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
