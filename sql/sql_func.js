/*
	В этом файле будут собраны
	стандартные команды для синхронного
	выполнения запросов к базе данных
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