document.addEventListener('DOMContentLoaded', function() {
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

    // Predetermined dates
    const predeterminedStartDate = new Date(2024, 4, 1); // May 1, 2024
    const predeterminedEndDate = new Date(2024, 4, 20);  // May 20, 2024
    const predeterminedDates = getDatesInRange(predeterminedStartDate, predeterminedEndDate);

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
    
        // Add empty cells for days before the first day of the month
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
                // Add empty cells to fill the row if it's the last row
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
    
    function showTimeSlots(day) {
        selectedDay = day;
        timeSlotsContainer.innerHTML = '';

        // Dummy data
        const availableTimeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM'];

        const header = document.createElement('h2');
        header.textContent = `Available Time Slots for ${monthNames[selectedMonth]} ${selectedDay}`;
        timeSlotsContainer.appendChild(header);

        availableTimeSlots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.classList.add('time-slot');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = slot;
            checkbox.id = `slot-${slot.replace(/\s/g, '')}`;
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selectedSlots.push(slot);
                } else {
                    const index = selectedSlots.indexOf(slot);
                    if (index !== -1) {
                        selectedSlots.splice(index, 1);
                    }
                }
            });
            slotElement.appendChild(checkbox);

            const label = document.createElement('label');
            label.textContent = slot;
            label.htmlFor = `slot-${slot.replace(/\s/g, '')}`; // Link label with checkbox
            slotElement.appendChild(label);

            timeSlotsContainer.appendChild(slotElement);
        });

        // Add submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.addEventListener('click', submitRequest);
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

    const today = new Date();
    selectedYear = today.getFullYear();
    selectedMonth = today.getMonth();
    generateCalendar(selectedYear, selectedMonth);
});