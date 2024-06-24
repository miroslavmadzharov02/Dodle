document.addEventListener("DOMContentLoaded", function() {
    var createAccountButton = document.querySelector('.header');

    createAccountButton.addEventListener('click', function() {
        window.location.href = 'profile.html';
    });

    const eventsList = document.querySelector('.events-list');
    const eventsError = document.querySelector('.events-error');

    // Get the current user's ID from local storage
    const userId = localStorage.getItem('user_id');

    const fetchEvents = async () => {
        try {
            const response = await fetch(`/api/created-events?user_id=${userId}`);
            const events = await response.json();

            if (events.length > 0) {
                events.forEach(event => {
                    const eventItem = document.createElement('div');
                    eventItem.classList.add('event-item');

                    const eventTitle = document.createElement('div');
                    eventTitle.classList.add('event-title');
                    eventTitle.textContent = event.title;

                    const eventDescription = document.createElement('div');
                    eventDescription.classList.add('event-description');
                    eventDescription.textContent = event.description;

                    const eventDateTime = document.createElement('div');
                    eventDateTime.classList.add('event-date-time');
                    eventDateTime.textContent = `${new Date(event.start_date).toLocaleDateString()} - ${new Date(event.end_date).toLocaleDateString()}`;

                    eventItem.appendChild(eventTitle);
                    eventItem.appendChild(eventDescription);
                    eventItem.appendChild(eventDateTime);

                    eventsList.appendChild(eventItem);
                });
            } else {
                eventsError.textContent = 'No events found.';
            }
        } catch (error) {
            eventsError.textContent = 'Failed to fetch events.';
        }
    };

    fetchEvents();
});
