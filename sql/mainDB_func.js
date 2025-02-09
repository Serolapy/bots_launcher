/**
 * @file mainDB_func.js
 * @description Модуль для работы с главной базой данных системы.
 */

import constants from '../const.js';

/**
 * Создает шаблонные таблицы в базе данных.
 * @async
 * @function createTables
 * @param {Object} db - Объект подключения к базе данных SQLite.
 * @returns {Promise<Object>} Объект с результатами выполнения запроса.
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
 * Вставляет значения в таблицу configure.
 * @async
 * @function insertConfigure
 * @param {Object} db - Объект подключения к базе данных SQLite.
 * @param {Object} configure - Объект с конфигурационными данными для вставки.
 * @throws {Error} Выбрасывает ошибку, если вставка не удалась.
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
 * Получает данные конфигурации из базы данных.
 * @async
 * @function getConfigure
 * @param {Object} db - Объект подключения к базе данных SQLite.
 * @returns {Promise<Object>} Объект с конфигурацией в формате ключ:значение.
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

