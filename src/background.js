chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.method === 'getOptions') {
		const options = JSON.parse(localStorage.getItem('options') || '{}');
		options.navigation = options.navigation || 'disabled';
		options.emailBundling = options.emailBundling || 'enabled';

		sendResponse(options);
	} else sendResponse({});
});
