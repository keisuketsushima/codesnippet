const q = document.querySelector('input[name="q"]');
const items = document.querySelectorAll('#keywords > option');

window.addEventListener('message', (e) => {
  if (e.data === 'focus') {
    document.querySelector('input[name="q"]').focus();
  }
});

/**
 * Checks the search field and submit the value to the parent window if the user
 * chose one of the predefined items.
 * @param {!Event} event 
 */
function processSearchField(event) {
  if (event.key !== 'Enter' || event.repeat) return;
  const item = Array.from(items).find((option) => option.value === q.value);
  if (!item) return;
  chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, {code: item.textContent});
  });
}

q.addEventListener('keydown', processSearchField);