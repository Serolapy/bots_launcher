// первоначальная настройка проекта
import fs from 'fs';
import constants from './const.js';
import ngrok from 'ngrok';

// база данных
import sqlite3 from 'sqlite3';
import * as sql_func from './sql/sql_func.js';
import * as mainDB_func from './sql/mainDB_func.js';
const SQLite3 = sqlite3.verbose();

// работаем с сохранёнными данными
(async () => {
	const mainDB = new SQLite3.Database('databases/main.db');
	const sqlite_master_rows = await sql_func.all(mainDB, `SELECT * FROM sqlite_master WHERE type='table' AND name='configure';`);		// проверка наличия таблицы "configure"
	// таблица конфигурации не существует
	if (sqlite_master_rows.length == 0){
		// создание таблиц
		await mainDB_func.createTables(mainDB);
		// вставка дефолтных данных
		await mainDB_func.insertDefaultConfigure(mainDB);
	}
	
	const configure_array = await sql_func.all(mainDB, `SELECT * FROM configure;`);
	// преобразуем таблицу в объект
	const configure = {};
	configure_array.forEach(row => { configure[row.name] = row.value; });
	
	mainDB.close();
})();

// создаём каталоги, если их нет
constants.folders.forEach((folder) => {
	if (!fs.existsSync(folder)){
		fs.mkdirSync(folder);
	}
});

// режим разработки
global.debug = false;
if(process.argv[2] !== undefined && process.argv[2] === 'debug'){
	global.debug = true;
	console.log(`Ngrok started: ${await ngrok.connect(constants.BOT_SERVER_PORT)}`);
}

// запуск сервера
import "./server/index.js";