import express from 'express';
import 'colors';

import pluginRouter from "./plugin/index.js";
import webRouter from "./web/index.js";

import constants from '../const.js';

/**
 * Запуск приложений проекта
 */
export default async function (){
	const app = express();
	app.use(express.urlencoded({ extended: false }));
	app.use(express.json());

	app.use(express.static('apps/web/public'));
	app.use('/', webRouter());						// веб-сервер для страниц сервиса
	app.use('/plugins/', await pluginRouter());		// плагины

	console.log(`Start bot-launcher...`.yellow);
	app.listen(constants.BOT_SERVER_PORT, function () {
		console.log(`Bots-launcher's server started on port ${constants.BOT_SERVER_PORT}`.green,);
	});
}