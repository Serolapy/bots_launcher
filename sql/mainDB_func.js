/**
 * @file mainDB_func.js
 * @description Модуль для работы с главной базой данных системы.
 */

import sqlite3 from 'sqlite3';
const SQLite3 = sqlite3.verbose();

/** Открытие базы данных 
 * 	@function openMainDB
*/
export function openMainDB(){
	return new SQLite3.Database('databases/main.db');
}

/**
 * Создает шаблонные таблицы в базе данных.
 * @async
 * @function createTables
 * @param {Object} db - Объект подключения к базе данных SQLite.
 * @returns {Promise<Object>} Объект с результатами выполнения запроса.
 */
export function createTables(db) {
	const createTableStatements = [
		`
			CREATE TABLE IF NOT EXISTS name (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL UNIQUE
			);
		`,
		`
			CREATE TABLE IF NOT EXISTS messenger (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL UNIQUE
			);
		`,
		`
			CREATE TABLE IF NOT EXISTS plugin (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name_id INTEGER NOT NULL,
				link TEXT NOT NULL,
				path TEXT NOT NULL,
				FOREIGN KEY (name_id) REFERENCES name(id)
			);
		`,
		`
			CREATE TABLE IF NOT EXISTS bot (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name_id INTEGER NOT NULL,
				messenger_id INTEGER NOT NULL,
				functionsPath TEXT NOT NULL,
				FOREIGN KEY (name_id) REFERENCES name(id),
				FOREIGN KEY (messenger_id) REFERENCES messenger(id)
			);
		`,
		`
			CREATE TABLE IF NOT EXISTS configure (
				name_id INTEGER NOT NULL,
				key TEXT NOT NULL,
				value TEXT NOT NULL,
				PRIMARY KEY (name_id, key),
				FOREIGN KEY (name_id) REFERENCES name(id)
			);
		`,
		`
			CREATE TABLE IF NOT EXISTS replica (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				bot_id INTEGER NOT NULL,
				FOREIGN KEY (bot_id) REFERENCES bot(id)
			);
		`,
		`
			CREATE TABLE IF NOT EXISTS content (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				replica_id INTEGER NOT NULL,
				type TEXT NOT NULL,
				data TEXT NOT NULL,
				FOREIGN KEY (replica_id) REFERENCES replica(id)
			);
		`,
		`
			CREATE TABLE IF NOT EXISTS replica_transition (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				from_replica_id INTEGER NOT NULL,
				to_replica_id INTEGER NOT NULL,
				text TEXT NOT NULL,
				FOREIGN KEY (from_replica_id) REFERENCES replica(id),
				FOREIGN KEY (to_replica_id) REFERENCES replica(id)
			);
		`,
	];
  
	function executeSql(db, sql) {
		return new Promise((resolve, reject) => {
		  db.run(sql, function (err) {
				if (err) {
			  		reject(err);
			  		return;
				}
				resolve(this);
		  	});
		});
	}
	  
	return new Promise(async (resolve, reject) => {
	  	try {
			// настраиваем базу данных
			await db.get("PRAGMA foreign_keys = ON");

			// создание таблиц
			for (const sql of createTableStatements) {
		  		await executeSql(db, sql);
			}

			resolve(); // Разрешаем промис, когда все таблицы успешно созданы
	  	} catch (err) {
			reject(err); // Отклоняем промис в случае ошибки
	  	}
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
export async function insertConfigure(db, configure, name) {
	try {
		const insertQuery = `
			INSERT INTO configure (name_id, key, value)
			VALUES (?, ?, ?)
			ON CONFLICT(name_id, key) DO UPDATE SET value = excluded.value;
	  	`;
		
		const keys = Object.keys(configure);
		
		// Подготовка запроса
		const stmt = db.prepare(insertQuery);
		
		// Вставка данных в цикле (синхронно с await)
		for (const key of keys) {
			await new Promise((resolve, reject) => {
		  		stmt.run(name, key, configure[key], (err) => {
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
 * @param {String} name - Название плагина, для которого идёт получение конфигурации.
 * @returns {Promise<Object>} Объект с конфигурацией в формате ключ:значение.
 */
export async function getConfigure(db, name) {
	return new Promise((resolve, reject) => {
		const sql = `SELECT configure.key AS key, configure.value AS value FROM configure JOIN name ON configure.name_id = name.id WHERE name = ?;`;
		const configure = {};
	  	db.all(sql, [name], function(err, rows) {
			if (err) {
		  		reject(err);
			} else {
				rows.forEach(row => { configure[row.key] = row.value; });
		  		resolve(configure);
			}
	  	});
	});
}

/**
 * Создает новую запись в таблице name и возвращает её идентификатор.
 * @async
 * @function createName
 * @param {Object} db - Объект подключения к базе данных SQLite.
 * @param {String} name - Уникальное имя для создания записи.
 * @returns {Promise<Number>} ID созданной записи.
 * @throws {Error} Если имя уже существует или произошла другая ошибка.
 */
export async function createName(db, name) {
    // Сначала проверяем, существует ли уже такое имя
    const existingId = await getNameId(db, name);
    if (existingId) {
        throw new Error(`Name '${name}' already exists in database`);
    }

    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO name (name) VALUES (?);`;
        db.run(sql, [name], function(err) {
            if (err) {
                reject(new Error(`Failed to create name: ${err.message}`));
            } else {
                resolve(this.lastID); // Возвращаем ID созданной записи
            }
        });
    });
}

/**
 * Получает идентификатор записи по имени из таблицы name.
 * @async
 * @function getNameId
 * @param {Object} db - Объект подключения к базе данных SQLite.
 * @param {String} name - Имя для поиска в таблице name.
 * @returns {Promise<Number|null>} ID найденной записи или null если не найдено.
 * @throws {Error} Если произошла ошибка при выполнении запроса.
 */
export async function getNameId(db, name) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM name WHERE name = ? LIMIT 1;`;
        db.get(sql, [name], function(err, row) {
            if (err) {
                reject(new Error(`Failed to get name ID: ${err.message}`));
            } else {
                resolve(row ? row.id : null);
            }
        });
    });
}

/**
 * Удаляет все записи конфигурации для указанного имени из таблицы configure.
 * @async
 * @function clearAllConfig_byName
 * @param {Object} db - Объект подключения к базе данных SQLite.
 * @param {String} name - Имя, для которого нужно очистить конфигурацию.
 * @returns {Promise<Boolean>} true если удаление прошло успешно.
 * @throws {Error} Если имя не найдено или произошла другая ошибка.
 */
export async function clearAllConfig_byName(db, name) {
    const name_id = await getNameId(db, name);
    if (!name_id) {
        throw new Error(`Name '${name}' not found in database`);
    }

    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM configure WHERE name_id = ?;`;
        db.run(sql, [name_id], function(err) {
            if (err) {
                reject(new Error(`Failed to clear config: ${err.message}`));
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * Проверяет существование имени в таблице name
 * @async
 * @function checkNameExists
 * @param {Object} db - Объект подключения к базе данных SQLite
 * @param {string} name - Имя для проверки
 * @returns {Promise<boolean>} false если имя существует, true если не существует
 * @throws {Error} В случае ошибки выполнения запроса
 */
export async function checkNameExists(db, name) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT COUNT(*) as count FROM name WHERE name = ?`;
        
        db.get(sql, [name], function(err, row) {
            if (err) {
                reject(new Error(`Ошибка проверки имени: ${err.message}`));
            } else {
                // Если count > 0 - имя существует (возвращаем false)
                // Если count = 0 - имя не существует (возвращаем true)
                resolve(row.count === 0);
            }
        });
    });
}