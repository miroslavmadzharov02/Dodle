document.addEventListener('DOMContentLoaded', function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const eventId = urlParams.get('eventId');

    function fetchVotingResults(meetingId) {
        fetch(`/api/results/${meetingId}`)
            .then(response => response.json())
            .then(data => {
                renderResults(data);
            })
            .catch(error => console.error('Error fetching voting results:', error));
    }

    function renderResults(data) {
        data.sort((a, b) => b.votes_count - a.votes_count);
        const resultsContainer = document.getElementById('app');
        resultsContainer.innerHTML = '';

        data.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';

            const timeSpan = document.createElement('span');
            timeSpan.textContent = `${slot.date} ${slot.start_time}`;
            slotElement.appendChild(timeSpan);

            const votesSpan = document.createElement('span');
            votesSpan.className = 'votes';
            votesSpan.textContent = `${slot.votes_count} votes`;
            slotElement.appendChild(votesSpan);

            resultsContainer.appendChild(slotElement);
        });
    }

    function parseUrlEventId() {
        if (!eventId) return null;

        return fetch(`/api/verify-link?eventId=${eventId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return null;
                }
                return data.meeting_id;
            })
            .catch(error => {
                console.error('Error verifying event link:', error);
                return null;
            });
    }

    parseUrlEventId().then(meetingId => {
        if (meetingId) {
            fetchVotingResults(meetingId);
        }
    });
});
