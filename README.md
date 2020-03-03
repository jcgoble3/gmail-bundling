# Email Bundling for Gmail™

Work-in-progress Web extension for Firefox and Chrome that brings back the email bundling from Google's discontinued Inbox.

## History and Credit

This is a fork of https://github.com/boukestam/inbox-in-gmail by boukestam and russelldc.
Their extension was aimed at restoring as much of the old Inbox look-and-feel as possible in addition to functionality.

While I appreciate their work, I don't particularly care for the Inbox look and feel, especially the lack of a dark mode since I often work in less than bright light and at night.
In reality, the only reason I ever used Inbox in the first place was the ability to bundle emails.
I actually prefer the normal Gmail™ interface over the Inbox interface, but bundling was powerful enough to make me use Inbox until well past its bitter end.
(After Inbox was officially discontinued on April 2, 2019, I actually kept an Inbox tab open on my computer until mid-May, even disabling Windows updates to avoid losing it to a reboot, and only closed it once boukestam and russelldc had implemented bundling by label.
I also used an old version of the Inbox Android app without the hidden remote kill switch until Google finally disabled the APIs it used in June 2019.)

Hence, I set out on this project to strip out the unnecessary cosmetic bloat and produce an slimmer extension that only does bundling and nothing else
I also want it to work in Gmail™'s native interface as well as with any theme.
(Although it isn't related to bundling, I do plan to also keep the functionality that marks emails to yourself as reminders since I use that feature also.)
On my first editing session, I stripped out over 1,300 unnecessary lines of CSS -- a reduction of over 80% in the CSS file.
I am now working on the JavaScript, which is more complex and will take more time.

## Installing

Currently this is an incomplete work in progress and likely contains multiple bugs. As such, installing is not recommended at this time.

## License

MIT License

## The content below here is approximately the remains of the README from the original extension I forked. I'm keeping it around as I may make use of some of it.

--------------------------------------

## Features

- Bundle emails by label and category
- Display emails sent to yourself with subject "Reminder" as reminders


## Extension Options

![options popup screenshot](https://github.com/boukestam/inbox-in-gmail/blob/master/screenshots/options%20v0.4.8-2.png?raw=true)

Click the extension's icon at the top right of your browser to adjust the behavior of some features:

### Reminders
This option is used to determine how to treat emails sent to yourself.

- All are treated as reminders.
- Only emails with a subject containing the word "reminder" are treated as reminders.
- Leave the emails as they are. (Disable)

### Email Bundling
This option is used to bundle emails by label in the inbox.

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


## Privacy

- This extension does not make any external network requests.
- This extension does not use any analytics platforms.
- The code is open source, ready for you to audit.

In other words, you are not being tracked, and your data is not leaving the page to be processed or stored anywhere else. This extension just sits as a layer on top of Gmail™, modifying the style and behavior of the page.
