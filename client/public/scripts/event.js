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
    const eventStartHourInput = document.querySelectorAll('.event-hour')[0];
    const eventEndHourInput = document.querySelectorAll('.event-hour')[1];
    const eventErrorSpan = document.querySelector('.event-error');

    // Get the current user's ID from local storage
    const userId = localStorage.getItem('user_id');

    eventForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const title = eventTitleInput.value.trim();
        const description = eventDescriptionInput.value.trim();
        const startDate = eventStartDateInput.value;
        const endDate = eventEndDateInput.value;
        const startHour = eventStartHourInput.value;
        const endHour = eventEndHourInput.value;

        if (!title || !description || !startDate || !endDate || !startHour || !endHour) {
            eventErrorSpan.textContent = 'Please fill in all fields.';
            return;
        }

        const startDateTime = new Date(startDate);
        startDateTime.setHours(startHour, 0, 0, 0);

        const endDateTime = new Date(endDate);
        endDateTime.setHours(endHour, 0, 0, 0);

        if (startDateTime >= endDateTime) {
            eventErrorSpan.textContent = 'End date and time must be later than start date and time.';
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
                    start_date: startDateTime.toISOString(),
                    end_date: endDateTime.toISOString(),
                    start_range: startHour,
                    end_range: endHour,
                    organizer_id: userId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create event');
            }

            window.location.href = '/created-events.html';
        } catch (error) {
            console.error('Error creating event:', error);
            eventErrorSpan.textContent = error.message || 'Failed to create event';
        }
    });
});
