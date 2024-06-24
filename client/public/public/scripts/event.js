document.addEventListener("DOMContentLoaded", function() {
    var createAccountButton = document.querySelector('.header');

    createAccountButton.addEventListener('click', function() {
        window.location.href = 'profile.html';
    });

    const eventForm = document.querySelector('.event-form');
    const eventTitleInput = document.querySelector('.event-title');
    const eventDescriptionInput = document.querySelector('.event-description');
    const eventStartDateInput = document.querySelectorAll('.event-date-time')[0];
    const eventEndDateInput = document.querySelectorAll('.event-date-time')[1];
    const eventErrorSpan = document.querySelector('.event-error');

    // Get the current user's ID from local storage
    const userId = localStorage.getItem('user_id');

    eventForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const title = eventTitleInput.value.trim();
        const description = eventDescriptionInput.value.trim();
        const startDate = eventStartDateInput.value;
        const endDate = eventEndDateInput.value;

        if (!title || !description || !startDate || !endDate) {
            eventErrorSpan.textContent = 'Please fill in all fields.';
            return;
        }

        try {
            const response = await fetch('/api/create-meeting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    description,
                    start_date: startDate,
                    end_date: endDate,
                    organizer_id: userId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create event');
            }

            alert('Event created successfully');
            window.location.href = '/created-events.html';
        } catch (error) {
            console.error('Error creating event:', error);
            eventErrorSpan.textContent = error.message || 'Failed to create event';
        }
    });
});
