/**
 * @file apps/plugin/index.js
 * @description Модуль для инициализации и маршрутизации плагинов
 */

import express from 'express';
import fs from 'fs';

import constants from '../../const.js';
import * as databasePassword from '../../functions/databasePassword.js';
import * as mainDB_func from '../../sql/mainDB_func.js';
import * as pluginFunc from '../../functions/pluginFunc.js';
import classes from '../../classes/index.js';

/**
 * Инициализирует и настраивает маршрутизацию для всех плагинов
 * @async
 * @function
 * @returns {Promise<express.Router>} Маршрутизатор Express с настроенными путями плагинов
 * @throws {Error} Ошибка при некорректной конфигурации или инициализации плагина
 */
export default async function (){
	const router = express.Router();
	const mainDB = mainDB_func.openMainDB();
	const configure = await mainDB_func.getConfigure(mainDB, 'main');

	// TODO: при добавлении ботов вывести проверку пароля в отдельное место
	// вводим пароль для БД
	const password = await databasePassword.getPasswordFromConsole();
	if (constants.DEFAULT_SECRET_WORD != databasePassword.decrypt(configure['__secret_word'], password)){
		throw Error('Пароль введен неправильно');
	} else {
		console.log('Проверка пароля пройдена');
	}

	// Получаем имена плагинов
	const getPluginNames_SQL = `
            SELECT n.name 
            FROM name n
            JOIN plugin p ON n.id = p.name_id
    	`;
	// FIXME: all?
	const getPluginNames_result = await all(db, getPluginNames_SQL);

	const plugin_names = getPluginNames_result.map(row => row.name);
	let plugins_routers = [];
	global.plugins = [];

	for (const plugin_name of plugin_names) {
		pluginFunc.checkPlugin(mainDB, plugin_name);

		const plugin_path = pluginFunc.getPluginPathByName(mainDB, plugin_name);
		const plugin_config = JSON.parse(fs.readFileSync(`${plugin_path}/config.json`, 'utf-8'));

		// запускаем index.js плагина
	 	const plugin_initFunc = await import(`../../${plugin_path}/index.js`);

		// FIXME: импорт sqlite3
		const database = new SQLite3.Database(`databases/plugin__${plugin_name}.db`);
		global.app_databases.push(database);

		/**
         * Инициализация плагина
         * @type {import('../../classes/Plugin.js').default}
         */
		// TODO: дать возможность получать данные плагина из конфига ядра (таблица configuration)
		const plugin = await plugin_initFunc.default({
			classes: classes,			 				// классы проекта
			db: database, 								// база данных плагина
			config: { ...plugin_config },				// конфиг плагина
		});
		
		// Проверка типа плагина
		if (! plugin instanceof classes.Plugin){
			throw Error(`Экспортируемый объект плагина ${plugin_config.name} не относится к классу Plugin`);
		}
		global.plugins.push(plugin);
		
		// Добавляем роуты плагина в общий список роутов
		plugins_routers = [...plugins_routers, ...plugin.getPluginRouterPaths()]
		router.use(`/${plugin_name}`, plugin.getPluginRouter());
		//TODO: если плагин содержит в себе настройки соц сети или мессенджера, обработать их
	}

	console.log(`Инициированные пути плагинов: ${plugins_routers.map(plugin => {
		return `\n\t[ ${plugin.name} ] ${plugin.method}: http://localhost:${constants.BOT_SERVER_PORT}/plugins/${plugin.name}/${plugin.path}`;
	}).join('')}`);

	mainDB.close();
	return router
}