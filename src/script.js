//const REMINDER_EMAIL_CLASS = 'reminder';
const BUNDLE_PAGE_CLASS = 'bundle-page';
const BUNDLE_WRAPPER_CLASS = 'bundle-wrapper';
const UNREAD_BUNDLE_CLASS = 'contains-unread';
const BUNDLED_EMAIL_CLASS = 'bundled-email';
const BUNDLING_OPTION_CLASS = 'email-bundling-enabled';
const UNBUNDLED_SUFFIX = '$';
const UNBUNDLED_EMAIL_CLASS = 'unbundled-email';
const STYLE_NODE_ID_PREFIX = 'hide-email-';

let lastEmailCount = 0;
let loadedMenu = false;
let labelStats = {};
let hiddenEmailIds = [];
let options = {};

let navigationInterval = null;

/* remove element */
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
};

const getEmailParticipants = function (email) {
    return email.querySelectorAll('.yW span[email]');
};

const getBundledLabels = function () {
    return Array.from(document.querySelectorAll('[role=main] .bundle-wrapper')).reduce((bundledLabels, el) => {
        bundledLabels[el.attributes.bundleLabel.value] = true;
        return bundledLabels;
    }, {});
};

const reloadOptions = () => {
    chrome.runtime.sendMessage({ method: 'getOptions' }, function (ops) {
        options = ops;
    });

    // Add option classes to body for css styling, and unbundle emails when disabled
    if (options.emailBundling === 'enabled' && !document.body.classList.contains(BUNDLING_OPTION_CLASS)) {
        document.body.classList.add(BUNDLING_OPTION_CLASS);
    } else if (options.emailBundling === 'disabled' && document.body.classList.contains(BUNDLING_OPTION_CLASS)) {
        document.body.classList.remove(BUNDLING_OPTION_CLASS);
        // Unbundle emails
        document.querySelectorAll('.' + BUNDLED_EMAIL_CLASS).forEach(emailEl => {
            emailEl.classList.remove(BUNDLED_EMAIL_CLASS);
            removeStyleNodeWithEmailId(emailEl.id);;
        });
        // Remove bundle wrapper rows
        document.querySelectorAll('.' + BUNDLE_WRAPPER_CLASS).forEach(bundleEl => bundleEl.remove());
    }

    // Turn navigation on or off
    if (options.navigation === 'enabled' && navigationInterval === null) {
        navigationInterval = setInterval(linkButtons, 250);
    } else if (options.navigation === 'disabled' && navigationInterval !== null) {
        clearInterval(navigationInterval);
        navigationInterval = null;
    }
};

const getLabels = function (email) {
    return Array.from(email.querySelectorAll('.ar .at')).map(el => el.attributes.title.value);
};

const getTabs = () => Array.from(document.querySelectorAll('.aKz')).map(el => el.innerText);

const htmlToElements = function (html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstElementChild;
};

const addClassToEmail = (emailEl, klass) => emailEl.classList.add(klass);

const addClassToBundle = (label, klass) => {
    const bundle = document.querySelector(`div[bundleLabel="${label}"]`);
    if (bundle && !(bundle.classList.contains(klass))) bundle.classList.add(klass);
};

const removeClassFromBundle = (label, klass) => {
    const bundle = document.querySelector(`div[bundleLabel="${label}"]`);
    if (bundle && (bundle.classList.contains(klass))) bundle.classList.remove(klass);
};

const addCountToBundle = (label, count) => {
    const bundleLabel = document.querySelector(`div[bundleLabel="${label}"] .label-link`);
    if (!bundleLabel) return;
    const replacementHTML = `<span>${label}</span><span class="bundle-count">(${count})</span>`;
    if (bundleLabel.innerHTML !== replacementHTML) bundleLabel.innerHTML = replacementHTML;
};

const addSendersToBundle = (label, senders) => {
    const bundleSenders = document.querySelector(`div[bundleLabel="${label}"] .bundle-senders`);
    if (!bundleSenders) return;
    let uniqueSenders = senders.reverse().filter((sender, index, self) => {
        if (self.findIndex(s => s.name === sender.name && s.isUnread === sender.isUnread) === index) {
            if (!sender.isUnread && self.findIndex(s => s.name === sender.name && s.isUnread) >= 0) return false;
            return true;
        };
    });
    const replacementHTML = `${uniqueSenders.map(sender => `<span class="${sender.isUnread ? 'strong' : ''}">${sender.name}</span>`).join(', ')}`
    if (bundleSenders.innerHTML !== replacementHTML) bundleSenders.innerHTML = replacementHTML;
};

