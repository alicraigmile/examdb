import { describe, it } from 'mocha';
import { expect } from 'chai';
import { isDDMMYYYY, isISODate, isYYYYMMDD, reverseDate, toISODate } from '../../src/helpers';

describe('isDDMMYYYY', () => {
    it('20/12/2019 => true', () => {
        const date = '20/12/2019';
        const result = isDDMMYYYY(date);
        return expect(result).to.be.true;
    });
    it('2019/12/20 => false', () => {
        const date = '2019/12/20';
        const result = isDDMMYYYY(date);
        return expect(result).to.be.false;
    });
});

describe('isISODate', () => {
    it('2019-12-20 => true', () => {
        const date = '2019-12-20';
        const result = isISODate(date);
        return expect(result).to.be.true;
    });
    it('2019/12/20 => false', () => {
        const date = '2019/12/20';
        const result = isISODate(date);
        return expect(result).to.be.false;
    });
});

describe('isYYYYMMDD', () => {
    it('2019/12/20 => true', () => {
        const date = '2019/12/20';
        const result = isYYYYMMDD(date);
        return expect(result).to.be.true;
    });
    it('20/12/2019 => false', () => {
        const date = '20/12/2019';
        const result = isYYYYMMDD(date);
        return expect(result).to.be.false;
    });
});

describe('reverseDate', () => {
    it('20/12/2019 => 2019/12/20', () => {
        const date = '20/12/2019';
        const reversed = reverseDate(date);
        return expect(reversed).to.be.equal('2019/12/20');
    });
});

describe('toISODate', () => {
    it('2019/12/20 => 2019-12-20', () => {
        const date = '2019/12/20';
        const newDate = toISODate(date);
        return expect(newDate).to.be.equal('2019-12-20');
    });
    it('20/12/2019 => 2019-12-20', () => {
        const date = '20/12/2019';
        const newDate = toISODate(date);
        return expect(newDate).to.be.equal('2019-12-20');
    });
});

/*
export const throwError = (code, errorMessage) => () => {
    const error = Error(); // debug
    error.code = code;
    error.message = errorMessage;
    throw error;
};

export const throwIf = (fn, code, errorMessage) => result => {
    if (fn(result)) {
        return throwError(code, errorMessage)();
    }
    return result;
};

export const catchError = (error, fn) => {
    const canCatch = e => e instanceof Error && e.code;
    if (canCatch(error)) {
        fn();
    } else {
        throw error;
    }
};
*/
