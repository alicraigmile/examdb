import { describe, it } from 'mocha';
import { expect } from 'chai';
import Record from '../../src/record';

// valid
const sample1 = {
    'Exam board': 'AQA',
    Date: '04/06/2018',
    'Morning/Afternoon': 'Morning',
    Code: '8145/1A to 1E',
    Course: 'History',
    Qualification: 'GCSE',
    Paper: 'History Paper 1 (new) (all options A to E)',
    Notes: 'No dictionaries',
    Duration: '1h 45m',
    POS: 'zj26n39',
    'Exam spec': 'zxjk4j6'
};

// malformed dates
const sample2 = {
    'Exam board': 'AQA',
    Date: '04/06/20~',
    'Morning/Afternoon': 'Morning',
    Code: '8145/1A to 1E',
    Course: 'History',
    Qualification: 'GCSE',
    Paper: 'History Paper 1 (new) (all options A to E)',
    Notes: 'No dictionaries',
    Duration: '1h 45m',
    POS: 'zj26n39',
    'Exam spec': 'zxjk4j6'
};

// malformed time of day
const sample3 = {
    'Exam board': 'AQA',
    Date: '04/06/2018',
    'Morning/Afternoon': 'Morgen',
    Code: '8145/1A to 1E',
    Course: 'History',
    Qualification: 'GCSE',
    Paper: 'History Paper 1 (new) (all options A to E)',
    Notes: 'No dictionaries',
    Duration: '1h 45m',
    POS: 'zj26n39',
    'Exam spec': 'zxjk4j6'
};

describe('Record', () => {
    it('create an blank record', done => {
        const record = new Record();
        expect(record).to.be.an.instanceOf(Record);
        expect(record.examTimeOfDay).to.be.equal('AM');
        return done();
    });
    it('parse a valid record', done => {
        const csvData = sample1;
        const record = new Record(csvData);
        expect(record).to.be.an.instanceOf(Record);
        expect(record.examCode, 'examCode').to.equal('8145/1A to 1E');
        expect(record.courseName, 'courseName').to.equal('History');
        expect(record.examDate, 'examDate').to.equal('2018-06-04');
        expect(record.examBoardName, 'examBoardName').to.equal('AQA');
        expect(record.courseNameLong(), 'courseNameLong').to.equal('GCSE History AQA');
        expect(record.examNotes, 'examNotes').to.equal('No dictionaries');
        expect(record.examPaper, 'examPaper').to.equal('History Paper 1 (new) (all options A to E)');
        expect(record.programmeOfStudyName(), 'programmeOfStudyName').to.equal('GCSE History');
        expect(record.qualificationName, 'qualificationName').to.equal('GCSE');
        expect(record.examTimeOfDay, 'examTimeOfDay').to.equal('AM');
        return done();
    });

    it('malformed dates throw an error', done => {
        const csvData = sample2;
        let record;
        try {
            record = new Record(csvData);
        } catch (err) {
            expect(err).to.be.an('error');
        }
        expect(record).to.be.an('undefined');
        return done();
    });

    it('malformed time of day throws an error', done => {
        const csvData = sample3;
        let record;
        try {
            record = new Record(csvData);
        } catch (err) {
            expect(err).to.be.an('error');
        }
        expect(record).to.be.an('undefined');
        return done();
    });
});