const getBundleImageForLabel = (label) => {
    switch (label) {
        case 'Promotions':
            return chrome.runtime.getURL('images/ic_offers_24px_clr_r3_2x.png');
        case 'Finance':
            return chrome.runtime.getURL('images/ic_finance_24px_clr_r3_2x.png');
        case 'Purchases':
        case 'Orders':
            return chrome.runtime.getURL('images/ic_purchases_24px_clr_r3_2x.png');
        case 'Trips':
        case 'Travel':
            return chrome.runtime.getURL('images/ic_travel_clr_24dp_r1_2x.png');
        case 'Updates':
            return chrome.runtime.getURL('images/ic_updates_24px_clr_r3_2x.png');
        case 'Forums':
            return chrome.runtime.getURL('images/ic_forums_24px_clr_r3_2x.png');
        case 'Social':
            return chrome.runtime.getURL('images/ic_social_24px_clr_r3_2x.png');
        default:
            return null;
    }
};

const getBundleTitleColorForLabel = (email, label) => {
    const labelEls = email.querySelectorAll('.at');
    let bundleTitleColor = null;

    labelEls.forEach((labelEl) => {
        if (labelEl.innerText === label) {
            const labelColor = labelEl.style.backgroundColor;
            // Ignore default label color, light gray
            if (labelColor !== 'rgb(221, 221, 221)')
                bundleTitleColor = labelColor;
        }
    });

    return bundleTitleColor;
};

const buildBundleWrapper = function (email, label, hasImportantMarkers) {
    const importantMarkerClass = hasImportantMarkers ? '' : 'hide-important-markers';
    const bundleImage = getBundleImageForLabel(label);
    const bundleTitleColor = !bundleImage && getBundleTitleColorForLabel(email, label);

    // We use inline SVG here for easy recoloring
    const bundleWrapper = htmlToElements(`
        <div class="zA yO" bundleLabel="${label}">
            <span class="oZ-x3 xY aid bundle-image">
                ${bundleImage ? `<img src="${bundleImage}"/>` :
                    `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="28px" height="28px" viewBox="0 0 144 144">
                        <g transform="translate(0,144) scale(0.1,-0.1)" fill="${bundleTitleColor ? `${bundleTitleColor}` : 'rgb(102, 102, 102)'}">
                            <path d="M322 1157 c-12 -13 -22 -35 -22 -50 l0 -27 405 0 c445 0 449 0 480
                                -60 12 -24 15 -79 15 -315 l0 -285 28 0 c17 0 37 10 50 23 22 23 22 28 22 358
                                l0 336 -23 21 c-23 22 -25 22 -478 22 l-456 0 -21 -23z"
                            />
                            <path d="M142 977 c-22 -23 -22 -28 -22 -358 l0 -336 23 -21 c23 -22 25 -22
                                478 -22 l456 0 21 23 c22 23 22 28 22 358 l0 336 -23 21 c-23 22 -25 22 -478
                                22 l-456 0 -21 -23z m217 -142 c25 -19 51 -38 56 -43 6 -4 26 -19 45 -32 19
                                -14 40 -29 46 -35 6 -5 22 -17 34 -25 12 -8 33 -23 47 -33 28 -23 56 -17 98
                                18 73 62 242 182 263 187 28 8 64 -27 60 -57 -3 -20 -128 -121 -258 -209 -36
                                -24 -76 -54 -89 -65 -30 -26 -50 -26 -81 -2 -14 11 -79 59 -145 106 -218 158
                                -221 162 -188 211 20 32 47 27 112 -21z"
                            />
                        </g>
                    </svg>`
                }
            </span>
            <span class="WA xY ${importantMarkerClass}"></span>
            <span class="yX xY label-link .yW" ${bundleTitleColor ? `style="color: ${bundleTitleColor}"` : ''}>${label}</span>
            <span class="a4W xY">
                <span class="bundle-senders"></span>
            </span>
        </div>
    `);

    addClassToEmail(bundleWrapper, BUNDLE_WRAPPER_CLASS);

    bundleWrapper.onclick = () => location.href = `#search/in%3Ainbox+label%3A"${encodeURIComponent(label)}"`;

    if (email && email.parentNode) email.parentElement.insertBefore(bundleWrapper, email);
};

