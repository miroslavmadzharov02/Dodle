document.addEventListener("DOMContentLoaded", function ()
{
    var createAccountButton = document.querySelector('.header');

    createAccountButton.addEventListener('click', function ()
    {
        window.location.href = './profile.html';
    });
});
 
 /*document.addEventListener('DOMContentLoaded', () =>
{
    const eventsList = document.querySelector('.events-list');
    const eventsError = document.querySelector('.events-error');

    // Simulating fetching events data from a server
    const fetchEvents = async () =>
    {
        try
        {
            // Replace this with an actual API call to fetch events for the current user
            const response = await fetch('/api/created-events');
            const events = await response.json();

            if (events.length > 0)
            {
                events.forEach(event =>
                {
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
                    eventDateTime.textContent = new Date(event.dateTime).toLocaleString();

                    eventItem.appendChild(eventTitle);
                    eventItem.appendChild(eventDescription);
                    eventItem.appendChild(eventDateTime);

                    eventsList.appendChild(eventItem);
                });
            } else
            {
                eventsError.textContent = 'No events found.';
            }
        } catch (error)
        {
            eventsError.textContent = 'Failed to fetch events.';
        }
    };

    fetchEvents();
});*/