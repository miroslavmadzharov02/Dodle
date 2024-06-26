function parseUrlEventId() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('eventId'); 
}

document.addEventListener('DOMContentLoaded', function() {
    const meetingId = parseUrlEventId();
    fetchMeetingDates(meetingId);
   
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElement = document.getElementById('currentMonth');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const submitButton = document.getElementById('submitBtn');
    const userNameInput = document.getElementById('userName');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');

    let selectedSlots = [];
    let selectedMonth;
    let selectedYear;
    let predeterminedDates = [];

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    function getDatesInRange(startDate, endDate) {
        const dates = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    }

    function fetchMeetingDates(meetingId) {
        fetch(`/api/meeting-dates/${meetingId}`)
            .then(response => response.json())
            .then(data => {
                const { start_date, end_date, start_range, end_range } = data;
                const startDate = new Date(start_date);
                const endDate = new Date(end_date);
                predeterminedDates = getDatesInRange(startDate, endDate);
                const today = new Date();
                selectedYear = today.getFullYear();
                selectedMonth = today.getMonth();
                generateCalendar(selectedYear, selectedMonth);
                generateTimeSlots(start_range, end_range);
            })
            .catch(error => console.error('Error fetching meeting dates:', error));
    }

    function generateCalendar(year, month) {
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

            if (predeterminedDates.some(d => d.getTime() === date.getTime())) {
                cell.classList.add('predetermined-date');
                cell.addEventListener('click', () => showTimeSlots(i));
            } else {
                cell.classList.add('disabled-date');
            }
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

    function generateTimeSlots(startRange, endRange) {
        const timeSlotsContainer = document.getElementById('timeSlots');
        timeSlotsContainer.innerHTML = '';
    
        const header = document.createElement('h2');
        header.textContent = `Available Time Slots`;
        timeSlotsContainer.appendChild(header);
    
        const slotsDiv = document.createElement('div');
        slotsDiv.className = 'slots-container';
    
        const selectedSlots = [];
    
        for (let i = startRange; i < endRange; i++) {
            const timeSlot = `${i}:00`;
            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';
    
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = timeSlot;
            checkbox.id = `slot-${timeSlot.replace(/\s/g, '')}`;
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selectedSlots.push(timeSlot);
                } else {
                    const index = selectedSlots.indexOf(timeSlot);
                    if (index !== -1) {
                        selectedSlots.splice(index, 1);
                    }
                }
            });
            slotElement.appendChild(checkbox);
    
            const label = document.createElement('label');
            label.textContent = timeSlot;
            label.htmlFor = `slot-${timeSlot.replace(/\s/g, '')}`;
            slotElement.appendChild(label);
    
            slotsDiv.appendChild(slotElement);
        }
    
        timeSlotsContainer.appendChild(slotsDiv);
    
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.addEventListener('click', () => submitRequest(selectedSlots));
        timeSlotsContainer.appendChild(submitButton);
    }

    function submitRequest() {
        const userName = userNameInput.value.trim();
        if (!userName) {
            alert('Please enter your name.');
            return;
        }

        if (selectedSlots.length === 0) {
            alert('Please select at least one time slot.');
            return;
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
});
