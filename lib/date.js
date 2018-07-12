const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

export default class ExamDbDate extends Date {
    clone() {
        const date = this;
        return new ExamDbDate(date);
    }

    examDbShortDateString() {
        const date = this;
        const dateString = date.toISOString().slice(0, 10);
        return dateString;
    }

    examDbLongDateString() {
        const date = this;
        const dateString = [date.nameOfDayOfWeek(), date.getDate(), date.nameOfMonth()].join(' ');
        return dateString;
    }

    nameOfDayOfWeek() {
        const date = this;
        const dayOfWeek = date.getDay();
        return dayNames[dayOfWeek];
    }

    nameOfMonth() {
        const date = this;
        const month = date.getMonth();
        return monthNames[month];
    }

    thisDayLastWeek() {
        const date = this.clone();
        date.setDate(this.getDate() - 7);
        return date;
    }

    thisDayNextWeek() {
        const date = this.clone();
        date.setDate(this.getDate() + 7);
        return date;
    }
}
