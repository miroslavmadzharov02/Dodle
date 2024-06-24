document.addEventListener("DOMContentLoaded", function() {
    var createAccountButton = document.querySelector('.header');

    createAccountButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
});

function isStrongPassword(password) {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);
    const hasNumber = /\d/.test(password);
    const isLengthValid = password.length >= 8;

    return hasLowercase && hasUppercase && hasSymbol && hasNumber && isLengthValid;
}

document.addEventListener('DOMContentLoaded', function() {
    const registerEmailInput = document.querySelector('.register-email');
    const registerPasswordInput = document.querySelector('.register-password');
    const registerRepeatPasswordInput = document.querySelector('.repeat-password');
    const registerErrorSpan = document.querySelector('.register-error');

    registerRepeatPasswordInput.addEventListener('input', function() {
        if (registerPasswordInput.value !== registerRepeatPasswordInput.value)
            registerRepeatPasswordInput.classList.add('invalid-field');
        else
            registerRepeatPasswordInput.classList.remove('invalid-field');
    });

    registerErrorSpan.innerHTML = 'Password requires:<br> - One lowercase and uppercase letter<br> - A symbol<br> - A number<br> - Length greater than or equal to 8.<br>';

    document.querySelector('.register-btn').addEventListener('click', async function(event) {
        event.preventDefault();
        const enteredEmail = registerEmailInput.value;
        const enteredPassword = registerPasswordInput.value;
        const repeatPassword = registerRepeatPasswordInput.value;

        const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enteredEmail);

        if (!isValidEmailFormat) {
            registerErrorSpan.textContent = 'Invalid email format';
            return;
        } else if (!isStrongPassword(enteredPassword)) {
            registerErrorSpan.textContent = 'Invalid password format';
            return;
        } else if (enteredPassword !== repeatPassword) {
            registerErrorSpan.textContent = 'Passwords do not match';
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: enteredEmail, password: enteredPassword })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to register user');
            }

            window.location.href = 'index.html';
        } catch (error) {
            console.error(error);
            registerErrorSpan.textContent = error.message || 'Failed to register user';
        }
    });
});
