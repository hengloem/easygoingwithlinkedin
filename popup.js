'use strict';

let changeColor = document.getElementById('changeColor');

// Retrieve the saved color from chrome storage and set the button's background color
chrome.storage.sync.get('color', function (data) {
  if (data.color) {
    changeColor.style.backgroundColor = data.color;
    changeColor.setAttribute('value', data.color);
  }
});

// When the button is clicked, change the background color of the active tab
changeColor.onclick = function (element) {
  let color = element.target.value;

  // Change the background color of the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      { code: 'document.body.style.backgroundColor = "' + color + '";' }
    );
  });
};
