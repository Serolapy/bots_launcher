// приложение
import apps from './apps/index.js';

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
	
	if (! await sql_func.checkExistTables(mainDB, ['configure'])){
		throw new Error(`Не найдена таблица конфигурации. Для настройки введите команду "npm run config"`);
	}

	const configure = await mainDB_func.getConfigure(mainDB);
	
	mainDB.close();

	// проверяем целостность конфигурации
	const required_config = Object.keys(constants.DEFAULT_CONFIGURE_VALUES_MAINDB);
	const write_config = {};
	required_config.forEach(function (key){
		if (configure[key] === undefined){
			throw new Error(`Не найдена конфигурация ${key}. Для настройки введите команду "npm run config"`);
		}
		// выводим в global только несистемные конфигурации
		if (key.length >= 2 && key.slice(0,1) !== "__"){
			write_config[key] = configure[key]
		}
	});
	global.app_configuration = write_config;
	
	// создаём каталоги, если их нет
	constants.folders.forEach((folder) => {
		if (!fs.existsSync(folder)){
			fs.mkdirSync(folder);
		}
	});

	// базы данных плагинов
	global.app_databases = [];
	
	// режим разработки
	global.debug = false;
	if(process.argv[2] !== undefined && process.argv[2] === 'debug'){
		global.debug = true;
		console.log(`Ngrok started: ${await ngrok.connect(constants.BOT_SERVER_PORT)}`);
	}
	// запуск сервера
	apps();	
})();


// запуск сервера
apps();