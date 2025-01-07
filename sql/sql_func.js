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