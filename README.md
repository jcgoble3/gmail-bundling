# Email Bundling for Gmail™

Work-in-progress Web extension for Firefox and Chrome that brings back the email bundling from Google's discontinued Inbox.

## History and Credit

This is a fork of https://github.com/boukestam/inbox-in-gmail by boukestam and russelldc.
Their extension was aimed at restoring as much of the old Inbox look-and-feel as possible in addition to functionality.

While I appreciate their work, I don't particularly care for the Inbox look and feel, especially the lack of a dark mode (since I often work in dimly lit rooms).
In reality, the only reason I ever used Inbox in the first place was the ability to bundle emails.
Other than that, I actually prefer the normal Gmail interface over the Inbox interface.

Hence, I set out on this project to strip out the unnecessary cosmetic bloat and produce an slimmer extension that does only one thing: bundling.
On my first editing session, I stripped out over 1,300 unnecessary lines of CSS -- a reduction of over 80% in the CSS file.
The next step is to tackle the JavaScript.

## Installing

Currently this is an incomplete work in progress and likely contains multiple bugs. As such, installing is not recommended at this time.

## License

MIT License

## The content below here is the remains of the README from the original extension I forked. I'm keeping it around as I may make use of some of it.

--------------------------------------

## Features

- Bundle emails by label and category
- Group emails by date (today, yesterday, this month, etc)
- Display emails sent to yourself with subject "Reminder" as reminders
- Calendar events displayed in a small card, with inline responses


## Extension Options

![options popup screenshot](https://github.com/boukestam/inbox-in-gmail/blob/master/screenshots/options%20v0.4.8-2.png?raw=true)

Click the extension's icon at the top right of your browser to adjust the behavior of some features:

#### Reminders
This option is used to determine how to treat emails sent to yourself.

- All are treated as reminders.
- Only emails with a subject containing the word "reminder" are treated as reminders.
- Leave the emails as they are. (Disable)

#### Email Bundling
This option is used to bundle emails by label in the inbox.

- Toggle Enable/Disable

#### Email Avatars
This option will show a circle with the first letter initial of the sender, to the left of the email in your folder.
- Toggle Enable/Disable


## Recommended Gmail™ Settings

Using these settings will more closely replicate the visual style of Inbox:

- Settings/Inbox/Categories -> Leave only Primary ticked
- Settings/Inbox/Inbox Type -> Default or Starred First
- Settings/Advanced/Multiple Inbox -> Disabled
- Settings/Advanced/Preview Pane -> Disabled
- Settings/General/Maximum Page Size -> Show 100 conversations per page
- Settings/General/Personal level indicators -> No indicators
- Settings/Inbox/Importance markers -> No markers


## Email Bundling Tips

Disable inbox category tabs:
- Settings Dropdown/Configure Inbox -> Leave only Primary ticked -> Save

Allow default category labels (Promotions, Social, Updates, Forums) to be bundled:
- Settings/Labels/Categories/Show in message List -> Click show for each category

If you'd like a specific label not to be bundled, create a label called 'Unbundled', and nest that label within it.


## Known Issues

- This extension works best in English, because it relies on specific date formats.
- This currently only supports Gmail™'s default theme. If you enable the Dark theme, you will experience white/invisible text and icons.


## Privacy

- This extension does not make any external network requests.
- This extension does not use any analytics platforms.
- The code is open source, ready for you to audit.

In other words, you are not being tracked, and your data is not leaving the page to be processed or stored anywhere else. This extension just sits as a layer on top of Gmail™, modifying the style and behavior of the page.
