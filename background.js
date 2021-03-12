// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ color: '#3aa757' }, function () {
    console.log('The color is green.');
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostEquals: 'developer.chrome.com', schemes: ['https'] },
          css: ["div"]
        })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

let user_signed_in = false;

chrome.browserAction.onClicked.addListener(function () {
  is_user_signed_in()
    .then(res => {
      if (res.userStatus) {
        if (return_session) {
          chrome.windows.create({
            url: './popup-welcome-back.html',
            width: 300,
            height: 600,
            focused: true
          }, function () { return_session = false });
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
    })
    .catch(err => console.log(err));
});

function flip_user_status(signIn, user_info) {
  if (signIn) {
    return fetch('http://localhost:3000/login', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(`${user_info.email}:${user_info.pass}`)
      }
    })
      .then(res => {
        return new Promise(resolve => {
          if (res.status !== 200) resolve('fail')

          chrome.storage.local.set({ userStatus: signIn, user_info }, function (response) {
            if (chrome.runtime.lastError) resolve('fail');

            user_signed_in = signIn;
            resolve('success');
          });
        })
      })
      .catch(err => console.log(err));
  } else if (!signIn) {
    // fetch the localhost:3000/logout route
    return new Promise(resolve => {
      chrome.storage.local.get(['userStatus', 'user_info'], function (response) {
        console.log(response);
        if (chrome.runtime.lastError) resolve('fail');

        if (response.userStatus === undefined) resolve('fail');

        fetch('http://localhost:3000/logout', {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa(`${response.user_info.email}:${response.user_info.pass}`)
          }
        })
          .then(res => {
            console.log(res);
            if (res.status !== 200) resolve('fail');

            chrome.storage.local.set({ userStatus: signIn, user_info: {} }, function (response) {
              if (chrome.runtime.lastError) resolve('fail');

              user_signed_in = signIn;
              resolve('success');
            });
          })
          .catch(err => console.log(err));
      });
    });
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'login') {
    flip_user_status(true, request.payload)
      .then(res => sendResponse(res))
      .catch(err => console.log(err));
    return true;
  } else if (request.message === 'logout') {
    flip_user_status(false, null)
      .then(res => sendResponse(res))
      .catch(err => console.log(err));
    return true;
  } else if (request.message === 'userStatus') {

  }
});


function is_user_signed_in() {
  return new Promise(resolve => {
    chrome.storage.local.get(['userStatus', 'user_info'],
      function (response) {
        if (chrome.runtime.lastError) resolve({
          userStatus:
            false, user_info: {}
        })
        resolve(response.userStatus === undefined ?
          { userStatus: false, user_info: {} } :
          {
            userStatus: response.userStatus, user_info:
              response.user_info
          }
        )
      });
  });
}

// chrome.runtime.sendMessage({ message: 'userStatus' },
//   function (response) {
//     if (response.message === 'success') {
//       document.getElementById('name').innerText = response.user_info;
//     } else if (request.message === 'userStatus') {
//       is_user_signed_in().then(res => {
//         sendResponse({
//           message: 'success',
//           userStatus: res.user_info.email
//         });
//       })
//         .catch(err => console.log(err));
//       return true;
//     }
//   });