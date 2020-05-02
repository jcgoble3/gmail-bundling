const BUNDLED_EMAIL_SELECTOR = 'input[name=email-bundling]';
const NAVIGATION_SELECTOR = 'input[name=navigation]';

function saveOptions() {
	const navigation = getSelectedRadioValue(NAVIGATION_SELECTOR);
	const emailBundling = 'enabled';

	const options = { navigation, emailBundling };
	console.log(options);

	localStorage.setItem('options', JSON.stringify(options));
}

function restoreOptions() {
	chrome.runtime.sendMessage({ method: 'getOptions' }, function(options) {
		selectRadioWithValue(NAVIGATION_SELECTOR, options.navigation);
	});
}

function selectRadioWithValue(selector, value) {
	document.querySelectorAll(selector).forEach(radioInput => {
		if(radioInput.value === value) radioInput.checked = true;
	});
}

const getSelectedRadioValue = selector => document.querySelector(selector + ':checked').value;

const monitorChange = element => element.addEventListener('click', saveOptions);

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelectorAll('input').forEach(monitorChange);
