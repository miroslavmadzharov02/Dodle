document.addEventListener('DOMContentLoaded', function() {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElement = document.getElementById('currentMonth');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const submitButton = document.getElementById('submitBtn');
    const userNameInput = document.getElementById('userName');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');

    function parseUrlEventId() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        return urlParams.get('eventId'); 
    }

    let selectedSlots = [];
    let selectedMonth;
    let selectedYear;
    let eventId = parseUrlEventId();  

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    async function generateCalendar(year, month) {
        calendarGrid.innerHTML = '';
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;
        selectedMonth = month;
        selectedYear = year;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = (firstDay.getDay() + 6) % 7;

        const dayRow = document.createElement('div');
        dayRow.classList.add('calendar-row', 'day-row');
        dayNames.forEach(day => {
            const dayCell = document.createElement('div');
            dayCell.textContent = day;
            dayCell.classList.add('day-cell');
            dayRow.appendChild(dayCell);
        });
        calendarGrid.appendChild(dayRow);

        let currentRow = document.createElement('div');
        currentRow.classList.add('calendar-row');

        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-cell', 'disabled-date', 'empty-cell');
            currentRow.appendChild(emptyCell);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dayOfWeek = (date.getDay() + 6) % 7;
            const cell = document.createElement('div');
            cell.textContent = i;
            cell.classList.add('calendar-cell');

            cell.addEventListener('click', () => showTimeSlots(date.toISOString().split('T')[0]));
            currentRow.appendChild(cell);

            if (dayOfWeek === 6 || i === daysInMonth) {
                while (currentRow.children.length < 7) {
                    const emptyCell = document.createElement('div');
                    emptyCell.classList.add('calendar-cell', 'disabled-date', 'empty-cell');
                    currentRow.appendChild(emptyCell);
                }
                calendarGrid.appendChild(currentRow);
                currentRow = document.createElement('div');
                currentRow.classList.add('calendar-row');
            }
        }
    }

    async function showTimeSlots(date) {
        timeSlotsContainer.innerHTML = '';

        try {
            const response = await fetch(`/api/timeslots?meeting_id=${eventId}&date=${date}`);
            const availableTimeSlots = await response.json();

            const header = document.createElement('h2');
            header.textContent = `Available Time Slots for ${monthNames[selectedMonth]} ${date.split('-')[2]}`;
            timeSlotsContainer.appendChild(header);

            availableTimeSlots.forEach(slot => {
                const slotElement = document.createElement('div');
                slotElement.classList.add('time-slot');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = slot.timeslot_id;
                checkbox.id = `slot-${slot.start_time.replace(/\s/g, '')}`;
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        selectedSlots.push(slot.timeslot_id);
                    } else {
                        const index = selectedSlots.indexOf(slot.timeslot_id);
                        if (index !== -1) {
                            selectedSlots.splice(index, 1);
                        }
                    }
                });
                slotElement.appendChild(checkbox);

                const label = document.createElement('label');
                label.textContent = slot.start_time;
                label.htmlFor = `slot-${slot.start_time.replace(/\s/g, '')}`;
                slotElement.appendChild(label);

                timeSlotsContainer.appendChild(slotElement);
            });

            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit';
            submitButton.addEventListener('click', submitRequest);
            timeSlotsContainer.appendChild(submitButton);
        } catch (error) {
            console.error('Error fetching time slots:', error);
        }
    }

    async function submitRequest() {
        const userName = userNameInput.value.trim();
        if (!userName) {
            alert('Please enter your name.');
            return;
        }

        if (selectedSlots.length === 0) {
            alert('Please select at least one time slot.');
            return;
        }

        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userName, selectedSlots })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit vote');
            }

            alert('Vote submitted successfully');
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Failed to submit vote');
        }
    }

    function showPrevMonth() {
        selectedMonth--;
        if (selectedMonth < 0) {
            selectedMonth = 11;
            selectedYear--;
        }
        generateCalendar(selectedYear, selectedMonth);
    }

    function showNextMonth() {
        selectedMonth++;
        if (selectedMonth > 11) {
            selectedMonth = 0;
            selectedYear++;
        }
        generateCalendar(selectedYear, selectedMonth);
    }

    prevMonthBtn.addEventListener('click', showPrevMonth);
    nextMonthBtn.addEventListener('click', showNextMonth);

    const today = new Date();
    selectedYear = today.getFullYear();
    selectedMonth = today.getMonth();
    generateCalendar(selectedYear, selectedMonth);
});
