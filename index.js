/**
 * @file index.js
 * @description Основной файл приложения, инициализирующий глобальные настройки и запускающий сервер.
 */

/**
 * @global
 * @description Флаг режима отладки
 * @type {boolean}
 */
global.debug = false;
if(process.argv[2] !== undefined && process.argv[2] === 'debug'){
	global.debug = true;
}

/**
 * @global
 * @description Конфигурация приложения
 * @type {Object}
 */
global.app_configuration = {};

/**
 * @global
 * @description Массив баз данных плагинов
 * @type {Array}
 */
global.app_databases = [];

// очистка консоли
if(! global.debug){
	console.clear();
}

// приложение
import apps from './apps/index.js';

// первоначальная настройка проекта
import createFolders from './functions/createFolders.js';
import constants from './const.js';

// база данных
import * as sql_func from './sql/sql_func.js';
import * as mainDB_func from './sql/mainDB_func.js';

// классы
import classes from './classes/index.js';

/**
 * @function
 * @async
 * @description Основная функция инициализации и запуска приложения
 */
export default async () => {
	console.log(`Start bot-launcher...`.yellow);

	// создаём каталоги, если их нет
	createFolders();

	const mainDB = mainDB_func.openMainDB();
	
	// TODO: добавить проверку всей БД
	if (! await sql_func.checkExistTables(mainDB, ['configure'])){
		throw new Error(`Не найдена таблица конфигурации. Для настройки введите команду "npm run config"`);
	}

	const configure = await mainDB_func.getConfigure(mainDB, 'main');
	
	mainDB.close();

	// проверяем целостность конфигурации
	const required_config = Object.keys(constants.DEFAULT_CONFIGURE_VALUES_MAINDB);
	const write_config = {};
	required_config.forEach(function (key){
		if (configure[key] === undefined){
			throw new Error(`Не найдена конфигурация ${key}. Для настройки введите команду "npm run config"`);
		}
		// TODO: отказаться от global
		// выводим в global только несистемные конфигурации
		if (key.length >= 2 && key.slice(0,1) !== "__"){
			write_config[key] = configure[key]
		}
	});
	global.app_configuration = write_config;
	
	// выводим консоль
	console.log(`[ classes/index.js ]`.blue, `Определены следующие классы: ${Object.keys(classes).join(', ')}`);
	
	// запуск сервера
	await apps();
};
