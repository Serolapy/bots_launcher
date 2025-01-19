/* Действия с главной базой данных системы */

import constants from '../const.js';

/**
 * Создание шаблонных таблиц в БД
 * @param {sqlite3.Database} db Открытая база данных
 */
export async function createTables(db) {
	return new Promise((resolve, reject) => {
		const sql = `
		CREATE TABLE configure (
			name TEXT UNIQUE NOT NULL, 
			value TEXT NOT NULL
		);`;

	  	db.run(sql, [], function(err) {
			if (err) {
		  		reject(err);
			} else {
		  		resolve(this);
			}
	  	});
	});
}

/**
 * Вставка значений в таблицу configure
 * @param {sqlite3.Database} db Открытая база данных
 */
export async function insertConfigure(db, configure) {
	try {
		const insertQuery = `
			INSERT INTO configure (name, value) VALUES (?, ?);
	  	`;
		
		const keys = Object.keys(configure);
		
		// Подготовка запроса
		const stmt = db.prepare(insertQuery);
		
		// Вставка данных в цикле (синхронно с await)
		for (const key of keys) {
			await new Promise((resolve, reject) => {
		  		stmt.run(key, configure[key], (err) => {
					if (err) {
				  		reject(err);
					} else {
				  		resolve();
					}
		  		});
			});
		}
	
		// Финализация запроса
		stmt.finalize();
	} catch (err) {
	  	throw err; // Пробрасываем ошибку дальше
	}
}

/**
 * Получение данных конфигурации
 * @param {sqlite3.Database} db Открытая база данных
 * @returns {object} Объект с конфигурацией в формате ключ:значение
*/
export async function getConfigure(db) {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM configure;`;
		const configure = {};
	  	db.all(sql, [], function(err, rows) {
			if (err) {
		  		reject(err);
			} else {
				rows.forEach(row => { configure[row.name] = row.value; });
		  		resolve(configure);
			}
	  	});
	});
}

