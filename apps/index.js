/**
 * @file apps/index.js
 * @description Основной файл для запуска приложений проекта
 */

import express from 'express';
import 'colors';

import pluginRouter from "./plugin/index.js";
import webRouter from "./web/index.js";

import constants from '../const.js';

/**
 * Запускает приложения проекта
 * @async
 * @function
 * @returns {Promise<void>}
 */
export default async function (){
	/**
     * Экземпляр Express приложения
     * @type {express.Application}
     */
	const app = express();

	// Настройка middleware
	app.use(express.urlencoded({ extended: false }));
	app.use(express.json());

	// Настройка статических файлов
	app.use(express.static('apps/web/public'));

	// Настройка маршрутов
    /**
     * Веб-сервер для страниц сервиса
     */

	app.use('/', webRouter());

	/**
     * Маршруты для плагинов
     */
	app.use('/plugins/', await pluginRouter());

	// Запуск сервера
	app.listen(constants.BOT_SERVER_PORT, function () {
		console.log(`Bots-launcher's server started on port ${constants.BOT_SERVER_PORT}`.green);
	});
}