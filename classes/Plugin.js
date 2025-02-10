/**
 * @file Plugin.js
 * @description Класс плагина для Bot's launcher
 */

import express from 'express';

/**
 * Класс плагина Bot's launcher
 * @class
 */
export default class Plugin {
	/**
     * @private
     * @type {express.Router}
     */
	_router = express.Router();
	
	/**
     * @private
     * @type {Array<Object>}
     */
	_router_paths = [];

	/**
     * @constructor
     * @param {Object} config - Конфигурация плагина
     * @param {string} config.name - Название плагина
     */
	constructor(config) {
		/**
         * Название плагина
         * @type {string}
         */
		this.name = config.name;

		console.log(`[ ${this.name} ] Плагин запущен`);
	}

	/**
     * Объект для добавления обработчиков маршрутов
     * @type {Object}
     */
	router = {
		/**
         * Добавляет обработчик для всех HTTP-методов
         * @param {string} path - Путь маршрута
         * @param {Function} callback - Функция-обработчик
         */
		all: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'all',
				path: path
			});
			this._router.all(path, callback);
		},

		/**
         * Добавляет обработчик для GET-запросов
         * @param {string} path - Путь маршрута
         * @param {Function} callback - Функция-обработчик
         */
		get: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'get',
				path: path
			});
			this._router.get(path, callback);
		},

		/**
         * Добавляет обработчик для POST-запросов
         * @param {string} path - Путь маршрута
         * @param {Function} callback - Функция-обработчик
         */
		post: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'post',
				path: path
			});
			this._router.post(path, callback);
		},

		/**
         * Добавляет обработчик для PUT-запросов
         * @param {string} path - Путь маршрута
         * @param {Function} callback - Функция-обработчик
         */
		put: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'put',
				path: path
			});
			this._router.put(path, callback);
		},

		/**
         * Добавляет обработчик для DELETE-запросов
         * @param {string} path - Путь маршрута
         * @param {Function} callback - Функция-обработчик
         */
		delete: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'delete',
				path: path
			});
			this._router.delete(path, callback);
		},

		/**
         * Добавляет обработчик для PATCH-запросов
         * @param {string} path - Путь маршрута
         * @param {Function} callback - Функция-обработчик
         */
		patch: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'patch',
				path: path
			});
			this._router.patch(path, callback);
		},

		/**
         * Добавляет обработчик для OPTIONS-запросов
         * @param {string} path - Путь маршрута
         * @param {Function} callback - Функция-обработчик
         */
		options: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'options',
				path: path
			});
			this._router.options(path, callback);
		},

		/**
         * Добавляет обработчик для HEAD-запросов
         * @param {string} path - Путь маршрута
         * @param {Function} callback - Функция-обработчик
         */
		head: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'head',
				path: path
			});
			this._router.head(path, callback);
		}
	};
	
	/**
     * Возвращает маршрутизатор плагина
     * @returns {express.Router}
     */
	getPluginRouter () {
		return this._router;
	}

	/**
     * Возвращает пути маршрутов плагина
     * @returns {Array<Object>}
     */
	getPluginRouterPaths () {
		return this._router_paths;
	}
}