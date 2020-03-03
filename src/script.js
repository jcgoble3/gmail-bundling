const REMINDER_EMAIL_CLASS = 'reminder';
const BUNDLE_PAGE_CLASS = 'bundle-page';
const BUNDLE_WRAPPER_CLASS = 'bundle-wrapper';
const UNREAD_BUNDLE_CLASS = 'contains-unread';
const BUNDLED_EMAIL_CLASS = 'bundled-email';
const BUNDLING_OPTION_CLASS = 'email-bundling-enabled';
const UNBUNDLED_PARENT_LABEL = 'Unbundled';
const UNBUNDLED_EMAIL_CLASS = 'unbundled-email';
const STYLE_NODE_ID_PREFIX = 'hide-email-';

let lastEmailCount = 0;
let lastRefresh = new Date();
let loadedMenu = false;
let labelStats = {};
let hiddenEmailIds = [];
let options = {};

/* remove element */
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
};

const getMyEmailAddress = () => {
    if (document.querySelector('.gb_hb').innerText) return document.querySelector('.gb_hb').innerText;
    if (document.querySelector('.gb_lb').innerText) return document.querySelector('.gb_lb').innerText;
    if (document.querySelector('.gb_qb').innerText) return document.querySelector('.gb_qb').innerText;
    return '';
}

const getEmailParticipants = function (email) {
    return email.querySelectorAll('.yW span[email]');
};

const isReminder = function (email, myEmailAddress) {
    // if user doesn't want reminders treated special, then just return as though current email is not a reminder
    if (options.reminderTreatment === 'none') return false;

    const nameNodes = getEmailParticipants(email);
    let allNamesMe = true;

    if (nameNodes.length === 0) allNamesMe = false;

    for (const nameNode of nameNodes) {
        if (nameNode.getAttribute('email') !== myEmailAddress) allNamesMe = false;
    }

    if (options.reminderTreatment === 'all') {
        return allNamesMe;
    } else if (options.reminderTreatment === 'containing-word') {
        const titleNode = email.querySelector('.y6');
        return allNamesMe && titleNode && titleNode.innerText.match(/reminder/i);
    }

    return false;
};

const getRawDate = function (email) {
    const dateElement = email.querySelector('.xW.xY span');
    if (dateElement) return dateElement.getAttribute('title');
};

const getDate = function (rawDate) {
    if (rawDate) return new Date(rawDate);
};

