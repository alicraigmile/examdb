import { toISODate } from './helpers';

const AM = 'AM';
const PM = 'PM';
const DEFAULT_DATE = '1900-01-01';
const DEFAULT_TIME_OF_DAY = AM;

const parseDate = str => {
    try {
        return toISODate(str);
    } catch (err) {
        throw new Error(`Unable to parse Date`);
    }
};

const parseCourse = str => str.replace(/\n/g, ' ');

const parseTimeOfDay = str => {
    if (str.match(/morning/i) || str.match(/AM/i)) {
        return AM;
    }
    if (str.match(/afternoon/i) || str.match(/PM/i)) {
        return PM;
    }
    throw new Error(`Unable to parse Time of Day - '${str}`);
};

class Record {
    constructor(defaults) {
        this.courseName = '';
        this.examBoardName = '';
        this.examCode = '';
        this.examDate = DEFAULT_DATE;
        this.examDuration = '';
        this.examNotes = '';
        this.examPaper = '';
        this.examTimeOfDay = DEFAULT_TIME_OF_DAY;
        this.qualificationName = '';
        if (defaults) {
            this.courseName = parseCourse(defaults.Course);
            this.examBoardName = defaults['Exam board'];
            this.examCode = defaults.Code;
            this.examDate = parseDate(defaults.Date);
            this.examDuration = defaults.Duration;
            this.examNotes = defaults.Notes;
            this.examPaper = defaults.Paper;
            this.examTimeOfDay = parseTimeOfDay(defaults['Morning/Afternoon']);
            this.qualificationName = defaults.Qualification;
        }
    }

    courseNameLong() {
        const { courseName, examBoardName, qualificationName } = this;
        return `${qualificationName} ${courseName} ${examBoardName}`;
    }

    programmeOfStudyName() {
        const { courseName, qualificationName } = this;
        return `${qualificationName} ${courseName}`;
    }
}

export default Record;
