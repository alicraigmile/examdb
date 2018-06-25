class ExamDbDate extends Date {
    constructor(dateString) {
        if (dateString) {
            return super(dateString);
        } else {
            return super();
        }
    }

    clone() { 
        let date = this;
        return new ExamDbDate(date);
    }

    examDbShortDateString() { 
        let date = this,
        dateString = date.toISOString().slice(0,10);
        return dateString;
    }

    examDbLongDateString() {
        let date = this,
            dateString = [
            date.nameOfDayOfWeek(),
            date.getDate(),
            date.nameOfMonth()
        ].join(' ');
        return dateString;
    }

    nameOfDayOfWeek() {
        let date = this,
            dayOfWeek = date.getDay();    
        return isNaN(dayOfWeek) ? null : dayNames[dayOfWeek];
    }

    nameOfMonth() {
        let date = this,
            month = date.getMonth();    
        return isNaN(month) ? null : monthNames[month];
    }

    thisDayLastWeek() {
        let date = this.clone();
        date.setDate(this.getDate() - 7);
        return date;
    }

    thisDayNextWeek() {
        let date = this.clone();
        date.setDate(this.getDate() + 7);
        return date;
    }

}

module.exports = ExamDbDate;