const getBundledLabels = function () {
    return Array.from(document.querySelectorAll('.BltHke[role=main] .bundle-wrapper')).reduce((bundledLabels, el) => {
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
        document.querySelectorAll('.' + BUNDLED_EMAIL_CLASS).forEach(emailEl => emailEl.classList.remove(BUNDLED_EMAIL_CLASS));
        // Remove bundle wrapper rows
        document.querySelectorAll('.' + BUNDLE_WRAPPER_CLASS).forEach(bundleEl => bundleEl.remove());
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
    for (let i = 0; i < senders.length; i++) {
        if (senders[i].isUnread) {
            document.querySelector(`div[bundleLabel="${label}"]`).classList.add('zE');
            break;
        }
    }
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
            return chrome.runtime.getURL('images/ic_custom-cluster_24px_g60_r3_2x.png');
    }
};

const getBundleTitleColorForLabel = (email, label) => {
    const labelEls = email.querySelectorAll('.at');
    let bundleTitleColor = null;

    labelEls.forEach((labelEl) => {
        if (labelEl.innerText === label) {
            const labelColor = labelEl.style.backgroundColor;
            // Ignore default label color, light gray
            //if (labelColor !== 'rgb(221, 221, 221)')
                bundleTitleColor = labelColor;
        }
    });

    return bundleTitleColor;
};

const buildBundleWrapper = function (email, label, hasImportantMarkers) {
    const importantMarkerClass = hasImportantMarkers ? '' : 'hide-important-markers';
    const bundleImage = getBundleImageForLabel(label);
    const bundleTitleColor = bundleImage.match(/custom-cluster/) && getBundleTitleColorForLabel(email, label);

    const bundleWrapper = htmlToElements(`
            <div class="zA yO" bundleLabel="${label}">
                <span class="oZ-x3 xY aid bundle-image">
                    <img src="${bundleImage}" ${bundleTitleColor ? `style="filter: drop-shadow(0 0 0 ${bundleTitleColor}) saturate(300%)"` : ''}/>
                </span>
                <span class="WA xY ${importantMarkerClass}"></span>
                <span class="yX xY label-link .yW" ${bundleTitleColor ? `style="color: ${bundleTitleColor}"` : ''}>${label}</span>
                <span class="a4W xY">
                    <span title="${getRawDate(email)}"/>
                </span>
                <div class="y2 bundle-senders"></div>
            </div>
    `);

    addClassToEmail(bundleWrapper, BUNDLE_WRAPPER_CLASS);

    bundleWrapper.onclick = () => location.href = `#search/in%3Ainbox+label%3A${fixLabel(label)}`;

    if (email && email.parentNode) email.parentElement.insertBefore(bundleWrapper, email);
};

const fixLabel = label => encodeURIComponent(label.replace(/[\/\\& ]/g, '-'));

const isInInbox = () => document.querySelector('.nZ a[title=Inbox]') !== null;

const isInBundle = () => document.location.hash.match(/#search\/in%3Ainbox\+label%3A/g) !== null;

const checkImportantMarkers = () => document.querySelector('td.WA.xY');

const checkEmailUnbundledLabel = labels => labels.filter(label => label.indexOf(UNBUNDLED_PARENT_LABEL) >= 0).length > 0;

const getReadStatus = emailEl => emailEl.className.indexOf('zE') < 0;

/**
 * If email has snooze data, return true.
 * Expects that the curDate should be larger than prevDate, if not, then also return true;
 */
const isSnoozed = (email, curDate, prevDate) => {
    const node = email.querySelector('.by1.cL');
    if (node && node.innerText !== '') return true;

    return prevDate !== null && curDate < prevDate;
};

const isStarred = email => {
    const node = email.querySelector('.T-KT');
    if (node && node.title !== 'Not starred') return true;
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
    const emails = document.querySelectorAll('.BltHke[role=main] .zA');
    const myEmailAddress = getMyEmailAddress();
    const isInInboxFlag = isInInbox();
    const isInBundleFlag = isInBundle();
    const processedEmails = [];
    const allLabels = new Set();
    const tabs = getTabs();

    let currentTab = tabs.length && document.querySelector('.aAy[aria-selected="true"]');
    let prevTimeStamp = null;
    labelStats = {};

    isInBundleFlag ? addClassToBody(BUNDLE_PAGE_CLASS) : removeClassFromBody(BUNDLE_PAGE_CLASS);

    // Start from last email on page and head towards first
    for (let i = emails.length - 1; i >= 0; i--) {
        let email = emails[i];
        let info = {};
        info.emailEl = email;
        info.isReminder = isReminder(email, myEmailAddress);
        info.reminderAlreadyProcessed = () => checkEmailClass(email, REMINDER_EMAIL_CLASS);
        info.dateString = getRawDate(email);
        info.date = getDate(info.dateString);
        info.isSnooze = isSnoozed(email, info.date, prevTimeStamp);
        info.isStarred = isStarred(email);
        // Only update prevTimeStamp if not snoozed, because we might have multiple snoozes back to back
        if (!info.isSnooze && info.date) prevTimeStamp = info.date;
        info.labels = getLabels(email);
        info.labels.forEach(l => allLabels.add(l));

        info.unbundledAlreadyProcessed = () => checkEmailClass(email, UNBUNDLED_EMAIL_CLASS);
        // Check for Unbundled parent label, mark row as unbundled
        info.isUnbundled = checkEmailUnbundledLabel(info.labels);
        if ((isInInboxFlag || isInBundleFlag) && info.isUnbundled && !info.unbundledAlreadyProcessed()) {
            addClassToEmail(email, UNBUNDLED_EMAIL_CLASS);
            info.emailEl.querySelectorAll('.ar.as').forEach(labelEl => {
                if (labelEl.querySelector('.at').title.indexOf(UNBUNDLED_PARENT_LABEL) >= 0) {
                    // Remove 'Unbundled/' from display in the UI
                    labelEl.querySelector('.av').innerText = labelEl.innerText.replace(UNBUNDLED_PARENT_LABEL + '/', '');
                } else {
                    // Hide labels that aren't nested under UNBUNDLED_PARENT_LABEL
                    labelEl.hidden = true;
                }
            });
        }

        // Check for labels used for Tabs, and hide them from the row.
        if ( false != currentTab ) {
            info.emailEl.querySelectorAll('.ar.as').forEach(labelEl => {
                if ( labelEl.innerText == currentTab.innerText ) {
                    // Remove Tabbed labels from the row.
                    labelEl.hidden = true;
                }
            });
        }

        info.isUnread = !getReadStatus(email);

        // Collect senders, message count and unread stats for each label
        if (info.labels.length) {
            const participants = Array.from(getEmailParticipants(email));
            const firstParticipant = participants[0].getAttribute('name');
            info.labels.forEach(label => {
                if (!(label in labelStats)) {
                    labelStats[label] = {
                        title: label,
                        count: 1,
                        senders: [{
                            name: firstParticipant,
                            isUnread: info.isUnread
                        }]
                    };
                } else {
                    labelStats[label].count++;
                    labelStats[label].senders.push({
                        name: firstParticipant,
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
    }

    return [processedEmails, allLabels];
};

const updateReminders = () => {
    reloadOptions();
    const [emails, allLabels] = getEmails();
    const myEmail = getMyEmailAddress();
    let isInInboxFlag = isInInbox();
    let hasImportantMarkers = checkImportantMarkers();
    let tabs = getTabs();

    const emailBundles = getBundledLabels();

    for (const emailInfo of emails) {
        const emailEl = emailInfo.emailEl;

        if (emailInfo.isReminder && !emailInfo.reminderAlreadyProcessed()) { // skip if already added class
            if (emailInfo.subject.toLowerCase() === 'reminder') {
                emailInfo.subjectEl.outerHTML = '';
                emailEl.querySelectorAll('.Zt').forEach(node => node.outerHTML = '');
            }
            emailEl.querySelectorAll('.yP,.zF').forEach(node => { node.innerHTML = 'Reminder';});

            addClassToEmail(emailEl, REMINDER_EMAIL_CLASS);
        }

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

                    if (!(label in emailBundles)) {
                        buildBundleWrapper(emailEl, label, hasImportantMarkers);
                        emailBundles[label] = true;
                    }
                });
            } else if (!emailInfo.isUnbundled && !labels.length && hiddenEmailIds.includes(emailEl.id)) {
                removeStyleNodeWithEmailId(emailEl.id);
            }
        }
    }
};

/*
**
**START OF LEFT MENU
**
*/

const menuNodes = {};
const setupMenuNodes = () => {
  const observer = new MutationObserver(() => {
    // menu items
    [
      { label: 'inbox',     selector: '.aHS-bnt' },
      { label: 'snoozed',   selector: '.aHS-bu1' },
      { label: 'done',      selector: '.aHS-aHO' },
      { label: 'drafts',    selector: '.aHS-bnq' },
      { label: 'sent',      selector: '.aHS-bnu' },
      { label: 'spam',      selector: '.aHS-bnv' },
      { label: 'trash',     selector: '.aHS-bnx' },
      { label: 'starred',   selector: '.aHS-bnw' },
      { label: 'important', selector: '.aHS-bns' },
      { label: 'chats',     selector: '.aHS-aHP' },
    ].map(({ label, selector }) => {
      const node = queryParentSelector(document.querySelector(selector), '.aim');
      if (node) menuNodes[label] = node;
    });
  });
  observer.observe(document.body, { subtree: true, childList: true });
};

const reorderMenuItems = () => {
  const observer = new MutationObserver(() => {
    const parent = document.querySelector('.wT .byl');
    const refer = document.querySelector('.wT .byl>.TK');
    const { inbox, snoozed, done, drafts, sent, spam, trash, starred, important, chats } = menuNodes;

    if (parent && refer && loadedMenu && inbox && snoozed && done && drafts && sent && spam && trash && starred && important && chats) {
      // Gmail will execute its script to add element to the first child, so
      // add one placeholder for it and do the rest in the next child.
      const placeholder = document.createElement('div');
      placeholder.classList.add('TK');
      placeholder.style.cssText = 'padding: 0; border: 0;';

      // Assign link href which only show archived mail
      done.querySelector('a').href = '#archive';

      // Remove id attribute from done element for preventing event override from Gmail
      done.firstChild.removeAttribute('id');

      // Manually add on-click event to done elment
      done.addEventListener('click', () => window.location.assign('#archive'));

      // Rewrite text from All Mail to Done
      done.querySelector('a').innerText = 'Done';

      const newNode = document.createElement('div');
      newNode.classList.add('TK');
      newNode.appendChild(inbox);
      newNode.appendChild(snoozed);
      newNode.appendChild(done);
      parent.insertBefore(placeholder, refer);
      parent.insertBefore(newNode, refer);

      setupClickEventForNodes([inbox, snoozed, done, drafts, sent, spam, trash, starred, important, chats]);

      // Close More menu
      document.body.querySelector('.J-Ke.n4.ah9').click();
      observer.disconnect();
    }

    if (!loadedMenu && inbox) {
      // Open More menu
      document.body.querySelector('.J-Ke.n4.ah9').click();
      loadedMenu = true;
    }
  });
  observer.observe(document.body, { subtree: true, childList: true });
};

const activateMenuItem = (target, nodes) => {
  nodes.map(node => node.firstChild.classList.remove('nZ'));
  target.firstChild.classList.add('nZ');
};

const setupClickEventForNodes = (nodes) => {
  nodes.map(node =>
    node.addEventListener('click', () =>
      activateMenuItem(node, nodes)
    )
  );
};

const queryParentSelector = (elm, sel) => {
  if (!elm) return null;
  var parent = elm.parentElement;
  while (!parent.matches(sel)) {
    parent = parent.parentElement;
    if (!parent) return null;
  }
  return parent;
};

/*
**
**END OF LEFT MENU
**
*/

const triggerMouseEvent = function (node, event) {
    const mouseUpEvent = document.createEvent('MouseEvents');
    mouseUpEvent.initEvent(event, true, true);
    node.dispatchEvent(mouseUpEvent);
};

const waitForElement = function (selector, callback, tries = 100) {
    const element = document.querySelector(selector);
    if (element) callback(element);
    else if (tries > 0) setTimeout(() => waitForElement(selector, callback, tries - 1), 100);
};

document.addEventListener('DOMContentLoaded', function () {
    setInterval(updateReminders, 250);
});

const init = () => {
    setupMenuNodes();
    reorderMenuItems();
};

if (document.head) init();
else document.addEventListener('DOMContentLoaded', init);
