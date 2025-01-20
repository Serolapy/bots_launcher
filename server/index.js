import 'colors';

import express from 'express';
import constants from '../const.js';
import fs from 'fs';

// инициализация логгера
import SimpleNodeLogger from "simple-node-logger";
const log = SimpleNodeLogger.createSimpleFileLogger('./logs/main.log');
log.setLevel(global.debug ? 'all' : 'warn');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static('server/public'));

fs.readdir('plugins/', (err, folders) => {
	if (err){
		throw Error(err);
	}
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
	 	const plugin_class = await import('../' + plugin_index_path);

		//const database = mongoose.createConnection(`${mongodbUrl}/bots_launcher-${plugin_name}`, {family: 4});
		const database = null;
		const plugin = new plugin_class.default(plugin_name, database);

		app.use(`/${plugin_name}`, plugin.router);
	});
});


console.log(`Start bot-launcher...`.yellow);
app.listen(constants.BOT_SERVER_PORT, function () {
	log.info(`Bots-launcher's server started on port ${constants.BOT_SERVER_PORT}`);
	console.log(`Bots-launcher's server started on port ${constants.BOT_SERVER_PORT}`.green,);
});