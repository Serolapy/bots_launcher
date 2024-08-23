// первоначальная настройка проекта
import fs from 'fs';
import constants from './const.js';
import ngrok from 'ngrok';

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