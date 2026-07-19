import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Instagram,
  Facebook,
  Image,
  Film,
  PlayCircle,
  Radio,
  Send,
  Key,
  Clock,
  Mail,
  UserPlus,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkles,
  Rocket,
  MessageCircle,
  Bot,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ContentItem, ContentType, CONTENT_TYPE_LABEL, MOCK_POSTS_REELS, MOCK_STORIES, MOCK_LIVES } from '@/src/lib/autodmContent';

export type SourceType = 'post_reel' | 'story' | 'live' | 'dm' | 'dm_post';

type Step = 'channel' | 'source' | 'content' | 'trigger' | 'sequence' | 'review';
const STEP_ORDER: Step[] = ['channel', 'source', 'content', 'trigger', 'sequence', 'review'];

const SOURCE_NEEDS_CONTENT: Record<SourceType, boolean> = {
  post_reel: true,
  story: true,
  live: true,
  dm: false,
  dm_post: true,
};

const SOURCE_OPTIONS: { value: SourceType; label: string; desc: string; icon: typeof Image }[] = [
  { value: 'post_reel', label: 'Posts & Reels', desc: 'When someone comments on a post or reel.', icon: Image },
  { value: 'story', label: 'Stories', desc: 'When someone replies to your story.', icon: PlayCircle },
  { value: 'live', label: 'IG Live', desc: 'When someone comments during your live.', icon: Radio },
  { value: 'dm', label: 'DMs', desc: 'When someone sends you a direct message.', icon: MessageCircle },
  { value: 'dm_post', label: 'DMs your post', desc: 'When someone DMs you about one of your posts.', icon: Send },
];

const SOURCE_CONTENT_MAP: Record<SourceType, ContentItem[]> = {
  post_reel: MOCK_POSTS_REELS,
  story: MOCK_STORIES,
  live: MOCK_LIVES,
  dm: [],
  dm_post: MOCK_POSTS_REELS,
};

function triggerCopy(sourceType: SourceType) {
  switch (sourceType) {
    case 'post_reel':
      return { question: 'What kind of comment should spark it?', autoReplyLabel: 'Auto-reply publicly on the post too' };
    case 'story':
      return { question: 'What kind of reply should spark it?', autoReplyLabel: 'Auto-reply publicly to the story too' };
    case 'live':
      return { question: 'What kind of comment should spark it?', autoReplyLabel: 'Auto-reply publicly on the live too' };
    case 'dm':
      return { question: 'What kind of message should spark it?', autoReplyLabel: '' };
    case 'dm_post':
      return { question: 'What kind of message should spark it?', autoReplyLabel: '' };
  }
}

function contentTypeIcon(type: ContentType) {
  if (type === 'reel') return Film;
  if (type === 'story') return PlayCircle;
  if (type === 'live') return Radio;
  return Image;
}

export interface AutoDmDraft {
  channel: 'instagram' | 'messenger';
  sourceType: SourceType;
  content: ContentItem | null;
  triggerMode: 'keyword' | 'any';
  keywords: string[];
  excludedKeywords: string[];
  autoReplyEnabled: boolean;
  autoReplyText: string;
  delayValue: number;
  delayUnit: 'Minute' | 'Hour';
  askFollow: boolean;
  askFollowOpeningMessage: string;
  askFollowCheckMessage: string;
  askFollowRetryCount: number;
  askFollowFallback: 'send' | 'dont_send';
  askEmail: boolean;
  askEmailMessage: string;
  dmType: 'text' | 'text_button';
  messageText: string;
  buttonText: string;
  buttonUrl: string;
  followUpMessages: string[];
}

const OPENING_MESSAGE_MAX = 1000;
const PRIMARY_MESSAGE_MAX = 900;
const VARIABLE_TOKEN = '{{first_name}}';

function defaultDraft(sourceType: SourceType, content: ContentItem | null): AutoDmDraft {
  return {
    channel: 'instagram',
    sourceType,
    content,
    triggerMode: 'keyword',
    keywords: [],
    excludedKeywords: [],
    autoReplyEnabled: false,
    autoReplyText: '',
    delayValue: 1,
    delayUnit: 'Minute',
    askFollow: false,
    askFollowOpeningMessage: '',
    askFollowCheckMessage: '',
    askFollowRetryCount: 3,
    askFollowFallback: 'send',
    askEmail: false,
    askEmailMessage: '',
    dmType: 'text_button',
    messageText: '',
    buttonText: '',
    buttonUrl: '',
    followUpMessages: [],
  };
}

