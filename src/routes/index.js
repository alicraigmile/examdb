import { Router } from 'express';

import courses from './courses';
import datasets from './datasets';
import examboards from './examboards';
import exams from './exams';
import hello from './hello';
import homepage from './homepage';
import pathways from './pathways';
import programmesofstudy from './programmesofstudy';
import qualifications from './qualifications';
import search from './search';
import status from './status';
import teapot from './teapot';
import upload from './upload';

const rootRouter = new Router({ mergeParams: true });
[
    courses,
    datasets,
    examboards,
    upload, // upload appears before exams please
    exams,
    hello,
    homepage,
    pathways,
    programmesofstudy,
    qualifications,
    search,
    status,
    teapot
].forEach(router => rootRouter.use(router));

export default rootRouter;
