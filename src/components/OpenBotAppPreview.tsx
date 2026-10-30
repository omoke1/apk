import React, { useEffect, useRef, useState } from 'react';
import { BloubAvatar } from './BloubAvatar';

type ThreadId = 'launch' | 'atlas' | 'forge' | 'pulse' | 'scout';

interface CustomMessage {
  id: string;
  author: 'user' | 'assistant';
  text: string;
  time: string;
}

const AGENTS = {
  atlas: {
    id: 'atlas' as const,
    name: 'Atlas',
    role: 'Team lead',
    time: '10:42 PM',
    preview: 'Three things need you toda...',
    hue: 30,
    provider: 'claude',
    model: 'Claude Opus 5.5',
    effort: 'High',
  },
  forge: {
    id: 'forge' as const,
    name: 'Forge',
    role: 'Builder',
    time: '9:50 AM',
    preview: 'PR #412 is ready: the pricin...',
    hue: 150,
    provider: 'codex',
    model: 'GPT-6 Luna',
    effort: 'Medium',
  },
  pulse: {
    id: 'pulse' as const,
    name: 'Pulse',
    role: 'Signals',
    time: '10:00 AM',
    preview: 'Mentions of agent teams ar...',
    hue: 280,
    provider: 'grok',
    model: 'Grok 4.6',
    effort: 'Medium',
  },
  scout: {
    id: 'scout' as const,
    name: 'Scout',
    role: 'Research',
    time: '11:20 AM',
    preview: 'Two competitors changed t...',
    hue: 215,
    provider: 'gemini',
    model: 'Gemini 3.1 Pro',
    effort: 'High',
  },
};

const ATTACHMENT_CONTENT: Record<string, { title: string; size: string; content: string }> = {
  'launch-plan.md': {
    title: 'launch-plan.md',
    size: '5 KB',
    content: `# Friday's Launch Plan (v2.0)

**Target Slot:** Friday, 10:00 CET
**Lead Coordinator:** Atlas
**Market Window:** Clear — Scout confirmed zero competing launches on Friday morning.

## 1. Deliverables & Owners
- **Launch Banner (PR #418):** Built by Forge. Responsive at 1440px and 390px. All 52 checks pass.
- **Launch Post (420 words):** Drafted by Pulse, reviewed with Alice.
- **X Thread (5 posts):** Answers the #1 community question (offline mode) in post 1.
- **Newsletter:** Scheduled for 10:15 CET to 18,400 subscribers.

## 2. Rollout Sequence
1. **09:45 CET** — Merge PR #418 after final banner approval.
2. **10:00 CET** — Publish blog post and changelog.
3. **10:05 CET** — Publish 5-post X thread.
4. **10:15 CET** — Send release newsletter.
5. **12:00 CET** — Pulse posts first two-hour signal summary in #launch.`,
  },
  'social-drafts.md': {
    title: 'social-drafts.md',
    size: '4 KB',
    content: `# Social Drafts — Friday 10:00 Launch

## X Thread (5 Posts)
**1/5** OpenBot 2.0 is live. You asked for offline mode and shared team workspaces—today both ship for macOS, Windows, and Linux.

**2/5** Your agents keep their context when you switch models. Start a task on Claude Opus, review it on Codex, and check sources with Gemini.

**3/5** Everything stays on your computer: workspaces, conversations, files, and browser sessions live in a local SQLite database you own.

**4/5** Built-in routines let agents run on a schedule—morning launch briefs, competitor scans, and PR reviews happen automatically.

**5/5** Download OpenBot for free at openbot.run and use the AI plans you already pay for.`,
  },
  'competitor-brief.md': {
    title: 'competitor-brief.md',
    size: '4 KB',
    content: `# Weekly Competitor Pricing Brief

Two competitors updated their pricing tiers this week:

1. **Relay AI** — Raised Team plan from $25 to $30/seat/month (effective Tuesday).
2. **CrewDesk** — Raised Pro Workspace from $20 to $25/seat/month and moved local runners to Enterprise.

**Recommendation:** Highlight OpenBot's $0 local desktop app and bring-your-own-plan model on the pricing comparison page.`,
  },
};

