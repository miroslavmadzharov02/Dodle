document.addEventListener("DOMContentLoaded", function() {
    var createAccountButton = document.querySelector('.header');

    userId = localStorage.getItem('user_id');
    userId = -1;

    createAccountButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
});