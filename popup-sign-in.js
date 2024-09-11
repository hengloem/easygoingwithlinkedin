document.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();

    const email = document.querySelector('#email').value.trim();
    const pass = document.querySelector('#password').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && pass) {
        if (!emailRegex.test(email)) {
            document.querySelector('#email').placeholder = "Enter a valid email.";
            document.querySelector('#email').style.backgroundColor = 'red';
            return;
        }

        // Send message to background script with email and password
        chrome.runtime.sendMessage({ message: 'login', payload: { email, pass }
        }, function (response) {
            if (response === 'success')
                window.location.replace('./popup-sign-out.html');
            else {
                // Handle login failure (e.g., wrong credentials)
                alert('Login failed. Please check your credentials.');
            }
        });
    } else {
        if (!email) {
            document.querySelector('#email').placeholder = "Enter an email.";
            document.querySelector('#email').style.backgroundColor = 'red';
            document.querySelector('#email').classList.add('white_placeholder');
        }

        if (!pass) {
            document.querySelector('#password').placeholder = "Enter a password.";
            document.querySelector('#password').style.backgroundColor = 'red';
            document.querySelector('#password').classList.add('white_placeholder');
        }
    }
});
