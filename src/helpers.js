
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

const ddmmyyyy = /^\d{2}\/\d{2}\/\d{4}$/;
export const isDDMMYYYY = (date) => date.match(ddmmyyyy);
// 20/12/2019 => true

const yyyymmdd = /^\d{4}\/\d{2}\/\d{2}$/;
export const isYYYYMMDD = (date) => date.match(yyyymmdd);
// 2019/12/20 => true

export const reverseDate = (date) => date.split('/').reverse().join('-');
// 20/12/2019 => 2019-12-20

export const toISODate = (date) => {
    let isoDate;
    if (date.match(ddmmyyyy)) {
        isoDate = reverseDate(date);
    } else {
        isoDate = date;
    }
    isoDate = date.replace(/\//, '-');
    return isoDate;
}