const isInInbox = () => document.location.hash.match(/#inbox/g) !== null;

const getBundleName = () => {
    const match = document.location.hash.match(/#search\/in(?:%3A|:)inbox\+label(?:%3A|:)%22(.+?)%22$/);
    if (!match) {
        return null;
    }
    bundleName = match[1].replace('+', ' ');
    return decodeURIComponent(bundleName);
}

const checkImportantMarkers = () => document.querySelector('td.WA.xY');

const checkEmailUnbundledLabel = labels => labels.filter(label => label.indexOf(UNBUNDLED_SUFFIX) < 0).length == 0;

const getReadStatus = emailEl => emailEl.className.indexOf('zE') < 0;

const isStarred = email => {
    const node = email.querySelector('.T-KT-JX');
    return (node && getComputedStyle(node).display !== 'none');
};

/**
 * @return boolean true if email contains class
 */
const checkEmailClass = (emailEl, klass) => emailEl.classList.contains(klass);

const addClassToBody = (klass) => {
    if (!document.body.classList.contains(klass)) document.body.classList.add(klass);
};

const removeClassFromBody = (klass) => {
    if (document.body.classList.contains(klass)) document.body.classList.remove(klass);
};

const removeStyleNodeWithEmailId = (id) => {
    if (document.getElementById(STYLE_NODE_ID_PREFIX + id)) {
        hiddenEmailIds.splice(hiddenEmailIds.indexOf(id), 1);
        document.getElementById(STYLE_NODE_ID_PREFIX + id).remove();
    }
}

const createStyleNodeWithEmailId = (id) => {
    hiddenEmailIds.push(id);

    const style = document.createElement('style');
    document.head.appendChild(style);
    style.id = STYLE_NODE_ID_PREFIX + id;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(`.nH.ar4.z [id="${id}"] { display: none; }`));
};

const getEmails = () => {
    const emails = document.querySelectorAll('[role=main] .zA');
    const isInInboxFlag = isInInbox();
    const bundleName = getBundleName();
    const processedEmails = [];
    const allLabels = new Set();
    const tabs = getTabs();

    let currentTab = tabs.length && document.querySelector('.aAy[aria-selected="true"]');
    labelStats = {};

    bundleName ? addClassToBody(BUNDLE_PAGE_CLASS) : removeClassFromBody(BUNDLE_PAGE_CLASS);

    // Start from last email on page and head towards first
    for (let i = emails.length - 1; i >= 0; i--) {
        let email = emails[i];
        let info = {};
        info.emailEl = email;
        info.isStarred = isStarred(email);
        info.labels = getLabels(email);
        info.labels.forEach(l => allLabels.add(l));

        info.unbundledAlreadyProcessed = () => checkEmailClass(email, UNBUNDLED_EMAIL_CLASS);
        // Check for Unbundled parent label, mark row as unbundled
        info.isUnbundled = checkEmailUnbundledLabel(info.labels);
        if ((isInInboxFlag || bundleName) && info.isUnbundled && !info.unbundledAlreadyProcessed()) {
            addClassToEmail(email, UNBUNDLED_EMAIL_CLASS);
        }
        info.emailEl.querySelectorAll('.ar.as').forEach(labelEl => {
            if (labelEl.querySelector('.at').title.indexOf(UNBUNDLED_SUFFIX) >= 0) {
                // Remove '$' from display in the UI
                labelEl.querySelector('.av').innerText = labelEl.innerText.replace(UNBUNDLED_SUFFIX, '');
            }
        });

        // Check for labels used for Tabs, and hide them from the row.
        if ( false != currentTab ) {
            info.emailEl.querySelectorAll('.ar.as').forEach(labelEl => {
                if ( labelEl.innerText == currentTab.innerText ) {
                    // Remove Tabbed labels from the row.
                    labelEl.hidden = true;
                }
            });
        }

        // Hide label inside its own bundle display
        if (bundleName) {
            info.emailEl.querySelectorAll('.ar.as').forEach(labelEl => {
                if (labelEl.querySelector(`.at[title="${bundleName}"], .at[title="Inbox"]`)) {
                    labelEl.hidden = true;
                }
            });
        } else {
            info.emailEl.querySelectorAll('.ar.as').forEach(labelEl => {
                labelEl.hidden = false;
            });
        }

        info.isUnread = !getReadStatus(email);

        // Collect senders, message count and unread stats for each label
        if (info.labels.length) {
            const participants = Array.from(getEmailParticipants(email));
            let participant = null;
            for (let i = 0; i < participants.length; i++) {
                participant = participants[i];
                if (checkEmailClass(participant, 'zF')) {
                    break;
                }
            }
            const displayParticipant = participant.getAttribute('name');
            info.labels.forEach(label => {
                if (!(label in labelStats)) {
                    labelStats[label] = {
                        title: label,
                        count: 1,
                        senders: [{
                            name: displayParticipant,
                            isUnread: info.isUnread
                        }]
                    };
                } else {
                    labelStats[label].count++;
                    labelStats[label].senders.push({
                        name: displayParticipant,
                        isUnread: info.isUnread
                    });
                }
                if (info.isUnread) labelStats[label].containsUnread = true;
            });
        }

        info.subjectEl = email.querySelector('.y6');
        info.subject = info.subjectEl && info.subjectEl.innerText.trim();

        info.isBundleEmail = () => checkEmailClass(email, BUNDLED_EMAIL_CLASS);
        info.isBundleWrapper = () => checkEmailClass(email, BUNDLE_WRAPPER_CLASS);
        info.bundleAlreadyProcessed = () => checkEmailClass(email, BUNDLED_EMAIL_CLASS) || checkEmailClass(email, BUNDLE_WRAPPER_CLASS);

        processedEmails[i] = info;
    }

    // Update bundle stats
    for (label in labelStats) {
        // Set message count for each bundle row
        addCountToBundle(label, labelStats[label].count);
        // Set list of senders for each bundle row
        addSendersToBundle(label, labelStats[label].senders);
        // Set bold title class for any bundle containing an unread email
        labelStats[label].containsUnread ? addClassToBundle(label, UNREAD_BUNDLE_CLASS) : removeClassFromBundle(label, UNREAD_BUNDLE_CLASS);
        if (labelStats[label].containsUnread) {
            addClassToBundle(label, 'zE');
            addClassToBundle(label, UNREAD_BUNDLE_CLASS);
        } else {
            removeClassFromBundle(label, 'zE');
            removeClassFromBundle(label, UNREAD_BUNDLE_CLASS);
        }
    }

    return [processedEmails, allLabels];
};

const updateBundles = () => {
    reloadOptions();
    const [emails, allLabels] = getEmails();
    //const myEmail = getMyEmailAddress();
    let isInInboxFlag = isInInbox();
    let hasImportantMarkers = checkImportantMarkers();
    let tabs = getTabs();

    const emailBundles = getBundledLabels();

    for (const emailInfo of emails) {
        const emailEl = emailInfo.emailEl;

        if (options.emailBundling === 'enabled') {
            // Remove bundles that no longer have associated emails
            if (emailInfo.isBundleWrapper() && !allLabels.has(emailEl.getAttribute('bundleLabel'))) {
                emailEl.remove();
                continue;
            }

            const labels = emailInfo.labels.filter(x => !tabs.includes(x));
            if (isInInboxFlag && !emailInfo.isStarred && labels.length && !emailInfo.isUnbundled && !emailInfo.bundleAlreadyProcessed()) {
                labels.forEach(label => {
                    addClassToEmail(emailEl, BUNDLED_EMAIL_CLASS);
                    // Insert style node to avoid bundled emails appearing briefly in inbox during redraw
                    if (!hiddenEmailIds.includes(emailEl.id)) createStyleNodeWithEmailId(emailEl.id);

                    if (!(label in emailBundles) && label.indexOf(UNBUNDLED_SUFFIX) < 0) {
                        buildBundleWrapper(emailEl, label, hasImportantMarkers);
                        emailBundles[label] = true;
                    }
                });
            } else if (!emailInfo.isUnbundled && !labels.length && hiddenEmailIds.includes(emailEl.id)) {
                removeStyleNodeWithEmailId(emailEl.id);
            } else if (emailInfo.isStarred && hiddenEmailIds.includes(emailEl.id)) {
                removeStyleNodeWithEmailId(emailEl.id);
            }
        }
    }
};

const triggerMouseEvent = function (node, event) {
    const mouseEvent = document.createEvent('MouseEvents');
    mouseEvent.initEvent(event, true, true);
    node.dispatchEvent(mouseEvent);
};

const linkButtons = function () {
    archiveButton = document.querySelector('.iH .lR');
    if (!archiveButton) return;
    backButton = document.querySelector('.iH .lS');
    if (!backButton) return;
    archiveButton.onclick = () => {
        triggerMouseEvent(backButton, "mousedown");
        triggerMouseEvent(backButton, "mouseup");
        // check if bundle empty
        waitForElement('.TB', element => document.querySelector('.aHS-bnt').click(), 25);
    }
    deleteButton = document.querySelector('.iH .nX');
    if (!deleteButton) return;
    deleteButton.onclick = () => waitForElement('.TB', element => document.querySelector('.aHS-bnt').click(), 25);
}

const waitForElement = function (selector, callback, tries = 100) {
    const element = document.querySelector(selector);
    if (element) callback(element);
    else if (tries > 0) setTimeout(() => waitForElement(selector, callback, tries - 1), 100);
};

document.addEventListener('DOMContentLoaded', function () {
    setInterval(updateBundles, 250);
});
