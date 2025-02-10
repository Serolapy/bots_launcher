/**
 * @file sql_func.js
 * @description Модуль с функциями для синхронного выполнения запросов к базе данных SQLite.
 */

/**
 * Выполняет SQL-запрос, который не возвращает результат (например, INSERT, UPDATE, DELETE).
 * @async
 * @function run
 * @param {Object} db - Объект подключения к базе данных SQLite.
 * @param {string} sql - SQL-запрос для выполнения.
 * @param {Array} [params=[]] - Массив параметров для SQL-запроса.
 * @returns {Promise<Object>} Объект с результатами выполнения запроса.
 */
export async function run(db, sql, params = []) {
	return new Promise((resolve, reject) => {
	  	db.run(sql, params, function(err) {
			if (err) {
		  		reject(err);
			} else {
		  		resolve(this);
			}
	  	});
	});
}

/**
 * Выполняет SQL-запрос и возвращает все результаты.
 * @async
 * @function all
 * @param {Object} db - Объект подключения к базе данных SQLite.
 * @param {string} sql - SQL-запрос для выполнения.
 * @param {Array} [params=[]] - Массив параметров для SQL-запроса.
 * @returns {Promise<Array>} Массив с результатами запроса.
 */
export async function all(db, sql, params = []) {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (err, rows) => {
			if (err) {
				reject(err);
			} else {
		  		resolve(rows);
			}
	  	});
	});
}

/**
 * Удаляет все записи из указанной таблицы.
 * @async
 * @function deleteAllValuesFromTable
 * @param {Object} db - Объект подключения к базе данных SQLite.
 * @param {string} table - Имя таблицы, из которой нужно удалить все записи.
 * @returns {Promise<Object>} Объект с результатами выполнения запроса.
 */
export async function deleteAllValuesFromTable(db, table) {
	return new Promise((resolve, reject) => {
		const sql = `DELETE FROM ${table};`;

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
 * Проверяет существование указанных таблиц в базе данных.
 * @async
 * @function checkExistTables
 * @param {Object} db - Объект подключения к базе данных SQLite.
 * @param {Array<string>} [tables=[]] - Массив имен таблиц для проверки.
 * @returns {Promise<boolean>} True, если все таблицы существуют, иначе false.
 */
export async function checkExistTables(db, tables = []) {
    for (const table of tables) {
        // Используем параметризованный запрос для предотвращения SQL-инъекций
        const rows = await all(
            db,
            "SELECT name FROM sqlite_master WHERE type='table' AND name = ?;",
            [table]
        );

        // Если таблица не найдена, возвращаем false
        if (rows.length === 0) {
            return false;
        }
    }
    // Все таблицы существуют
    return true;
}