const ProviderBadgeIcon: React.FC<{ provider: string }> = ({ provider }) => {
  if (provider === 'claude') {
    return (
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#d97757] text-white text-[9px] font-bold">
        ✻
      </span>
    );
  }
  if (provider === 'codex') {
    return (
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#10a37f] text-white text-[9px] font-bold">
        ◈
      </span>
    );
  }
  if (provider === 'grok') {
    return (
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#27272a] border border-white/20 text-white text-[9px] font-bold">
        /
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#3b82f6] text-white text-[9px] font-bold">
      ✦
    </span>
  );
};

export const OpenBotAppPreview: React.FC = () => {
  const [activeThread, setActiveThread] = useState<ThreadId>('atlas');
  const [activeServer, setActiveServer] = useState<'team' | 'local'>('team');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mermaidMode, setMermaidMode] = useState<'preview' | 'code'>('preview');
  const [copiedMermaid, setCopiedMermaid] = useState(false);
  const [expandedDiagram, setExpandedDiagram] = useState(false);
  const [openAttachment, setOpenAttachment] = useState<string | null>(null);

  // Interactive expandable cards inside Atlas conversation
  const [planExpanded, setPlanExpanded] = useState(false);
  const [subagentsExpanded, setSubagentsExpanded] = useState(false);
  const [exchangeExpanded, setExchangeExpanded] = useState(false);
  const [stepsExpanded, setStepsExpanded] = useState(false);
  const [editingChannels, setEditingChannels] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'Blog and changelog',
    'X',
    'Newsletter',
  ]);

  // Model & effort selectors
  const [selectedModel, setSelectedModel] = useState('Claude Opus 5.5');
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [selectedEffort, setSelectedEffort] = useState<'Low' | 'Medium' | 'High'>('High');
  const [effortMenuOpen, setEffortMenuOpen] = useState(false);

  // Emoji reactions state
  const [reactions, setReactions] = useState<Record<string, number>>({
    '🚀': 1,
    '🔥': 1,
    '👏': 1,
  });
  const [userReacted, setUserReacted] = useState<Record<string, boolean>>({});

  // Custom sent messages per thread
  const [customMessages, setCustomMessages] = useState<Record<ThreadId, CustomMessage[]>>({
    launch: [],
    atlas: [],
    forge: [],
    pulse: [],
    scout: [],
  });
  const [inputValue, setInputValue] = useState('');
  const [isTypingReply, setIsTypingReply] = useState(false);

  // Initial scroll animation to mimic the 00:00 -> 00:03 video reveal
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [demoPhase, setDemoPhase] = useState<number>(3);

  useEffect(() => {
    // Animate initial scroll down to reveal the Mermaid diagram smoothly, just like 00:00-00:03 in the video
    setDemoPhase(1);
    const t1 = window.setTimeout(() => {
      setDemoPhase(2);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 140, behavior: 'smooth' });
      }
    }, 650);
    const t2 = window.setTimeout(() => {
      setDemoPhase(3);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 380, behavior: 'smooth' });
      }
    }, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleCopyMermaid = () => {
    const code = `flowchart LR\n  Scout[Scout: market check] --> Atlas\n  Forge[Forge: launch banner] --> Atlas\n  Pulse[Pulse: post and socials] --> Atlas\n  Atlas --> Launch((Friday 10:00))`;
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 1800);
  };

  const toggleReaction = (emoji: string) => {
    const active = !!userReacted[emoji];
    setUserReacted((prev) => ({ ...prev, [emoji]: !active }));
    setReactions((prev) => ({
      ...prev,
      [emoji]: Math.max(1, (prev[emoji] || 1) + (active ? -1 : 1)),
    }));
  };

  const toggleChannelOption = (ch: string) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? (prev.length > 1 ? prev.filter((item) => item !== ch) : prev) : [...prev, ch]
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: CustomMessage = {
      id: `u-${Date.now()}`,
      author: 'user',
      text: trimmed,
      time: nowTime,
    };
    setCustomMessages((prev) => ({
      ...prev,
      [activeThread]: [...prev[activeThread], userMsg],
    }));
    setInputValue('');
    setIsTypingReply(true);

    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    });

    const replies: Record<ThreadId, string> = {
      atlas:
        "Got it. I added this to Friday's launch plan, and I will check it with Forge, Scout, and Pulse at Thursday's review.",
      launch:
        'Atlas: Noted for the Friday 10:00 CET launch checklist. Pulse and Forge are synced.',
      forge:
        'On it. I will update the branch in PR #418 and re-run the 52 layout and contract checks.',
      pulse:
        'Good call. I will track sentiment around this topic and fold the findings into the Friday 12:00 summary.',
      scout:
        "Noted. I will include this in today's competitor scan and attach the primary sources.",
    };

    setTimeout(() => {
      setIsTypingReply(false);
      const replyMsg: CustomMessage = {
        id: `a-${Date.now()}`,
        author: 'assistant',
        text: replies[activeThread],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCustomMessages((prev) => ({
        ...prev,
        [activeThread]: [...prev[activeThread], replyMsg],
      }));
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      });
    }, 700);
  };

  const currentAgent = activeThread === 'launch' ? null : AGENTS[activeThread];

  return (
    <div className="w-full h-full flex bg-[#141416] text-[#ececef] font-sans select-none overflow-hidden text-[13px] leading-snug relative">
      {/* Leftmost Server & Utility Rail */}
      <aside className="w-[52px] shrink-0 bg-[#111113] border-r border-white/[0.06] flex flex-col items-center justify-between py-3 z-10">
        {/* Top macOS dots + Server icons */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>

          {/* Server 1: OpenBot team */}
          <button
            type="button"
            onClick={() => setActiveServer('team')}
            title="OpenBot team"
            className="relative group flex items-center justify-center w-full"
          >
            {activeServer === 'team' && (
              <span className="absolute left-0 w-1 h-5 rounded-r-full bg-white" />
            )}
            <span
              className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-transform ${
                activeServer === 'team'
                  ? 'bg-[#a46cf5] text-[#1a1025] shadow-sm'
                  : 'bg-[#a46cf5]/70 text-[#1a1025] opacity-75 hover:opacity-100'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path
                  d="M7 10.5L9.5 9M14.5 10.5L17 9"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>

          {/* Server 2: Local */}
          <button
            type="button"
            onClick={() => setActiveServer('local')}
            title="On this computer"
            className="relative group flex items-center justify-center w-full"
          >
            {activeServer === 'local' && (
              <span className="absolute left-0 w-1 h-5 rounded-r-full bg-white" />
            )}
            <span
              className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-transform ${
                activeServer === 'local'
                  ? 'bg-[#3ecf8e] text-[#0d261a]'
                  : 'bg-[#253830] text-[#3ecf8e] opacity-80 hover:opacity-100'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path
                  d="M7 10.5L9.5 9M14.5 10.5L17 9"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>

          {/* Add server + */}
          <button
            type="button"
            onClick={() => setActiveServer(activeServer === 'team' ? 'local' : 'team')}
            title="Add or switch workspace"
            className="w-8 h-8 rounded-[10px] text-[#8e8e96] hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Bottom Utility Icons */}
        <div className="flex flex-col items-center gap-2.5 text-[#8e8e96]">
          <button
            type="button"
            onClick={() => setActiveThread('scout')}
            title="Built-in Browser"
            className="w-7 h-7 rounded-lg hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14.5 14.5 0 0 0 0 18M12 3a14.5 14.5 0 0 1 0 18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setPlanExpanded((v) => !v)}
            title="Routines & Schedules"
            className="w-7 h-7 rounded-lg hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setSubagentsExpanded((v) => !v)}
            title="Plugins & Skills"
            className="w-7 h-7 rounded-lg hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l2-5h14l2 5M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9M3 9h18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setActiveThread('launch')}
            title="Team & Channels"
            className="w-7 h-7 rounded-lg hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="8" r="3.5" />
              <path d="M3 19c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" />
              <circle cx="17" cy="9" r="2.5" />
              <path d="M17 14c2.4 0 4.5 1.8 4.5 4.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setExchangeExpanded((v) => !v)}
            title="Notifications"
            className="w-7 h-7 rounded-lg hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          {/* User Avatar N */}
          <div className="w-6 h-6 rounded-full bg-[#22c55e] text-[#052e16] font-semibold text-[11px] flex items-center justify-center my-0.5">
            N
          </div>

          <button
            type="button"
            onClick={() => setEditingChannels((v) => !v)}
            title="Workspace Settings"
            className="w-7 h-7 rounded-lg hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.02 1.51 1H21a2 2 0 1 1 0 4h-.09c-.74.02-1.25.44-1.51 1z" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Left Channels & Agents Sidebar */}
      {sidebarOpen && (
        <aside className="w-[242px] shrink-0 bg-[#161618] border-r border-white/[0.06] flex flex-col">
          {/* Workspace Header */}
          <div className="h-12 px-3 flex items-center justify-between border-b border-white/[0.04]">
            <button
              type="button"
              onClick={() => setActiveServer(activeServer === 'team' ? 'local' : 'team')}
              className="flex items-center gap-2 text-left hover:bg-white/[0.04] px-1.5 py-1 rounded-md transition-colors"
            >
              <span className="w-5 h-5 rounded-[6px] bg-[#a46cf5] text-[#1a1025] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
                  <path
                    d="M7 10.5L9.5 9M14.5 10.5L17 9"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="font-semibold text-[13px] text-white truncate">
                {activeServer === 'team' ? 'OpenBot team' : 'On this computer'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#8e8e96]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              title="Collapse sidebar"
              className="w-6 h-6 rounded-md text-[#8e8e96] hover:text-white hover:bg-white/[0.06] flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M9 4v16" />
              </svg>
            </button>
          </div>

          {/* Search bar */}
          <div className="px-3 py-2.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const order: ThreadId[] = ['atlas', 'launch', 'forge', 'pulse', 'scout'];
                const next = order[(order.indexOf(activeThread) + 1) % order.length];
                setActiveThread(next);
              }}
              className="flex-1 h-7 px-2.5 rounded-md bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] flex items-center justify-between text-[12px] text-[#8e8e96] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <span>Search</span>
              </span>
              <span className="text-[10px] text-[#6e6e77]">Ctrl K</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveThread('launch')}
              title="New agent or channel"
              className="w-7 h-7 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[#8e8e96] hover:text-white flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-3">
            {/* Launch Group */}
            <div>
              <div className="px-2 py-1 flex items-center justify-between text-[11px] font-medium text-[#7c7c85]">
                <span>Launch</span>
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              <div className="space-y-0.5 mt-0.5">
                {/* #launch channel */}
                <button
                  type="button"
                  onClick={() => setActiveThread('launch')}
                  className={`w-full px-2 py-2 rounded-lg flex items-center gap-2.5 text-left transition-colors ${
                    activeThread === 'launch' ? 'bg-white/[0.08] text-white' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#1e2e24] text-[#3ecf8e] flex items-center justify-center shrink-0 font-semibold text-sm">
                    #
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="font-medium text-[12.5px] text-white truncate">
                        launch <span className="text-[#7c7c85] font-normal">Friday lau...</span>
                      </span>
                      <span className="text-[10px] text-[#7c7c85] shrink-0 tabular-nums">10:03 AM</span>
                    </div>
                    <p className="text-[11.5px] text-[#8e8e96] truncate">
                      Nobody else launches on Fr...
                    </p>
                  </div>
                </button>

                {/* Atlas, Forge, Pulse */}
                {(['atlas', 'forge', 'pulse'] as const).map((id) => {
                  const ag = AGENTS[id];
                  const isSelected = activeThread === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveThread(id)}
                      className={`w-full px-2 py-2 rounded-lg flex items-center gap-2.5 text-left transition-colors ${
                        isSelected ? 'bg-white/[0.09] text-white' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="relative w-8 h-8 shrink-0">
                        <BloubAvatar seed={ag.id} hue={ag.hue} size={32} />
                        <span className="absolute -bottom-0.5 -left-0.5">
                          <ProviderBadgeIcon provider={ag.provider} />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="font-medium text-[12.5px] text-white truncate">
                            {ag.name} <span className="text-[#7c7c85] font-normal">{ag.role}</span>
                          </span>
                          <span className="text-[10px] text-[#7c7c85] shrink-0 tabular-nums">{ag.time}</span>
                        </div>
                        <p className="text-[11.5px] text-[#8e8e96] truncate">{ag.preview}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Research Group */}
            <div>
              <div className="px-2 py-1 flex items-center justify-between text-[11px] font-medium text-[#7c7c85]">
                <span>Research</span>
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              <div className="space-y-0.5 mt-0.5">
                {(['scout'] as const).map((id) => {
                  const ag = AGENTS[id];
                  const isSelected = activeThread === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveThread(id)}
                      className={`w-full px-2 py-2 rounded-lg flex items-center gap-2.5 text-left transition-colors ${
                        isSelected ? 'bg-white/[0.09] text-white' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="relative w-8 h-8 shrink-0">
                        <BloubAvatar seed={ag.id} hue={ag.hue} size={32} />
                        <span className="absolute -bottom-0.5 -left-0.5">
                          <ProviderBadgeIcon provider={ag.provider} />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="font-medium text-[12.5px] text-white truncate">
                            {ag.name} <span className="text-[#7c7c85] font-normal">{ag.role}</span>
                          </span>
                          <span className="text-[10px] text-[#7c7c85] shrink-0 tabular-nums">{ag.time}</span>
                        </div>
                        <p className="text-[11.5px] text-[#8e8e96] truncate">{ag.preview}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Conversation Pane */}
      <div className="flex-1 flex flex-col bg-[#1a1a1c] min-w-0 relative">
        {/* Conversation Top Bar */}
        <header className="h-12 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Expand sidebar"
                className="w-6 h-6 rounded-md text-[#8e8e96] hover:text-white hover:bg-white/[0.06] flex items-center justify-center mr-1"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M9 4v16" />
                </svg>
              </button>
            )}
            {currentAgent ? (
              <>
                <div className="w-6 h-6 shrink-0">
                  <BloubAvatar seed={currentAgent.id} hue={currentAgent.hue} size={24} />
                </div>
                <span className="font-semibold text-[13.5px] text-white">{currentAgent.name}</span>
                <span className="text-[12.5px] text-[#8e8e96] truncate">{currentAgent.role}</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded-full bg-[#1e2e24] text-[#3ecf8e] flex items-center justify-center text-xs font-semibold">
                  #
                </div>
                <span className="font-semibold text-[13.5px] text-white">launch</span>
                <span className="text-[12.5px] text-[#8e8e96] truncate">Friday launch · 4 agents</span>
              </>
            )}
          </div>

          {/* Right Model & Reasoning Controls */}
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setModelMenuOpen((v) => !v);
                  setEffortMenuOpen(false);
                }}
                className="h-7 px-2.5 rounded-md hover:bg-white/[0.06] text-[12px] text-[#d4d4d8] flex items-center gap-1.5 transition-colors"
              >
                <ProviderBadgeIcon provider={currentAgent?.provider ?? 'claude'} />
                <span>{currentAgent ? currentAgent.model : selectedModel}</span>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#8e8e96]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {modelMenuOpen && (
                <div className="absolute right-0 top-8 w-48 rounded-lg bg-[#222226] border border-white/10 shadow-xl py-1 z-30">
                  {['Claude Opus 5.5', 'Claude Sonnet 5', 'GPT-6 Luna', 'Gemini 3.1 Pro', 'Grok 4.6'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m);
                        if (currentAgent) currentAgent.model = m;
                        setModelMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-[12px] text-[#e4e4e7] hover:bg-white/[0.08] flex items-center justify-between"
                    >
                      <span>{m}</span>
                      {(currentAgent?.model ?? selectedModel) === m && <span className="text-[#3ecf8e]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setEffortMenuOpen((v) => !v);
                  setModelMenuOpen(false);
                }}
                className="h-7 px-2 rounded-md hover:bg-white/[0.06] text-[12px] text-[#a1a1aa] flex items-center gap-1 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  <path d="M19 12a7 7 0 1 0-14 0" />
                </svg>
                <span>{selectedEffort}</span>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#8e8e96]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {effortMenuOpen && (
                <div className="absolute right-0 top-8 w-32 rounded-lg bg-[#222226] border border-white/10 shadow-xl py-1 z-30">
                  {(['Low', 'Medium', 'High'] as const).map((eff) => (
                    <button
                      key={eff}
                      type="button"
                      onClick={() => {
                        setSelectedEffort(eff);
                        setEffortMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-[12px] text-[#e4e4e7] hover:bg-white/[0.08] flex items-center justify-between"
                    >
                      <span>{eff}</span>
                      {selectedEffort === eff && <span className="text-[#3ecf8e]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpenAttachment(openAttachment ? null : 'launch-plan.md')}
              title="Toggle file preview panel"
              className="w-7 h-7 rounded-md text-[#8e8e96] hover:text-white hover:bg-white/[0.06] flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M15 4v16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Scrollable Messages Stream */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scroll-smooth"
        >
          {activeThread === 'atlas' && (
            <div className="max-w-[680px] mx-auto space-y-4">
              {/* Earlier message from Atlas */}
              <div className="space-y-2 text-[13px] text-[#e4e4e7]">
                <ol className="list-decimal list-inside space-y-1 text-[#d4d4d8]">
                  <li>
                    <strong className="text-white font-semibold">Review</strong> Forge&apos;s pricing-page PR #412.
                  </li>
                  <li>
                    <strong className="text-white font-semibold">Read</strong> Scout&apos;s competitor brief. Two prices changed.
                  </li>
                  <li>
                    <strong className="text-white font-semibold">Pick</strong> the launch day. Friday works for the whole team.
                  </li>
                </ol>
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px]">
                    👍
                  </span>
                </div>
              </div>

              {/* User Prompt Bubble (Right Aligned) */}
              <div className="flex justify-end">
                <div className="max-w-[390px] px-4 py-2.5 rounded-2xl bg-[#27272c] text-[#f4f4f6] text-[13px] leading-relaxed shadow-sm">
                  Plan Friday&apos;s launch with the team: the banner, the launch post and the socials.
                </div>
              </div>

              {/* Plan Progress Card */}
              <div className="rounded-xl bg-[#202024] border border-white/[0.07] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPlanExpanded((v) => !v)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2 text-[12.5px] text-[#e4e4e7] font-medium">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#a1a1aa]" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    <span>Friday&apos;s launch, split across the team.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-[#3ecf8e] w-full rounded-full" />
                    </div>
                    <span className="text-[11px] text-[#a1a1aa] tabular-nums">5/5</span>
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-3.5 h-3.5 text-[#8e8e96] transition-transform ${planExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </button>
                {planExpanded && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-white/[0.05] space-y-1.5 text-[12px] text-[#a1a1aa]">
                    {[
                      "Check this week's competitor launches",
                      'Build the launch banner',
                      'Draft the launch post and socials',
                      'Pick the channels',
                      'Send the launch plan',
                    ].map((step) => (
                      <div key={step} className="flex items-center gap-2">
                        <span className="text-[#3ecf8e]">✓</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subagents Summary Line */}
              <div>
                <button
                  type="button"
                  onClick={() => setSubagentsExpanded((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-[12px] text-[#a1a1aa] hover:text-white transition-colors"
                >
                  <span className="font-medium text-[#d4d4d8]">Ran 2 subagents</span>
                  <span>·</span>
                  <span>2 done</span>
                  <svg
                    viewBox="0 0 24 24"
                    className={`w-3 h-3 transition-transform ${subagentsExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
                {subagentsExpanded && (
                  <div className="mt-2 p-3 rounded-lg bg-[#202024] border border-white/[0.06] space-y-2 text-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#e4e4e7] font-medium">1. Read the last three launch retros</span>
                      <span className="text-[#3ecf8e] text-[11px]">Completed · retros/0.47-launch.md</span>
                    </div>
                    <p className="text-[#8e8e96]">Two of three launches posted the socials late.</p>
                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                      <span className="text-[#e4e4e7] font-medium">2. Collect the open launch blockers</span>
                      <span className="text-[#3ecf8e] text-[11px]">Completed · Issue #409</span>
                    </div>
                    <p className="text-[#8e8e96]">One blocker: the banner copy needs approval.</p>
                  </div>
                )}
              </div>

              {/* Teammate Exchange Divider */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.07]" />
                  <button
                    type="button"
                    onClick={() => setExchangeExpanded((v) => !v)}
                    className="inline-flex items-center gap-2 text-[11.5px] text-[#a1a1aa] hover:text-white transition-colors"
                  >
                    <span>4 messages with</span>
                    <span className="inline-flex items-center -space-x-1.5">
                      <span className="w-4 h-4 rounded-full ring-1 ring-[#1a1a1c] overflow-hidden inline-block">
                        <BloubAvatar seed="scout" hue={215} size={16} animated={false} />
                      </span>
                      <span className="w-4 h-4 rounded-full ring-1 ring-[#1a1a1c] overflow-hidden inline-block">
                        <BloubAvatar seed="forge" hue={150} size={16} animated={false} />
                      </span>
                      <span className="w-4 h-4 rounded-full ring-1 ring-[#1a1a1c] overflow-hidden inline-block">
                        <BloubAvatar seed="pulse" hue={280} size={16} animated={false} />
                      </span>
                    </span>
                    <span className="text-[#e4e4e7] font-medium">3 agents</span>
                    <span className="text-[#6e6e77] tabular-nums">10:42 PM</span>
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-3 h-3 transition-transform ${exchangeExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <div className="h-px flex-1 bg-white/[0.07]" />
                </div>

                {exchangeExpanded && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#202024] border border-white/[0.07] space-y-2.5 text-[12px]">
                    <div className="flex items-start gap-2">
                      <BloubAvatar seed="atlas" hue={30} size={20} animated={false} />
                      <div>
                        <span className="font-semibold text-white">Atlas → Scout, Forge, Pulse: </span>
                        <span className="text-[#a1a1aa]">
                          @Scout check this week&apos;s competitor launches. @Forge build the launch banner. @Pulse draft the launch post and the socials.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <BloubAvatar seed="scout" hue={215} size={20} animated={false} />
                      <div>
                        <span className="font-semibold text-white">Scout: </span>
                        <span className="text-[#a1a1aa]">
                          No competitor launches on Friday morning. The 10:00 CET slot is clear.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <BloubAvatar seed="forge" hue={150} size={20} animated={false} />
                      <div>
                        <span className="font-semibold text-white">Forge: </span>
                        <span className="text-[#a1a1aa]">
                          The launch banner is in PR #418. It passes the checks at desktop and phone widths.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <BloubAvatar seed="pulse" hue={280} size={20} animated={false} />
                      <div>
                        <span className="font-semibold text-white">Pulse: </span>
                        <span className="text-[#a1a1aa]">
                          The launch post and three social drafts are ready. Engagement peaks from 9:30 to 11:00 on Friday.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Answers Sent Prompt Card */}
              <div className="rounded-xl bg-[#202024] border border-white/[0.07] p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[12px] font-medium text-[#e4e4e7]">
                    <span className="text-[#3ecf8e]">✓</span>
                    <span>Answers sent</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingChannels((v) => !v)}
                    className="text-[11px] text-[#8e8e96] hover:text-white transition-colors"
                  >
                    {editingChannels ? 'Done' : 'Change channels'}
                  </button>
                </div>
                <p className="text-[12px] text-[#8e8e96]">Which channels should the launch use?</p>
                {editingChannels ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Blog and changelog', 'X', 'LinkedIn', 'Newsletter', 'Product Hunt'].map((ch) => {
                      const active = selectedChannels.includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => toggleChannelOption(ch)}
                          className={`px-2.5 py-1 rounded-md text-[11.5px] border transition-colors ${
                            active
                              ? 'bg-[#3ecf8e]/15 border-[#3ecf8e]/50 text-white'
                              : 'bg-white/[0.03] border-white/10 text-[#8e8e96] hover:text-white'
                          }`}
                        >
                          {active ? '✓ ' : ''}
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[12.5px] text-white font-medium">{selectedChannels.join(', ')}</p>
                )}
              </div>

              {/* 2 steps · Memory: 1 saved */}
              <div>
                <button
                  type="button"
                  onClick={() => setStepsExpanded((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-[12px] text-[#8e8e96] hover:text-white transition-colors"
                >
                  <span className="text-[#d4d4d8] font-medium">2 steps · Memory: 1 saved</span>
                  <span className="tabular-nums">11s</span>
                  <svg
                    viewBox="0 0 24 24"
                    className={`w-3 h-3 transition-transform ${stepsExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
                {stepsExpanded && (
                  <div className="mt-1.5 px-3 py-2 rounded-lg bg-[#202024] border border-white/[0.06] text-[11.5px] text-[#a1a1aa]">
                    Saved memory: <span className="text-white">&ldquo;Launches go out on Friday at 10:00 CET, after the Thursday review.&rdquo;</span>
                  </div>
                )}
              </div>

              {/* Final Answer: Friday's Launch Plan */}
              <div
                className={`space-y-3.5 transition-opacity duration-500 ${
                  demoPhase >= 2 ? 'opacity-100' : 'opacity-90'
                }`}
              >
                <h3 className="text-[15px] font-semibold text-white">Friday&apos;s launch plan</h3>
                <p className="text-[13px] text-[#d4d4d8]">
                  The team is ready. Nobody else launches on Friday, so we keep the 10:00 slot.
                </p>

                {/* Launch Channels Table */}
                <div className="overflow-hidden border-b border-white/[0.07]">
                  <table className="w-full text-left border-collapse text-[12.5px]">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[#8e8e96] font-medium">
                        <th className="py-2 pr-4 font-medium">Channel</th>
                        <th className="py-2 px-4 font-medium">Copy</th>
                        <th className="py-2 px-4 font-medium">Visual</th>
                        <th className="py-2 pl-4 font-medium">Scheduled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05] text-[#e4e4e7]">
                      {selectedChannels.map((ch) => (
                        <tr key={ch}>
                          <td className="py-2 pr-4">{ch}</td>
                          <td className="py-2 px-4 text-[#d4d4d8]">✓</td>
                          <td className="py-2 px-4 text-[#d4d4d8]">✓</td>
                          <td className="py-2 pl-4 text-[#d4d4d8]">{ch === 'Product Hunt' ? '—' : '✓'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Interactive Mermaid Flowchart Box */}
                <div className="rounded-xl bg-[#161618] border border-white/[0.08] overflow-hidden">
                  <div className="px-3.5 py-2 border-b border-white/[0.06] flex items-center justify-between text-[11.5px] text-[#8e8e96]">
                    <span>Mermaid</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setMermaidMode('preview')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          mermaidMode === 'preview'
                            ? 'bg-white/[0.1] text-white'
                            : 'text-[#8e8e96] hover:text-white'
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setMermaidMode('code')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          mermaidMode === 'code'
                            ? 'bg-white/[0.1] text-white'
                            : 'text-[#8e8e96] hover:text-white'
                        }`}
                      >
                        Code
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyMermaid}
                        className="px-2 py-0.5 rounded text-[11px] text-[#8e8e96] hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>{copiedMermaid ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedDiagram(true)}
                        className="px-2 py-0.5 rounded text-[11px] text-[#8e8e96] hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                        <span>Expand</span>
                      </button>
                    </div>
                  </div>

                  {mermaidMode === 'preview' ? (
                    <div className="p-4 flex items-center justify-center bg-[#18181b]">
                      <svg viewBox="0 0 540 215" className="w-full max-w-[500px] h-auto">
                        <defs>
                          <marker
                            id="mermaid-arrow"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 0 1 L 10 5 L 0 9 z" fill="#71717a" />
                          </marker>
                        </defs>

                        {/* Edges */}
                        <path
                          d="M 190 36 C 235 36, 245 107, 286 107"
                          fill="none"
                          stroke="#71717a"
                          strokeWidth="1.5"
                          markerEnd="url(#mermaid-arrow)"
                        />
                        <path
                          d="M 190 107 L 286 107"
                          fill="none"
                          stroke="#71717a"
                          strokeWidth="1.5"
                          markerEnd="url(#mermaid-arrow)"
                        />
                        <path
                          d="M 190 178 C 235 178, 245 107, 286 107"
                          fill="none"
                          stroke="#71717a"
                          strokeWidth="1.5"
                          markerEnd="url(#mermaid-arrow)"
                        />
                        <path
                          d="M 358 107 L 404 107"
                          fill="none"
                          stroke="#71717a"
                          strokeWidth="1.5"
                          markerEnd="url(#mermaid-arrow)"
                        />

                        {/* Scout node */}
                        <rect
                          x="58"
                          y="12"
                          width="132"
                          height="48"
                          rx="8"
                          fill="#222226"
                          stroke="#3f3f46"
                          strokeWidth="1.2"
                        />
                        <text x="124" y="33" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="sans-serif">
                          Scout: market
                        </text>
                        <text x="124" y="49" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="sans-serif">
                          check
                        </text>

                        {/* Forge node */}
                        <rect
                          x="58"
                          y="83"
                          width="132"
                          height="48"
                          rx="8"
                          fill="#222226"
                          stroke="#3f3f46"
                          strokeWidth="1.2"
                        />
                        <text x="124" y="104" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="sans-serif">
                          Forge: launch
                        </text>
                        <text x="124" y="120" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="sans-serif">
                          banner
                        </text>

                        {/* Pulse node */}
                        <rect
                          x="58"
                          y="154"
                          width="132"
                          height="48"
                          rx="8"
                          fill="#222226"
                          stroke="#3f3f46"
                          strokeWidth="1.2"
                        />
                        <text x="124" y="175" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="sans-serif">
                          Pulse: post and
                        </text>
                        <text x="124" y="191" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="sans-serif">
                          socials
                        </text>

                        {/* Atlas node */}
                        <rect
                          x="292"
                          y="89"
                          width="66"
                          height="36"
                          rx="8"
                          fill="#222226"
                          stroke="#3f3f46"
                          strokeWidth="1.2"
                        />
                        <text x="325" y="111" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="sans-serif">
                          Atlas
                        </text>

                        {/* Friday 10:00 circle */}
                        <circle
                          cx="452"
                          cy="107"
                          r="42"
                          fill="#222226"
                          stroke="#3f3f46"
                          strokeWidth="1.2"
                        />
                        <text x="452" y="111" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="sans-serif">
                          Friday 10:00
                        </text>
                      </svg>
                    </div>
                  ) : (
                    <pre className="p-4 text-[12px] font-mono text-[#d4d4d8] bg-[#141416] overflow-x-auto">
{`flowchart LR
  Scout[Scout: market check] --> Atlas
  Forge[Forge: launch banner] --> Atlas
  Pulse[Pulse: post and socials] --> Atlas
  Atlas --> Launch((Friday 10:00))`}
                    </pre>
                  )}
                </div>

                <p className="text-[13px] text-[#d4d4d8]">
                  Open item: you approve the banner in PR #418.
                </p>

                {/* Attachment File Cards */}
                <div className="flex flex-wrap gap-2.5 pt-0.5">
                  {(['launch-plan.md', 'social-drafts.md'] as const).map((fileKey) => {
                    const file = ATTACHMENT_CONTENT[fileKey];
                    return (
                      <button
                        key={fileKey}
                        type="button"
                        onClick={() => setOpenAttachment(fileKey)}
                        className="w-[196px] p-2.5 rounded-xl bg-[#222226] hover:bg-[#28282d] border border-white/[0.08] flex items-center justify-between text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-[#2e2e34] text-[#a1a1aa] flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </span>
                          <div className="min-w-0">
                            <div className="text-[12px] font-medium text-white truncate">{file.title}</div>
                            <div className="text-[10.5px] text-[#7c7c85]">{file.size}</div>
                          </div>
                        </div>
                        <span className="text-[#7c7c85] group-hover:text-white transition-colors">
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Reactions Row */}
                <div className="flex items-center gap-1.5 pt-1">
                  {(['🚀', '🔥', '👏'] as const).map((emoji) => {
                    const active = !!userReacted[emoji];
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => toggleReaction(emoji)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11.5px] border transition-colors ${
                          active
                            ? 'bg-[#a46cf5]/20 border-[#a46cf5]/50 text-white'
                            : 'bg-white/[0.05] border-white/[0.08] text-[#d4d4d8] hover:bg-white/[0.09]'
                        }`}
                      >
                        <span>{emoji}</span>
                        {reactions[emoji] > 1 && (
                          <span className="text-[10.5px] tabular-nums">{reactions[emoji]}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* #launch Channel View */}
          {activeThread === 'launch' && (
            <div className="max-w-[680px] mx-auto space-y-4">
              <div className="p-3.5 rounded-xl bg-[#202024] border border-white/[0.07] flex items-center justify-between">
                <div>
                  <h3 className="text-[13.5px] font-semibold text-white"># launch — Friday launch</h3>
                  <p className="text-[12px] text-[#8e8e96]">
                    Shared room where Atlas, Scout, Forge, and Pulse coordinate Friday&apos;s release.
                  </p>
                </div>
                <div className="flex -space-x-1.5">
                  <BloubAvatar seed="atlas" hue={30} size={24} animated={false} />
                  <BloubAvatar seed="scout" hue={215} size={24} animated={false} />
                  <BloubAvatar seed="forge" hue={150} size={24} animated={false} />
                  <BloubAvatar seed="pulse" hue={280} size={24} animated={false} />
                </div>
              </div>

              {[
                {
                  name: 'Norbert',
                  role: 'You',
                  time: '9:51 AM',
                  text: "The launch is on Friday at 10:00. Let's keep the launch updates in this channel.",
                  isUser: true,
                },
                {
                  name: 'Atlas',
                  role: 'Team lead',
                  seed: 'atlas',
                  hue: 30,
                  time: '9:52 AM',
                  text: 'Got it. I will split the work across the team and post the plan here when it is ready.',
                },
                {
                  name: 'Pulse',
                  role: 'Signals',
                  seed: 'pulse',
                  hue: 280,
                  time: '9:58 AM',
                  text: 'I will watch what people say on launch day and post a summary at 12:00.',
                },
                {
                  name: 'Scout',
                  role: 'Research',
                  seed: 'scout',
                  hue: 215,
                  time: '10:03 AM',
                  text: 'Nobody else launches on Friday morning. I will post here if that changes.',
                },
              ].map((msg, i) => (
                <div key={i} className="flex items-start gap-3">
                  {msg.isUser ? (
                    <div className="w-7 h-7 rounded-full bg-[#22c55e] text-[#052e16] font-semibold text-xs flex items-center justify-center shrink-0">
                      N
                    </div>
                  ) : (
                    <div className="w-7 h-7 shrink-0">
                      <BloubAvatar seed={msg.seed!} hue={msg.hue!} size={28} />
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-white text-[12.5px]">{msg.name}</span>
                      <span className="text-[11px] text-[#7c7c85]">{msg.time}</span>
                    </div>
                    <p className="text-[13px] text-[#d4d4d8]">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Forge Thread View */}
          {activeThread === 'forge' && (
            <div className="max-w-[680px] mx-auto space-y-4">
              <div className="flex justify-end">
                <div className="max-w-[360px] px-4 py-2.5 rounded-2xl bg-[#27272c] text-[#f4f4f6] text-[13px]">
                  Show me the launch banner before it ships.
                </div>
              </div>
              <div className="text-[12px] text-[#8e8e96]">
                Edited <code className="text-[#d4d4d8]">site/sections/launch-banner.html</code> · Ran 52 checks (52 passed)
              </div>
              <div className="space-y-3">
                <p className="text-[13px] text-[#d4d4d8]">
                  Here is the banner from <strong className="text-white">PR #418</strong>. It reads the release name from the shared contract and fits at 1440 px and 390 px:
                </p>
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#4338ca] via-[#9333ea] to-[#db2777] text-white space-y-1.5">
                  <div className="text-[10px] uppercase tracking-widest opacity-80">Launch week</div>
                  <div className="text-lg font-bold">Version 2.0 is here</div>
                  <p className="text-[12.5px] opacity-90 pb-1">
                    Shared workspaces, offline mode and sync that is twice as fast.
                  </p>
                  <span className="inline-block px-3.5 py-1.5 rounded-full bg-white text-[#4338ca] font-semibold text-[11.5px]">
                    See what is new
                  </span>
                </div>
                <p className="text-[13px] text-[#d4d4d8]">
                  Approve the PR and I will merge it on Friday at 9:45.
                </p>
              </div>
            </div>
          )}

          {/* Pulse Thread View */}
          {activeThread === 'pulse' && (
            <div className="max-w-[680px] mx-auto space-y-4">
              <div className="flex justify-end">
                <div className="max-w-[360px] px-4 py-2.5 rounded-2xl bg-[#27272c] text-[#f4f4f6] text-[13px]">
                  How did people react to the teaser?
                </div>
              </div>
              <div className="text-[12px] text-[#8e8e96]">
                Read 212 posts and replies about the teaser · Grouped by topic
              </div>
              <div className="space-y-3">
                <p className="text-[13px] text-[#d4d4d8]">
                  The teaser is doing well. Most replies ask about offline mode.
                </p>
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[#8e8e96]">
                      <th className="py-2 pr-4 font-medium">Signal</th>
                      <th className="py-2 px-4 font-medium">Posts</th>
                      <th className="py-2 pl-4 font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05] text-[#e4e4e7]">
                    <tr>
                      <td className="py-2 pr-4">Offline mode questions</td>
                      <td className="py-2 px-4 tabular-nums">84</td>
                      <td className="py-2 pl-4 text-[#3ecf8e] tabular-nums">↑ 3×</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Shared workspaces</td>
                      <td className="py-2 px-4 tabular-nums">51</td>
                      <td className="py-2 pl-4 text-[#3ecf8e] tabular-nums">↑ 40%</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Pricing worries</td>
                      <td className="py-2 px-4 tabular-nums">9</td>
                      <td className="py-2 pl-4 text-[#a1a1aa] tabular-nums">↓ 20%</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[13px] text-[#d4d4d8]">
                  I suggest that the X thread answers the offline question in the first post.
                </p>
              </div>
            </div>
          )}

          {/* Scout Thread View */}
          {activeThread === 'scout' && (
            <div className="max-w-[680px] mx-auto space-y-4">
              <div className="flex justify-end">
                <div className="max-w-[360px] px-4 py-2.5 rounded-2xl bg-[#27272c] text-[#f4f4f6] text-[13px]">
                  Track what changed in competitor pricing this week.
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[13px] text-[#d4d4d8]">
                  Two competitors changed their prices this week. Both raised their team plans by $5 per seat. The sources and the full table are in the brief.
                </p>
                <button
                  type="button"
                  onClick={() => setOpenAttachment('competitor-brief.md')}
                  className="w-[210px] p-2.5 rounded-xl bg-[#222226] hover:bg-[#28282d] border border-white/[0.08] flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#2e2e34] text-[#a1a1aa] flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-white truncate">competitor-brief.md</div>
                      <div className="text-[10.5px] text-[#7c7c85]">4 KB</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Custom interactive messages sent by user */}
          {customMessages[activeThread].map((m) => (
            <div key={m.id} className="max-w-[680px] mx-auto">
              {m.author === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[390px] px-4 py-2.5 rounded-2xl bg-[#27272c] text-[#f4f4f6] text-[13px]">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#202024] border border-white/[0.07] text-[13px] text-[#e4e4e7]">
                  {m.text}
                </div>
              )}
            </div>
          ))}

          {isTypingReply && (
            <div className="max-w-[680px] mx-auto text-[12px] text-[#8e8e96] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3ecf8e]" />
              <span>{currentAgent ? currentAgent.name : 'Atlas'} is writing a response…</span>
            </div>
          )}
        </div>

        {/* Bottom Message Composer Bar */}
        <div className="px-6 pb-3.5 pt-1 shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="max-w-[680px] mx-auto h-10 px-2.5 rounded-xl bg-[#222226] border border-white/[0.08] flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setOpenAttachment('launch-plan.md')}
              title="Attach or view files"
              className="w-6 h-6 rounded-md text-[#8e8e96] hover:text-white flex items-center justify-center shrink-0"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Message ${currentAgent ? currentAgent.name : '#launch'}`}
              className="flex-1 bg-transparent text-[13px] text-white placeholder-[#7c7c85] focus:outline-none"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setInputValue("Can we double check Friday's newsletter timing?")}
                title="Insert sample prompt"
                className="w-6 h-6 rounded-md text-[#8e8e96] hover:text-white flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
                </svg>
              </button>
              {/* Context window ring */}
              <div title="Context window: 48% used" className="w-4 h-4 flex items-center justify-center">
                <svg viewBox="0 0 20 20" className="w-4 h-4 -rotate-90">
                  <circle cx="10" cy="10" r="7" fill="none" stroke="#3f3f46" strokeWidth="2.2" />
                  <circle
                    cx="10"
                    cy="10"
                    r="7"
                    fill="none"
                    stroke="#a1a1aa"
                    strokeWidth="2.2"
                    strokeDasharray="44"
                    strokeDashoffset="22"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {/* Send button */}
              <button
                type="submit"
                title="Send message"
                className="w-6 h-6 rounded-full bg-[#3ecf8e] hover:bg-[#34b87c] text-[#052e16] flex items-center justify-center transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Attachment Preview Side Drawer */}
        {openAttachment && ATTACHMENT_CONTENT[openAttachment] && (
          <div className="absolute inset-y-0 right-0 w-[320px] bg-[#161618] border-l border-white/10 shadow-2xl flex flex-col z-20">
            <div className="h-12 px-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[13px] font-semibold text-white truncate">
                  {ATTACHMENT_CONTENT[openAttachment].title}
                </span>
                <span className="text-[11px] text-[#7c7c85]">
                  {ATTACHMENT_CONTENT[openAttachment].size}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpenAttachment(null)}
                className="w-6 h-6 rounded-md text-[#8e8e96] hover:text-white hover:bg-white/[0.06] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-[#d4d4d8]">
                {ATTACHMENT_CONTENT[openAttachment].content}
              </pre>
            </div>
          </div>
        )}

        {/* Expanded Mermaid Diagram Modal */}
        {expandedDiagram && (
          <div
            onClick={() => setExpandedDiagram(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-30"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[600px] rounded-2xl bg-[#18181b] border border-white/15 p-5 space-y-3 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-white">
                  Friday&apos;s Launch Workflow (Mermaid)
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedDiagram(false)}
                  className="px-2.5 py-1 rounded-md bg-white/10 text-white text-xs hover:bg-white/15"
                >
                  Close
                </button>
              </div>
              <svg viewBox="0 0 540 215" className="w-full h-auto">
                <path
                  d="M 190 36 C 235 36, 245 107, 286 107"
                  fill="none"
                  stroke="#a1a1aa"
                  strokeWidth="1.8"
                />
                <path d="M 190 107 L 286 107" fill="none" stroke="#a1a1aa" strokeWidth="1.8" />
                <path
                  d="M 190 178 C 235 178, 245 107, 286 107"
                  fill="none"
                  stroke="#a1a1aa"
                  strokeWidth="1.8"
                />
                <path d="M 358 107 L 404 107" fill="none" stroke="#a1a1aa" strokeWidth="1.8" />
                <rect x="58" y="12" width="132" height="48" rx="8" fill="#27272a" stroke="#52525b" />
                <text x="124" y="40" fill="#fff" fontSize="12" textAnchor="middle">
                  Scout: market check
                </text>
                <rect x="58" y="83" width="132" height="48" rx="8" fill="#27272a" stroke="#52525b" />
                <text x="124" y="111" fill="#fff" fontSize="12" textAnchor="middle">
                  Forge: launch banner
                </text>
                <rect x="58" y="154" width="132" height="48" rx="8" fill="#27272a" stroke="#52525b" />
                <text x="124" y="182" fill="#fff" fontSize="12" textAnchor="middle">
                  Pulse: post &amp; socials
                </text>
                <rect x="292" y="89" width="66" height="36" rx="8" fill="#27272a" stroke="#a46cf5" />
                <text x="325" y="111" fill="#fff" fontSize="12" textAnchor="middle">
                  Atlas
                </text>
                <circle cx="452" cy="107" r="42" fill="#27272a" stroke="#3ecf8e" />
                <text x="452" y="111" fill="#fff" fontSize="12" textAnchor="middle">
                  Friday 10:00
                </text>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
