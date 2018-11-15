/* eslint-disable no-console */
import db from '../models';

const onSync = () => console.log('Completed database setup.');
const onError = error => console.log(`Database setup failed - ${error.code} - ${error.message}.`);

db.sequelize.sync().then(onSync, onError);
