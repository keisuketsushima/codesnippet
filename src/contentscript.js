/** Key name of CTRL key. */
const CTRL = 'Control';

/**
 * Maximum interval (milliseconds) between CTRL key presses to trigger an event.
 */
const DOUBLE_KEYPRESS_INTERVAL_MILLISEC = 200;

/**
 * The types of <input> that should be excluded from the target of event
 * triggering.
 */
const excludedInputTypes = new Set([
  'hidden', 'checkbox', 'radio', 'file', 'submit', 'image', 'reset', 'button',
]);

/** The timestamp of the last CTRL key press. */
let lastKeyPress = 0;

/** The flag to regulate the event triggering. */
let triggerEvent = true;

/**
 * The <input> or <textarea> element that the user currently focuses on.
 * @type {?Element}
 */
let focusedInputElement = null;

const dialog = document.createElement('dialog');
const iframe = document.createElement('iframe');

/**
 * Installs a <dialog> into the page. The <dialog> will be used to show the
 * search field. At the time of the installation, the <dialog> is invisible.
 */
function installDialog() {
  iframe.src = chrome.runtime.getURL('search.html');
  dialog.appendChild(iframe);
  document.body.appendChild(dialog);
}

/** Shows a dialog to search code snippets. */
function showDialog() {
  dialog.showModal();
  iframe.contentWindow.postMessage(
    'focus', `chrome-extension://${chrome.runtime.id}`);
}

/**
 * Returns true if the element is <textarea> or <input>. If it is an <input>,
 * the following types are out of scope: hidden, checkbox, radio, file, submit,
 * image, reset, and button.
 * @param {!Element} element 
 * @return {boolean}
 */
function isInputOrTextareaElement(element) {
  const tagName = element.tagName;
  if (tagName === 'TEXTAREA') return true;
  if (tagName !== 'INPUT') return false;
  return !excludedInputTypes.has(element.type);
}

/**
 * Handles key events where the user presses Ctrl key twice in a row inside
 * an <input> or <textarea>. If that happens, the search field appears at the
 * center of the page and the user is able to search and inject code snippets.
 * @param {!Event} e 
 */
function handleKeyDownEvent(e) {
  if (e.key !== CTRL || e.repeat || !isInputOrTextareaElement(e.target)) return;
  const now = Date.now();
  if (triggerEvent && now - lastKeyPress <= DOUBLE_KEYPRESS_INTERVAL_MILLISEC) {
    triggerEvent = false;
    focusedInputElement = e.target;
    showDialog();
    triggerEvent = true;
  }
  lastKeyPress = now;
}


/**
 * Injects the code snippet into the focused <input> or <textarea>.
 * @param {string} code 
 */
function injectCodeSnippet(code) {
  const cursor = focusedInputElement.selectionStart;
  // The code is injected at the position of the cursor.
  focusedInputElement.value = [
    focusedInputElement.value.slice(0, cursor),
    code,
    focusedInputElement.value.slice(cursor),
  ].join('');
  dialog.close();
  focusedInputElement.focus();
  // The cursor moves to the end of the injected code.
  const cursorPosition =
      (focusedInputElement.value.slice(0, cursor) + code).length;
  focusedInputElement.selectionEnd = cursorPosition;
}

/** Initializes the content script. */
function init() {
  installDialog();
  document.addEventListener('keydown', handleKeyDownEvent);
  chrome.runtime.onMessage.addListener((request) => {
    injectCodeSnippet(request['code']);
  });
}

init();