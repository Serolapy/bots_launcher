/**
 * @file apps/plugin/index.js
 * @description Модуль для инициализации и маршрутизации плагинов
 */

import express from 'express';
import fs from 'fs';
import sqlite3 from 'sqlite3';

import constants from '../../const.js';

/**
 * Инициализирует и настраивает маршрутизацию для всех плагинов
 * @async
 * @function
 * @returns {Promise<express.Router>} Маршрутизатор Express с настроенными путями плагинов
 * @throws {Error} Ошибка при некорректной конфигурации или инициализации плагина
 */
export default async function (){
	const router = express.Router();
	const SQLite3 = sqlite3.verbose();
	const folders = fs.readdirSync('plugins/');
	
	let plugin_names = [];
	let plugins_path = [];
	global.plugins = [];
	
	for (const folder_name of folders) {
		// Проверка и инициализация плагина
		
		// файлы ингорируем
		if (fs.lstatSync(`plugins/${folder_name}`).isFile()){
			return
		}

		const plugin_index_path = `plugins/${folder_name}/index.js`;		//путь к исполняющему файлу плагина
		const plugin_config_path = `plugins/${folder_name}/config.json`;	//путь к конфиг-файлу плагина
		
		if (!fs.existsSync(plugin_index_path)){
			throw Error(`Плагин в каталоге '${folder_name}' не имеет файл index.js`);
		}
		if (!fs.existsSync(plugin_config_path)){
			throw Error(`Плагин в каталоге '${folder_name}' не имеет файл config.json`);
		}

		// проверка, все ли обязательные поля есть в плагине
		const plugin_config = JSON.parse(fs.readFileSync(plugin_config_path).toString());
		constants.PLUGIN_REQUIRED_FIELDS.forEach(field => {
			if (plugin_config[field] === undefined){
				throw Error(`Конфиг-файл плагина в каталоге ${folder_name} не имеет поля ${field}`);
			}
		});

		// проверяем плагины на уникальность их имён
		const plugin_name = '' + plugin_config.name;

		// проверяем имя на корректность
		const regex = /^[a-zA-Z0-9_]+$/;

		// Проверка, что строка не пустая
		if (plugin_name.length === 0 || ! regex.test(plugin_name)) {
			throw Error(`Имя плагина в каталоге ${folder_name} имеет некорректное значение: ${plugin_name}. Допустимы только латинские символы, цифры и символ нижнего подчёркивания`);
		}

		plugin_names.forEach(activited_plugin_name => {
			if (activited_plugin_name === plugin_name){
				throw Error(`Плагин с именем ${plugin_name} уже существует`);
			}
		});

		plugin_names.push(plugin_name);

		// запускаем index.js плагина
	 	const plugin_initFunc = await import('../../' + plugin_index_path);

		const database = new SQLite3.Database(`databases/plugin__${plugin_name}.db`);
		global.app_databases.push(database);

		/**
         * Инициализация плагина
         * @type {import('../../classes/Plugin.js').default}
         */
		const plugin = new plugin_initFunc.default(plugin_config, database);
		
		// Проверка типа плагина
		if (! plugin instanceof classes.Plugin){
			throw Error(`Экспортируемый объект плагина ${plugin_config.name} не относится к классу Plugin`);
		}
		global.plugins.push(plugin);
		
		plugins_path = [...plugins_path, ...plugin.getPluginRouterPaths()]
		router.use(`/${plugin_name}`, plugin.getPluginRouter());
	}

	console.log(`Инициированные пути плагинов: ${plugins_path.map(plugin => {
		return `\n\t[ ${plugin.name} ] ${plugin.method}: http://localhost:${constants.BOT_SERVER_PORT}/plugins/${plugin.name}/${plugin.path}`;
	}).join('')}`);

	return router
}