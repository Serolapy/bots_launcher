import express from 'express';
import fs from 'fs';
import sqlite3 from 'sqlite3';

import constants from '../../const.js';

export default function (){
	const router = express.Router();
	const SQLite3 = sqlite3.verbose();
	const folders = fs.readdirSync('plugins/');
	
	let plugin_names = [];
	folders.forEach(async folder_name => {
		// файлы ингорируем
		if (fs.lstatSync(`plugins/${folder_name}`).isFile()){
			return
		}

		const plugin_index_path = `plugins/${folder_name}/index.js`;		//путь к исполняющему файлу плагина
		if (!fs.existsSync(plugin_index_path)){
			throw Error(`Плагин в каталоге '${folder_name}' не имеет файл index.js`);
		}

		const plugin_config_path = `plugins/${folder_name}/config.json`;	//путь к конфиг-файлу плагина
		if (!fs.existsSync(plugin_config_path)){
			throw Error(`Плагин в каталоге '${folder_name}' не имеет файл config.json`);
		}

		const config = JSON.parse(fs.readFileSync(plugin_config_path).toString());
		// проверка, все ли обязательные поля есть в плагине
		constants.PLUGIN_REQUIRED_FIELDS.forEach(field => {
			if (config[field] === undefined){
				throw Error(`Конфиг-файл плагина в каталоге ${folder_name} не имеет поля ${field}`);
			}
		});

		// проверяем плагины на уникальность их имён
		const plugin_name = '' + config.plugin_name;

		plugin_names.forEach(activited_plugin_name => {
			if (activited_plugin_name === plugin_name){
				throw Error(`Плагин с именем ${plugin_name} уже существует`);
			}
		});

		plugin_names.push(plugin_name);
	 	const plugin_class = await import('../../' + plugin_index_path);

		const database = new SQLite3.Database(`databases/plugin__${plugin_name}.db`);
		global.app_databases.push(database);
		const plugin = new plugin_class.default(plugin_name, database);

		router.use(`/${plugin_name}`, plugin.router);
	});

	return router
}