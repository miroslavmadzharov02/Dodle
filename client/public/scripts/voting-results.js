"use strict";
const data = [
    {
        date: "2024-05-14",
        slots: [
            { time: "09:00", votes: 5, voters: ["Alice", "Bob", "Charlie", "David", "Eve"] },
            { time: "11:00", votes: 3, voters: ["Alice", "Bob", "Charlie"] },
            { time: "14:00", votes: 7, voters: ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace"] }
        ]
    },
    {
        date: "2024-05-15",
        slots: [
            { time: "10:00", votes: 4, voters: ["Alice", "Bob", "Charlie", "David"] },
            { time: "12:00", votes: 6, voters: ["Alice", "Bob", "Charlie", "David", "Eve", "Frank"] },
            { time: "16:00", votes: 2, voters: ["Alice", "Bob"] }
        ]
    },
    {
        date: "2024-05-16",
        slots: [
            { time: "09:00", votes: 3, voters: ["Alice", "Bob", "Charlie"] },
            { time: "13:00", votes: 8, voters: ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Hank"] },
            { time: "15:00", votes: 5, voters: ["Alice", "Bob", "Charlie", "David", "Eve"] }
        ]
    }
];
let currentIndex = 0;
function renderTimeSlots(slots) {
    slots.sort((a, b) => b.votes - a.votes);
    return slots.map(slot => `<div class="time-slot">
            <span>${slot.time}</span>
            <span class="votes" title="${slot.voters.join(', ')}">${slot.votes} votes</span>
            <div class="tooltip">${slot.voters.join(', ')}</div>
        </div>`).join('');
}
function render() {
    const { date, slots } = data[currentIndex];
    document.getElementById('selectedDate').innerText = date;
    document.getElementById('app').innerHTML = renderTimeSlots(slots);
}
document.getElementById('prevDay').addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        render();
    }
});
document.getElementById('nextDay').addEventListener('click', () => {
    if (currentIndex < data.length - 1) {
        currentIndex++;
        render();
    }
});
render();
//# sourceMappingURL=app.js.map