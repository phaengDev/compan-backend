
const mysql = require('mysql2');
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'insurance_info'
// });
const connection = mysql.createConnection({
    host: '45.77.241.213',
    user: 'root',
    password: 'plc@2023*.com',
    database: 'info'
});
const autoId = (table, fields, callback) => {
    const maxId = new Date().getFullYear() + '001';
    // const maxId = '10001';
    connection.query(`SELECT MAX(${fields}) + 1 AS maxid FROM ${table}`, (err, results, fields) => {
        if (err) {
            console.error('Error selecting data:', err);
            return callback(err, null);
        }
        let generatedId = maxId; 
        if (results.length > 0 && results[0].maxid !== null) {
            generatedId = results[0].maxid.toString();
        }
        callback(null, generatedId);
    });
};

const insertData = (table, fields, data, callback) => {
    const placeholders = new Array(data.length).fill('?').join(', ');
    const query = `INSERT INTO ${table} (${fields}) VALUES (${placeholders})`;
    connection.query(query, data, (err, results, fields) => {
        if (err) {
            console.error('Error inserting data:', err);
            return callback(err, null);
        }
        callback(null, results);
    });
};

const updateData = (table, field, data, condition, callback) => {
    const placeholders = new Array(data.length).fill('?').join(', ');
    const setFields = field.split(',').map(field => `${field} = ?`).join(', ');
    const query = `UPDATE ${table} SET ${setFields} WHERE ${condition}`;
    connection.query(query, data, (err, results) => {
        if (err) {
            console.error('Error updating data:', err);
            return callback(err, null);
        }
        callback(null, results);
    });
};

// const updateData = (table,filed, where, callback) => {
//     connection.query(`UPDATE ${table} SET ${filed} WHERE ${where}`, (err, results) => {
//         if (err) {
//             console.error('Error update data:', err);
//             return callback(err, null);
//         }
//         callback(null, results);
//     });
// };

const deleteData = (table, where, callback) => {
    connection.query(`DELETE FROM ${table} WHERE ${where}`, (err, results) => {
        if (err) {
            console.error('Error delete data:', err);
            return callback(err, null);
        }
        callback(null, results);
    });
};

const selectAll = (table, callback) => {
    connection.query(`SELECT * FROM ${table}`, (err, results, fields) => {
        if (err) {
            console.error('Error selecting data:', err);
            return callback(err, null);
        }
        callback(null, results);
    });
};
const selectAllwhere = (table,where, callback) => {
    connection.query(`SELECT * FROM ${table} WHERE ${where}`, (err, results, fields) => {
        if (err) {
            console.error('Error selecting data:', err);
            return callback(err, null);
        }
        callback(null, results);
    });
};

const selectData = (table, fields, callback) => {
    connection.query(`SELECT ${fields} FROM ${table}`, (err, results) => {
        if (err) {
            console.error('Error selecting data:', err);
            return callback(err, null);
        }
        callback(null, results);
    });
};

const selectWhere = (table, fields, where,  callback) => {
    connection.query(`SELECT ${fields} FROM ${table} WHERE ${where}`, (err, results) => {
        if (err) {
            console.error('Error selecting data:', err);
            return callback(err, null);
        }
        callback(null, results);
    });
};
const fetchSingleAll = (table, where,  callback) => {
    connection.query(`SELECT * FROM ${table} WHERE ${where}`, (err, results, fields) => {
        if (err) {
            console.error('Error selecting data:', err);
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};

const fetchSingle = (table, fields, where,  callback) => {
    const query = `SELECT ${fields} FROM ${table} WHERE ${where} LIMIT 1`;
    connection.query(query, (err, results) => {
    // connection.query(`SELECT ${fields} FROM ${table} WHERE ${where}`, (err, results, fields) => {
        if (err) {
            console.error('Error selecting data:', err);
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};


module.exports = {
    autoId,
    insertData,
    updateData,
    deleteData,
    selectAll,
    selectAllwhere,
    selectData,
    selectWhere,
    fetchSingleAll,
    fetchSingle
};
