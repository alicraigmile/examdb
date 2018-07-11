'use strict';

const MemoryStore = require('./memorystore'),
    _ = require('underscore'),
    Promise = require('bluebird'),
    environment = process.env.NODE_ENV || 'development',    // if something else isn't setting ENV, use development
    db_configuration = require('../knexfile')[environment],    // require environment's settings from knexfile
    db = require('knex')(db_configuration);

class PostgresStore extends MemoryStore {

    constructor() {
        super();
    }

    _all(table,next) {
        return db(table)
            .select()
            .timeout(1000)
            .then(rows => {return next(rows)});
    }

    _where(table,predicate,next) {
        return db(table)
            .where(predicate)
            .select()
            .timeout(1000)
            .then(rows => {return next(rows)});
    }

    _findWhere(table,predicate,next) {
        return db(table)
            .where(predicate)
            .select()
            .timeout(1000)
            .then(rows => {return next(rows)});
    }

    _add(table, object, next) {        
        let predicate = {id:object.id},
            objectExists = this._findWhere(table, predicate),
            insertObject = db(table).insert(object).then(next);

        return objectExists
            .then(next)
            .catch(insertObject);
    }


}


   
module.exports = PostgresStore;
