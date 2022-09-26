# Email Bundling for Gmail™

Web extension for Firefox and Chrome that brings back the email bundling from Google's discontinued Inbox.

## Features

- Bundle emails by label and category
- That's it.

## Recommended Gmail™ Settings

Using these settings will allow bundling to work best:

- Settings/Inbox/Categories -> Leave only Primary ticked
- Settings/Inbox/Inbox Type -> Default
- Settings/General/Maximum Page Size -> Show 100 conversations per page
- Settings/Advanced/Multiple Inbox -> Disabled

Optional: The default category labels (Promotions, Social, Updates, Forums) can be bundled:

- Settings/Labels/Categories/Show in message List -> Click show for each category

If you'd like a specific label not to be bundled, create a label called "Unbundled", and nest that label within it.

## History and Credit

This is a fork of https://github.com/boukestam/inbox-in-gmail by boukestam and russelldc.
Their extension was aimed at restoring as much of the old Inbox look-and-feel as possible in addition to functionality.

While I appreciate their work, I don't particularly care for the Inbox look and feel,
especially the lack of a dark mode since I often work in less than bright light and at night.
In reality, the only reason I ever used Inbox in the first place was the ability to bundle emails.
I actually prefer the normal Gmail™ interface over the Inbox interface,
but bundling was powerful enough to make me use Inbox until well past its bitter end.

(After Inbox was officially discontinued on April 2, 2019,
I actually kept an Inbox tab open on my computer until mid-May,
even disabling Windows updates to avoid losing it to a reboot,
and only closed it once boukestam and russelldc had implemented bundling by label.
I also used an old version of the Inbox Android app without the hidden remote kill switch
until Google finally disabled the APIs it used in June 2019.)

Hence, I set out on this project to strip out the unnecessary cosmetic bloat
and produce an slimmer extension that only does bundling and nothing else.
I also want it to work in Gmail™'s native interface as well as with any theme.
On my first editing session, I stripped out over 1,300 unnecessary lines of CSS
-- a reduction of over 80% in the CSS file.
Significant progress has been made on the JavaScript as well,
and the extension is almost ready for use if I ever stop being lazy and finish it.

## Installing

This is a work in progress and is not yet available on the official extension stores.
However, beta versions for Firefox only are available in the Releases section here.

## License

MIT License

## Privacy

- This extension does not make any external network requests.
- This extension does not use any analytics platforms.
- The code is open source, ready for you to audit.

In other words, you are not being tracked,
and your data is not leaving the page to be processed or stored anywhere else.
This extension just sits as a layer on top of Gmail™,
modifying the style and behavior of the page.

<!--
## Extension Options

![options popup screenshot](https://github.com/boukestam/inbox-in-gmail/blob/master/screenshots/options%20v0.4.8-2.png?raw=true)

Click the extension's icon at the top right of your browser to adjust the behavior of some features:

### Email Bundling
This option is used to bundle emails by label in the inbox.

- Toggle Enable/Disable
-->
