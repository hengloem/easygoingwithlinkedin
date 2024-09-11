'use strict';

// Handle installation event
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color: '#3aa757' }, () => {
    console.log('The color is green.');
  });

  // Set rules for showing the action button on specific pages
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostEquals: 'developer.chrome.com', schemes: ['https'] }
        })
      ],
      actions: [new chrome.declarativeContent.ShowAction()]
    }]);
  });
});

// Handle click event for action button
chrome.action.onClicked.addListener(async () => {
  const res = await is_user_signed_in();
  let return_session = false; // Declare this variable outside if necessary

  if (res.userStatus) {
    if (return_session) {
      chrome.windows.create({
        url: './popup-welcome-back.html',
        width: 300,
        height: 600,
        focused: true
      });
      return_session = false;
    } else {
      chrome.windows.create({
        url: './popup-sign-out.html',
        width: 300,
        height: 600,
        focused: true
      });
    }
  } else {
    chrome.windows.create({
      url: './popup-sign-in.html',
      width: 300,
      height: 600,
      focused: true
    });
  }
});

// Function to handle user sign-in and sign-out
async function flip_user_status(signIn, user_info) {
  if (signIn) {
    const res = await fetch('http://localhost:3000/login', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(`${user_info.email}:${user_info.pass}`)
      }
    });

    if (res.status !== 200) return 'fail';

    const saveResult = await chrome.storage.local.set({ userStatus: signIn, user_info });
    if (chrome.runtime.lastError) return 'fail';

    return 'success';
  } else {
    const response = await chrome.storage.local.get(['userStatus', 'user_info']);
    if (response.userStatus === undefined) return 'fail';

    const res = await fetch('http://localhost:3000/logout', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(`${response.user_info.email}:${response.user_info.pass}`)
      }
    });

    if (res.status !== 200) return 'fail';

    await chrome.storage.local.set({ userStatus: signIn, user_info: {} });
    if (chrome.runtime.lastError) return 'fail';

    return 'success';
  }
}

// Function to check if user is signed in
function is_user_signed_in() {
  return new Promise(resolve => {
    chrome.storage.local.get(['userStatus', 'user_info'], (response) => {
      if (chrome.runtime.lastError) {
        resolve({ userStatus: false, user_info: {} });
      } else {
        resolve({
          userStatus: response.userStatus ?? false,
          user_info: response.user_info ?? {}
        });
      }
    });
  });
}

// Listen for messages to log in or log out the user
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'login') {
    flip_user_status(true, request.payload).then(sendResponse).catch(console.log);
    return true;
  } else if (request.message === 'logout') {
    flip_user_status(false, null).then(sendResponse).catch(console.log);
    return true;
  }
});
