// Select elements once for better performance
const button = document.querySelector('button');
const div = document.querySelector('div');

// Button hover effect
button.addEventListener('mouseover', () => {
    button.style.backgroundColor = 'black';
    button.style.color = 'white';
    button.style.transform = 'scale(1.3)';
    div.style.backgroundColor = '#ee2f64';
});

button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#f5c2e0';
    button.style.color = 'black';
    button.style.transform = 'scale(1)';
    div.style.backgroundColor = '#fcee54';
});

// Handle logout and provide feedback
button.addEventListener('click', () => {
    // Display loading feedback during logout process
    button.textContent = 'Logging out...';
    button.disabled = true;

    chrome.runtime.sendMessage({ message: 'logout' }, function (response) {
        if (response === 'success') {
            window.location.replace('./popup-sign-in.html');
        } else {
            // Handle failure and restore button state
            button.textContent = 'Sign Out';
            button.disabled = false;
            alert('Logout failed. Please try again.');
        }
    });
});
