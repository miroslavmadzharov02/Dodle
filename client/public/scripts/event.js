document.addEventListener("DOMContentLoaded", function ()
{
    var createAccountButton = document.querySelector('.header');

    createAccountButton.addEventListener('click', function ()
    {
        window.location.href = 'profile.html';
    });
});