interface AutoDmWizardProps {
  isOpen: boolean;
  onClose: () => void;
  accountHandle: string;
  accountAvatar: string;
  initialSourceType?: SourceType | null;
  initialContent?: ContentItem | null;
  onLaunched: () => void;
}

export function AutoDmWizard({
  isOpen,
  onClose,
  accountHandle,
  accountAvatar,
  initialSourceType = null,
  initialContent = null,
  onLaunched,
}: AutoDmWizardProps) {
  const startStep = (): Step => (initialSourceType ? 'trigger' : 'channel');
  const [step, setStep] = useState<Step>(startStep());
  const [draft, setDraft] = useState<AutoDmDraft>(
    defaultDraft(initialSourceType || 'post_reel', initialContent)
  );
  const [keywordInput, setKeywordInput] = useState('');
  const [excludedInput, setExcludedInput] = useState('');
  const [showExcluded, setShowExcluded] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // The widget stays mounted and only toggles visibility, so re-sync
  // step/draft from the latest initialSourceType/initialContent each
  // time it opens (a useState initializer only runs on first mount).
  useEffect(() => {
    if (!isOpen) return;
    setStep(startStep());
    setDraft(defaultDraft(initialSourceType || 'post_reel', initialContent));
    setKeywordInput('');
    setExcludedInput('');
    setShowExcluded(false);
    setLaunched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 420);
    return () => clearTimeout(t);
  }, [step, isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [step, isTyping, draft.followUpMessages.length]);

  const reset = (nextSourceType: SourceType, nextContent: ContentItem | null) => {
    setDraft(defaultDraft(nextSourceType, nextContent));
    setKeywordInput('');
    setExcludedInput('');
    setShowExcluded(false);
    setLaunched(false);
  };

  const handleClose = () => {
    setStep(startStep());
    reset(initialSourceType || 'post_reel', initialContent);
    onClose();
  };

  const goSource = () => setStep('source');
  const selectSource = (sourceType: SourceType) => {
    reset(sourceType, null);
    setStep(SOURCE_NEEDS_CONTENT[sourceType] ? 'content' : 'trigger');
  };

  const selectContent = (item: ContentItem) => {
    setDraft(d => ({ ...d, content: item }));
    setStep('trigger');
  };

  const addKeyword = () => {
    const val = keywordInput.trim();
    if (!val) return;
    if (draft.keywords.some(k => k.toLowerCase() === val.toLowerCase())) {
      setKeywordInput('');
      return;
    }
    setDraft(d => ({ ...d, keywords: [...d.keywords, val] }));
    setKeywordInput('');
  };

  const removeKeyword = (kw: string) => {
    setDraft(d => ({ ...d, keywords: d.keywords.filter(k => k !== kw) }));
  };

  const addExcluded = () => {
    const val = excludedInput.trim();
    if (!val) return;
    if (draft.excludedKeywords.some(k => k.toLowerCase() === val.toLowerCase())) {
      setExcludedInput('');
      return;
    }
    setDraft(d => ({ ...d, excludedKeywords: [...d.excludedKeywords, val] }));
    setExcludedInput('');
  };

  const removeExcluded = (kw: string) => {
    setDraft(d => ({ ...d, excludedKeywords: d.excludedKeywords.filter(k => k !== kw) }));
  };

  const canProceedTrigger = draft.triggerMode === 'any' || draft.keywords.length > 0;
  const canProceedSequence =
    draft.messageText.trim().length > 0 &&
    (!draft.askFollow || draft.askFollowOpeningMessage.trim().length > 0) &&
    (draft.dmType !== 'text_button' || (draft.buttonText.trim().length > 0 && draft.buttonUrl.trim().length > 0));

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      const label = SOURCE_OPTIONS.find(o => o.value === draft.sourceType)?.label || draft.sourceType;
      const name = draft.content
        ? `${label} — ${draft.content.caption.slice(0, 40)}`
        : label;

      const res = await fetch('/api/autodm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          channel: draft.channel,
          sourceType: draft.sourceType,
          content: draft.content,
          triggerMode: draft.triggerMode,
          keywords: draft.keywords,
          excludedKeywords: draft.excludedKeywords,
          autoReplyEnabled: draft.autoReplyEnabled,
          autoReplyText: draft.autoReplyText,
          delayValue: draft.delayValue,
          delayUnit: draft.delayUnit,
          askFollow: draft.askFollow,
          askFollowOpeningMessage: draft.askFollowOpeningMessage,
          askFollowCheckMessage: draft.askFollowCheckMessage,
          askFollowRetryCount: draft.askFollowRetryCount,
          askFollowFallback: draft.askFollowFallback,
          askEmail: draft.askEmail,
          askEmailMessage: draft.askEmailMessage,
          dmType: draft.dmType,
          messageText: draft.messageText,
          buttonText: draft.dmType === 'text_button' ? draft.buttonText : '',
          buttonUrl: draft.dmType === 'text_button' ? draft.buttonUrl : '',
          followUpMessages: draft.followUpMessages,
          status: 'active',
        }),
      });
      if (!res.ok) throw new Error('Failed to launch automation');
      onLaunched();
      setLaunched(true);
    } catch (error) {
      console.error('Error launching automation:', error);
      toast.error('Failed to launch automation');
    } finally {
      setIsLaunching(false);
    }
  };

  const copy = triggerCopy(draft.sourceType);
  const stepIndex = STEP_ORDER.indexOf(step);
  const showChannelSummary = !initialSourceType && stepIndex > STEP_ORDER.indexOf('channel');
  const showSourceSummary = !initialSourceType && stepIndex > STEP_ORDER.indexOf('source');
  const showContentSummary = !initialSourceType && draft.content && stepIndex > STEP_ORDER.indexOf('content');
  const showTriggerSummary = stepIndex > STEP_ORDER.indexOf('trigger');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="chat-widget"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[110] w-[calc(100vw-2rem)] sm:w-[400px] h-[min(680px,calc(100vh-3rem))] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/10"
        >
          {launched ? (
            <LaunchCelebration draft={draft} onDone={handleClose} />
          ) : (
            <>
              {/* Chat header */}
              <div className="relative flex items-center gap-3 p-4 bg-gradient-to-r from-primary to-purple-600 text-white flex-shrink-0 overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <div className="relative w-9 h-9 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-md flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="relative flex-1 min-w-0">
                  <p className="text-sm font-bold leading-tight">AutoDM Assistant</p>
                  <p className="text-[10px] text-white/75 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Online
                  </p>
                </div>
                <button onClick={handleClose} className="relative p-1.5 hover:bg-white/15 rounded-full transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Transcript */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-container-lowest">
                <BotBubble>
                  <p className="text-sm text-on-surface">Hey! Let's get your AutoDM set up 👋</p>
                </BotBubble>

                {showChannelSummary && (
                  <>
                    <BotBubble compact question="Where should this live?" onEdit={() => setStep('channel')} />
                    <UserBubble onClick={() => setStep('channel')}>Instagram</UserBubble>
                  </>
                )}

                {showSourceSummary && (
                  <>
                    <BotBubble compact question="What should spark it?" onEdit={goSource} />
                    <UserBubble onClick={goSource}>{SOURCE_OPTIONS.find(o => o.value === draft.sourceType)?.label}</UserBubble>
                  </>
                )}

                {showContentSummary && draft.content && (
                  <>
                    <BotBubble compact question="Which one should I watch?" onEdit={() => setStep('content')} />
                    <div className="flex justify-end">
                      <button onClick={() => setStep('content')} className="flex items-center gap-2 max-w-[86%] bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl rounded-tr-sm px-2.5 py-2 hover:opacity-90 transition-opacity">
                        <img src={draft.content.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        <span className="text-xs font-semibold line-clamp-2 text-left">{draft.content.caption}</span>
                      </button>
                    </div>
                  </>
                )}

                {showTriggerSummary && (
                  <>
                    <BotBubble compact question={copy.question} onEdit={() => setStep('trigger')} />
                    <UserBubble onClick={() => setStep('trigger')}>
                      {draft.triggerMode === 'any' ? 'Any comment' : draft.keywords.join(', ')}
                    </UserBubble>
                  </>
                )}

                <AnimatePresence mode="wait">
                  {isTyping ? (
                    <TypingBubble key="typing" />
                  ) : (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {step === 'channel' && (
                        <BotBubble>
                          <ChannelTurn onSelectInstagram={goSource} />
                        </BotBubble>
                      )}
                      {step === 'source' && (
                        <BotBubble>
                          <SourceTurn onSelect={selectSource} />
                        </BotBubble>
                      )}
                      {step === 'content' && (
                        <BotBubble>
                          <ContentTurn sourceType={draft.sourceType} onSelect={selectContent} />
                        </BotBubble>
                      )}
                      {step === 'trigger' && (
                        <BotBubble>
                          <TriggerTurn
                            draft={draft}
                            setDraft={setDraft}
                            copy={copy}
                            keywordInput={keywordInput}
                            setKeywordInput={setKeywordInput}
                            addKeyword={addKeyword}
                            removeKeyword={removeKeyword}
                            excludedInput={excludedInput}
                            setExcludedInput={setExcludedInput}
                            addExcluded={addExcluded}
                            removeExcluded={removeExcluded}
                            showExcluded={showExcluded}
                            setShowExcluded={setShowExcluded}
                            onBack={initialSourceType ? undefined : (SOURCE_NEEDS_CONTENT[draft.sourceType] ? () => setStep('content') : goSource)}
                            onNext={() => setStep('sequence')}
                            canNext={canProceedTrigger}
                          />
                        </BotBubble>
                      )}
                      {step === 'sequence' && (
                        <BotBubble>
                          <SequenceTurn
                            draft={draft}
                            setDraft={setDraft}
                            onBack={() => setStep('trigger')}
                            onNext={() => setStep('review')}
                            canNext={canProceedSequence}
                          />
                        </BotBubble>
                      )}
                      {step === 'review' && (
                        <BotBubble>
                          <ReviewTurn
                            draft={draft}
                            copy={copy}
                            onBack={() => setStep('sequence')}
                            onLaunch={handleLaunch}
                            isLaunching={isLaunching}
                          />
                        </BotBubble>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Chat chrome ──────────────────────────────────────────────────
function BotBubble({ children, compact, question, onEdit }: { children?: React.ReactNode; compact?: boolean; question?: string; onEdit?: () => void }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      {compact ? (
        <button onClick={onEdit} className="max-w-[86%] bg-white hover:bg-surface-container-low rounded-2xl rounded-tl-sm shadow-sm border border-outline-variant/10 px-3.5 py-2 text-left transition-colors">
          <p className="text-xs text-on-surface-variant">{question}</p>
        </button>
      ) : (
        <div className="max-w-[86%] bg-white rounded-2xl rounded-tl-sm shadow-sm border border-outline-variant/10 p-3.5 flex-1">
          {children}
        </div>
      )}
    </div>
  );
}

function UserBubble({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div className="flex justify-end">
      <button onClick={onClick} className="max-w-[86%] bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs font-bold text-left hover:opacity-90 transition-opacity">
        {children}
      </button>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex gap-2 items-center">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-outline-variant/10 px-4 py-3 flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

function BubbleActions({ onBack, onNext, nextLabel = 'Continue', nextDisabled, nextIcon: NextIcon = ArrowRight, loading }: {
  onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean; nextIcon?: typeof ArrowRight; loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mt-3.5 pt-3 border-t border-outline-variant/10">
      {onBack ? (
        <button onClick={onBack} className="flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
      ) : <span />}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold disabled:opacity-40 hover:opacity-90 transition-all shadow-md shadow-primary/20"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>{nextLabel} <NextIcon className="w-3.5 h-3.5" /></>}
      </motion.button>
    </div>
  );
}

// ── Turn: Channel ──────────────────────────────────────────────
function ChannelTurn({ onSelectInstagram }: { onSelectInstagram: () => void }) {
  return (
    <div>
      <p className="text-sm text-on-surface font-medium mb-3">Where should this live?</p>
      <div className="space-y-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onSelectInstagram}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50 hover:brightness-95 transition-all text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs text-on-surface">Instagram</p>
            <p className="text-[10px] text-on-surface-variant">Comments, replies &amp; DMs</p>
          </div>
          <ArrowRight className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
        </motion.button>

        <div className="w-full flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low opacity-80">
          <div className="w-9 h-9 rounded-xl bg-[#0866FF] flex items-center justify-center flex-shrink-0">
            <Facebook className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs text-on-surface">Facebook Messenger</p>
            <p className="text-[10px] text-on-surface-variant">Needs a Page connected</p>
          </div>
          <button
            onClick={() => toast('Connect your Facebook Page from Settings first', { icon: '🔗' })}
            className="px-2.5 py-1.5 bg-on-surface text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition-all flex-shrink-0"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Turn: Source ────────────────────────────────────────────────
function SourceTurn({ onSelect }: { onSelect: (s: SourceType) => void }) {
  return (
    <div>
      <p className="text-sm text-on-surface font-medium mb-3">What should spark it?</p>
      <div className="space-y-1.5">
        {SOURCE_OPTIONS.map((opt, idx) => (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(opt.value)}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <opt.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-on-surface">{opt.label}</p>
              <p className="text-[10px] text-on-surface-variant">{opt.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Turn: Content picker ───────────────────────────────────────
function ContentTurn({ sourceType, onSelect }: { sourceType: SourceType; onSelect: (item: ContentItem) => void }) {
  const items = SOURCE_CONTENT_MAP[sourceType];
  return (
    <div>
      <p className="text-sm text-on-surface font-medium mb-3">Which one should I watch?</p>
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-0.5">
        {items.map((item, idx) => {
          const Icon = contentTypeIcon(item.type);
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(item)}
              className="relative rounded-xl overflow-hidden text-left"
            >
              <img src={item.thumbnail} alt="" className="w-full h-20 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
              <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-black/60 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">
                <Icon className="w-2 h-2" /> {CONTENT_TYPE_LABEL[item.type]}
              </div>
              <p className="absolute bottom-1 left-1 right-1 text-white text-[8px] font-semibold line-clamp-2">{item.caption}</p>
            </motion.button>
          );
        })}
        {items.length === 0 && <p className="col-span-2 text-xs text-on-surface-variant py-4 text-center">Nothing here yet.</p>}
      </div>
    </div>
  );
}

// ── Turn: Trigger ───────────────────────────────────────────────
interface TriggerTurnProps {
  draft: AutoDmDraft;
  setDraft: React.Dispatch<React.SetStateAction<AutoDmDraft>>;
  copy: ReturnType<typeof triggerCopy>;
  keywordInput: string;
  setKeywordInput: (v: string) => void;
  addKeyword: () => void;
  removeKeyword: (kw: string) => void;
  excludedInput: string;
  setExcludedInput: (v: string) => void;
  addExcluded: () => void;
  removeExcluded: (kw: string) => void;
  showExcluded: boolean;
  setShowExcluded: (v: boolean) => void;
  onBack?: () => void;
  onNext: () => void;
  canNext: boolean;
}

function TriggerTurn({
  draft, setDraft, copy, keywordInput, setKeywordInput, addKeyword, removeKeyword,
  excludedInput, setExcludedInput, addExcluded, removeExcluded, showExcluded, setShowExcluded,
  onBack, onNext, canNext,
}: TriggerTurnProps) {
  return (
    <div>
      {draft.content && (
        <div className="flex items-center gap-2 p-2 bg-surface-container-low rounded-xl mb-3">
          <img src={draft.content.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
          <p className="text-[10px] text-on-surface-variant line-clamp-2">{draft.content.caption}</p>
        </div>
      )}

      <p className="text-sm text-on-surface font-medium mb-2.5">{copy.question}</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <ChoiceChip active={draft.triggerMode === 'keyword'} onClick={() => setDraft(d => ({ ...d, triggerMode: 'keyword' }))} icon={Key} label="Keyword" />
        <ChoiceChip active={draft.triggerMode === 'any'} onClick={() => setDraft(d => ({ ...d, triggerMode: 'any' }))} icon={Sparkles} label="Any" />
      </div>

      {draft.triggerMode === 'keyword' && (
        <div className="space-y-2.5 mb-3">
          <div className="flex items-center gap-1.5">
            <input
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
              placeholder="Type a keyword…"
              className="flex-1 bg-surface-container-low border-none rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary transition-all"
            />
            <button onClick={addKeyword} className="p-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all flex-shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {draft.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {draft.keywords.map(kw => (
                <span key={kw} className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full">
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="hover:text-error"><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
            </div>
          )}
          {!showExcluded ? (
            <button onClick={() => setShowExcluded(true)} className="text-[10px] font-bold text-primary hover:underline">+ exclude some words</button>
          ) : (
            <div>
              <div className="flex items-center gap-1.5">
                <input
                  value={excludedInput}
                  onChange={e => setExcludedInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExcluded(); } }}
                  placeholder="Excluded keyword…"
                  className="flex-1 bg-surface-container-low border-none rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary transition-all"
                />
                <button onClick={addExcluded} className="p-2 bg-surface-container-highest text-primary rounded-lg hover:opacity-90 transition-all flex-shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {draft.excludedKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {draft.excludedKeywords.map(kw => (
                    <span key={kw} className="flex items-center gap-1 bg-error/10 text-error text-[10px] font-bold px-2 py-1 rounded-full">
                      {kw}
                      <button onClick={() => removeExcluded(kw)} className="hover:opacity-70"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {copy.autoReplyLabel && (
        <MiniToggle label={copy.autoReplyLabel} checked={draft.autoReplyEnabled} onToggle={() => setDraft(d => ({ ...d, autoReplyEnabled: !d.autoReplyEnabled }))} />
      )}

      <BubbleActions onBack={onBack} onNext={onNext} nextDisabled={!canNext} />
    </div>
  );
}

function ChoiceChip({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Key; label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all',
        active ? 'bg-gradient-to-br from-primary/15 to-purple-500/15 text-primary ring-1 ring-primary/40' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
      )}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </motion.button>
  );
}

function MiniToggle({ label, checked, onToggle, icon: Icon }: { label: string; checked: boolean; onToggle: () => void; icon?: typeof UserPlus }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-surface-container-low rounded-xl cursor-pointer mb-2" onClick={onToggle}>
      <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
        {Icon && <Icon className="w-3.5 h-3.5 text-on-surface-variant" />} {label}
      </span>
      <div className="relative flex-shrink-0 rounded-full" style={{ width: '2.25rem', height: '1.25rem' }}>
        <div className={cn('absolute inset-0 rounded-full transition-colors', checked ? 'bg-gradient-to-r from-primary to-purple-600' : 'bg-outline-variant/30')} />
        <motion.div
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
          animate={{ x: checked ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </div>
  );
}

// ── Turn: DM sequence ───────────────────────────────────────────
function SequenceTurn({ draft, setDraft, onBack, onNext, canNext }: {
  draft: AutoDmDraft;
  setDraft: React.Dispatch<React.SetStateAction<AutoDmDraft>>;
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-on-surface font-medium mb-3">Let's design the reply sequence 💬</p>

      <div className="mb-3">
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Wait before replying</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={1}
            value={draft.delayValue}
            onChange={e => setDraft(d => ({ ...d, delayValue: Math.max(1, parseInt(e.target.value) || 1) }))}
            className="w-16 bg-surface-container-low border-none rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-primary transition-all"
          />
          <select
            value={draft.delayUnit}
            onChange={e => setDraft(d => ({ ...d, delayUnit: e.target.value as 'Minute' | 'Hour' }))}
            className="flex-1 bg-surface-container-low border-none rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-primary transition-all appearance-none"
          >
            <option>Minute</option>
            <option>Hour</option>
          </select>
        </div>
      </div>

      <div className="mb-1">
        <MiniToggle icon={UserPlus} label="Ask them to follow first" checked={draft.askFollow} onToggle={() => setDraft(d => ({ ...d, askFollow: !d.askFollow }))} />
        <AnimatePresence>
          {draft.askFollow && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="p-3 bg-surface-container-low rounded-xl space-y-3 mb-2">
                <MiniField
                  label="Opening message"
                  value={draft.askFollowOpeningMessage}
                  max={OPENING_MESSAGE_MAX}
                  placeholder="Hey! Thanks for stopping by 😊 Tap below and I'll send you the access!"
                  onChange={v => setDraft(d => ({ ...d, askFollowOpeningMessage: v }))}
                  onAddVariable={() => setDraft(d => ({ ...d, askFollowOpeningMessage: `${d.askFollowOpeningMessage}${d.askFollowOpeningMessage ? ' ' : ''}${VARIABLE_TOKEN}`.slice(0, OPENING_MESSAGE_MAX) }))}
                />
                <MiniField
                  label="If they haven't followed"
                  value={draft.askFollowCheckMessage}
                  max={OPENING_MESSAGE_MAX}
                  placeholder="Looks like you haven't followed yet 👀 mind hitting follow first?"
                  onChange={v => setDraft(d => ({ ...d, askFollowCheckMessage: v }))}
                />
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant mb-1.5 block">
                    Retry
                    <input
                      type="number" min={1} max={10}
                      value={draft.askFollowRetryCount}
                      onChange={e => setDraft(d => ({ ...d, askFollowRetryCount: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) }))}
                      className="w-10 mx-1 bg-white border-none rounded-md px-1 py-0.5 text-xs text-center focus:ring-2 focus:ring-primary transition-all"
                    />
                    times, then:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <ChoiceChip active={draft.askFollowFallback === 'send'} onClick={() => setDraft(d => ({ ...d, askFollowFallback: 'send' }))} icon={Send} label="Send anyway" />
                    <ChoiceChip active={draft.askFollowFallback === 'dont_send'} onClick={() => setDraft(d => ({ ...d, askFollowFallback: 'dont_send' }))} icon={X} label="Don't send" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-3">
        <MiniToggle icon={Mail} label="Ask for their email first" checked={draft.askEmail} onToggle={() => setDraft(d => ({ ...d, askEmail: !d.askEmail }))} />
        <AnimatePresence>
          {draft.askEmail && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="p-3 bg-surface-container-low rounded-xl mb-2">
                <MiniField
                  label="Email request message"
                  value={draft.askEmailMessage}
                  max={OPENING_MESSAGE_MAX}
                  placeholder="Mind sharing your email too?"
                  onChange={v => setDraft(d => ({ ...d, askEmailMessage: v }))}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-2 border-t border-outline-variant/10">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mt-2 mb-2">Primary DM</p>
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <ChoiceChip active={draft.dmType === 'text'} onClick={() => setDraft(d => ({ ...d, dmType: 'text' }))} icon={MessageCircle} label="Text" />
          <ChoiceChip active={draft.dmType === 'text_button'} onClick={() => setDraft(d => ({ ...d, dmType: 'text_button' }))} icon={Send} label="Text + Button" />
        </div>

        <MiniField
          label="Message"
          value={draft.messageText}
          max={PRIMARY_MESSAGE_MAX}
          placeholder="Here's the link I promised ⬇️"
          onChange={v => setDraft(d => ({ ...d, messageText: v }))}
          onAddVariable={() => setDraft(d => ({ ...d, messageText: `${d.messageText}${d.messageText ? ' ' : ''}${VARIABLE_TOKEN}`.slice(0, PRIMARY_MESSAGE_MAX) }))}
        />

        <AnimatePresence>
          {draft.dmType === 'text_button' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                <input
                  value={draft.buttonText}
                  onChange={e => setDraft(d => ({ ...d, buttonText: e.target.value }))}
                  placeholder="Button label"
                  className="bg-surface-container-low border-none rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-primary transition-all"
                />
                <input
                  value={draft.buttonUrl}
                  onChange={e => setDraft(d => ({ ...d, buttonUrl: e.target.value }))}
                  placeholder="https://…"
                  className="bg-surface-container-low border-none rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-2.5 space-y-1.5">
          {draft.followUpMessages.map((msg, idx) => (
            <div key={idx} className="relative">
              <textarea
                value={msg}
                onChange={e => setDraft(d => ({ ...d, followUpMessages: d.followUpMessages.map((m, i) => i === idx ? e.target.value : m) }))}
                placeholder={`Follow-up ${idx + 1}`}
                className="w-full bg-surface-container-low border-none rounded-lg px-2.5 py-2 pr-7 text-xs focus:ring-2 focus:ring-primary transition-all min-h-[54px]"
              />
              <button
                onClick={() => setDraft(d => ({ ...d, followUpMessages: d.followUpMessages.filter((_, i) => i !== idx) }))}
                className="absolute top-2 right-2 text-on-surface-variant hover:text-error transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setDraft(d => ({ ...d, followUpMessages: [...d.followUpMessages, ''] }))}
            className="text-[10px] font-bold text-primary hover:underline"
          >
            + Add a follow-up message
          </button>
        </div>

        <div className="mt-3 flex items-start gap-1.5 p-2.5 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg border border-primary/10">
          <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[9px] text-on-surface-variant leading-relaxed">
            We vary each message slightly so it stays natural and doesn't get flagged as spam.
          </p>
        </div>
      </div>

      <BubbleActions onBack={onBack} onNext={onNext} nextDisabled={!canNext} />
    </div>
  );
}

function MiniField({ label, value, max, placeholder, onChange, onAddVariable }: {
  label: string; value: string; max: number; placeholder: string;
  onChange: (v: string) => void; onAddVariable?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] font-bold text-on-surface">{label}</label>
        <span className="text-[9px] text-on-surface-variant tabular-nums">{value.length}/{max}</span>
      </div>
      <textarea
        value={value}
        maxLength={max}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border-none rounded-lg px-2.5 py-2 text-xs focus:ring-2 focus:ring-primary transition-all min-h-[56px]"
      />
      {onAddVariable && (
        <button onClick={onAddVariable} className="mt-1 text-[9px] font-bold text-primary hover:underline">+ Add a variable</button>
      )}
    </div>
  );
}

// ── Turn: Review & Launch ───────────────────────────────────────
function ReviewTurn({ draft, copy, onBack, onLaunch, isLaunching }: {
  draft: AutoDmDraft; copy: ReturnType<typeof triggerCopy>; onBack: () => void; onLaunch: () => void; isLaunching: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-on-surface font-medium mb-1">Here's the full sequence 🚀</p>
      <p className="text-[10px] text-on-surface-variant mb-3">Take a look, then let's go live.</p>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
        <RecapRow icon={draft.triggerMode === 'any' ? Sparkles : Key}>
          {draft.triggerMode === 'any' ? 'Any comment' : draft.keywords.join(', ')}
        </RecapRow>
        <RecapRow icon={Clock}>Wait {draft.delayValue} {draft.delayUnit.toLowerCase()}{draft.delayValue === 1 ? '' : 's'}</RecapRow>
        {draft.askFollow && <RecapRow icon={UserPlus}>Ask to follow first (retry {draft.askFollowRetryCount}x)</RecapRow>}
        {draft.askEmail && <RecapRow icon={Mail}>Ask for email first</RecapRow>}
        <RecapRow icon={Send}>
          <span className="whitespace-pre-wrap">{draft.messageText}</span>
          {draft.dmType === 'text_button' && draft.buttonText && (
            <span className="block mt-1.5 inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary to-purple-600 text-white text-[10px] font-bold rounded-md w-fit">
              <Send className="w-2.5 h-2.5" /> {draft.buttonText}
            </span>
          )}
        </RecapRow>
        {draft.followUpMessages.filter(m => m.trim()).map((m, i) => (
          <RecapRow key={i} icon={MessageCircle}>{m}</RecapRow>
        ))}
      </div>

      <BubbleActions onBack={onBack} onNext={onLaunch} nextLabel="Launch it" nextIcon={Rocket} loading={isLaunching} />
    </div>
  );
}

function RecapRow({ icon: Icon, children }: { icon: typeof Key; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 bg-surface-container-low rounded-lg p-2.5">
      <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
      <p className="text-xs text-on-surface leading-relaxed">{children}</p>
    </div>
  );
}

// ── Success celebration ─────────────────────────────────────────
function LaunchCelebration({ draft, onDone }: { draft: AutoDmDraft; onDone: () => void }) {
  const rings = [0, 1, 2];
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent" />
      <div className="relative mb-5">
        {rings.map(r => (
          <motion.div
            key={r}
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: r * 0.5, ease: 'easeOut' }}
          />
        ))}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl shadow-primary/30"
        >
          <Rocket className="w-7 h-7 text-white" />
        </motion.div>
      </div>

      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="font-headline text-xl font-extrabold text-on-surface mb-1.5 relative">
        You're live! 🎉
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-xs text-on-surface-variant mb-5 max-w-[260px] relative">
        I'll watch for {draft.triggerMode === 'any' ? 'any comment' : 'your keywords'} and send the sequence automatically.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex flex-wrap items-center justify-center gap-1.5 mb-6 relative">
        <span className="flex items-center gap-1 bg-surface-container-low px-2.5 py-1 rounded-full text-[10px] font-bold text-on-surface"><Instagram className="w-3 h-3" /> Instagram</span>
        <span className="flex items-center gap-1 bg-surface-container-low px-2.5 py-1 rounded-full text-[10px] font-bold text-on-surface"><Clock className="w-3 h-3" /> {draft.delayValue}{draft.delayUnit[0].toLowerCase()} delay</span>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        whileTap={{ scale: 0.96 }}
        onClick={onDone}
        className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-bold shadow-lg shadow-primary/25 hover:opacity-90 transition-all"
      >
        Done
      </motion.button>
    </div>
  );
}
