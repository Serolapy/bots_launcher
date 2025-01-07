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
 * Вставка стандартных значений в таблицу configure
 * @param {sqlite3.Database} db Открытая база данных
 */
export async function insertDefaultConfigure(db) {
	try {
		const insertQuery = `
			INSERT INTO configure (name, value) VALUES (?, ?);
	  	`;
  
		// Дефолтные данные (замените на свои)
		const keys = Object.keys(constants.DEFAULT_CONFIGURE_VALUES_MAINDB);
		
		// Подготовка запроса
		const stmt = db.prepare(insertQuery);
		
		// Вставка данных в цикле (синхронно с await)
		for (const key of keys) {
			await new Promise((resolve, reject) => {
		  		stmt.run(key, constants.DEFAULT_CONFIGURE_VALUES_MAINDB[key], (err) => {
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
