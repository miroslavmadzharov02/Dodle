document.addEventListener("DOMContentLoaded", function ()
{
    var createAccountButton = document.querySelector('.create-account-wrapper button');

    createAccountButton.addEventListener('click', function ()
    {
        window.location.href = './register.html';
    });
});

document.addEventListener('DOMContentLoaded', function ()
{
    const validCredentials = [
        { email: 'user@gmail.com', password: 'user' }
    ];

    const loginEmailInput = document.querySelector('.login-email');
    const loginPasswordInput = document.querySelector('.login-password');
    const loginErrorSpan = document.querySelector('.register-error');

    document.querySelector('.login-btn').addEventListener('click', function (event)
    {
        event.preventDefault();

        loginEmailInput.classList.remove('invalid-field');
        loginPasswordInput.classList.remove('invalid-field');

        const enteredEmail = loginEmailInput.value;
        const enteredPassword = loginPasswordInput.value;

        const foundUser = validCredentials.find(cred => cred.email === enteredEmail);

        const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enteredEmail);

        if (!isValidEmailFormat)
        {
            loginEmailInput.classList.add('invalid-field');
            loginErrorSpan.textContent = 'Invalid email format';
        }
        else if (!foundUser)
        {
            loginEmailInput.classList.add('invalid-field');
            loginPasswordInput.classList.add('invalid-field');
            loginErrorSpan.textContent = 'There is no registered user with that email';
        }
        else if (foundUser && foundUser.password !== enteredPassword)
        {
            loginPasswordInput.classList.add('invalid-field');
            loginErrorSpan.textContent = 'Wrong password';
        }
        else if (foundUser && foundUser.password === enteredPassword)
        {
            window.location.href = './profile.html';
        }
    });
});