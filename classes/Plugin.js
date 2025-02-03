import express from 'express';

/**
 * Класс плагина Bot's launcher
 */
export default class {
	_router = express.Router();
	_router_paths = [];

	constructor(config) {
		this.name = config.name;										// название плагина

		console.log(`[ ${this.name} ] Плагин запущен`);
	}

	/**
	 * Добавить обработчик для ссылки в интернете. Аналог `router.all(path, callback)` и других глаголов
	 */
	router = {
		all: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'all',
				path: path
			});
			this._router.all(path, callback);
		},
		get: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'get',
				path: path
			});
			this._router.get(path, callback);
		},
		post: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'post',
				path: path
			});
			this._router.post(path, callback);
		},
		put: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'put',
				path: path
			});
			this._router.put(path, callback);
		},
		delete: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'delete',
				path: path
			});
			this._router.delete(path, callback);
		},
		patch: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'patch',
				path: path
			});
			this._router.patch(path, callback);
		},
		options: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'options',
				path: path
			});
			this._router.options(path, callback);
		},
		head: (path, callback) => {
			this._router_paths.push({
				name: this.name,
				method: 'head',
				path: path
			});
			this._router.head(path, callback);
		}
	};

	getPluginRouter () {
		return this._router;
	}
	getPluginRouterPaths () {
		return this._router_paths;
	}
}