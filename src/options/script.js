//const REMINDER_TREATMENT_SELECTOR = 'input[name=reminder-treatment]';
const BUNDLED_EMAIL_SELECTOR = 'input[name=email-bundling]';

function saveOptions() {
	//const reminderTreatment = getSelectedRadioValue(REMINDER_TREATMENT_SELECTOR);
	const emailBundling = getSelectedRadioValue(BUNDLED_EMAIL_SELECTOR);

	//const options = { reminderTreatment, emailBundling };
	const options = { emailBundling };

	localStorage.setItem('options', JSON.stringify(options));
}

function restoreOptions() {
	chrome.runtime.sendMessage({ method: 'getOptions' }, function(options) {
		//selectRadioWithValue(REMINDER_TREATMENT_SELECTOR, options.reminderTreatment);
		selectRadioWithValue(BUNDLED_EMAIL_SELECTOR, options.emailBundling);
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
//document.querySelectorAll(REMINDER_TREATMENT_SELECTOR).forEach(monitorChange);
document.querySelectorAll(BUNDLED_EMAIL_SELECTOR).forEach(monitorChange);
