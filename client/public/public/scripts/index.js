document.addEventListener("DOMContentLoaded", function() {
    var createAccountButton = document.querySelector('.create-account-wrapper button');

    createAccountButton.addEventListener('click', function() {
        window.location.href = './register.html';
    });

    const loginEmailInput = document.querySelector('.login-email');
    const loginPasswordInput = document.querySelector('.login-password');
    const loginErrorSpan = document.querySelector('.register-error');

    document.querySelector('.login-btn').addEventListener('click', async function(event) {
        event.preventDefault();

        loginEmailInput.classList.remove('invalid-field');
        loginPasswordInput.classList.remove('invalid-field');

        const enteredEmail = loginEmailInput.value;
        const enteredPassword = loginPasswordInput.value;

        const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enteredEmail);

        if (!isValidEmailFormat) {
            loginEmailInput.classList.add('invalid-field');
            loginErrorSpan.textContent = 'Invalid email format';
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: enteredEmail, password: enteredPassword })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to login user');
            }

            const responseData = await response.json();
            if (responseData.message === 'Login successful') {
                // Store the user ID in local storage
                localStorage.setItem('user_id', responseData.user_id);
                window.location.href = './profile.html';
            } else {
                loginErrorSpan.textContent = responseData.message || 'Failed to login user';
            }
        } catch (error) {
            console.error(error);
            loginErrorSpan.textContent = error.message || 'Failed to login user';
        }
    });
});
