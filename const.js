/**
 * @file const.js
 * @description Файл с константами для проекта
 */

/**
 * @typedef {Object} Constants
 * @property {number} BOT_SERVER_PORT - Порт сервера лаунчера
 * @property {string[]} folders - Список обязательных папок в проекте
 * @property {string[]} PLUGIN_REQUIRED_FIELDS - Обязательные поля в конфиг-файле плагинов
 * @property {Object} DEFAULT_CONFIGURE_VALUES_MAINDB - Значения по умолчанию для конфигурации основной базы данных
 * @property {string} DEFAULT_CONFIGURE_VALUES_MAINDB.JWT_SECRET - Секретный ключ для JSON Web Token
 * @property {string} DEFAULT_SECRET_WORD - Слово для проверки правильности ввода пароля для БД
 */

/**
 * Константы проекта
 * @type {Constants}
 */
const constants = {
	BOT_SERVER_PORT : 8443,
	folders : [
		'plugins', 
		'logs', 
		'backups', 
		'temp',
		'databases'
	],

	PLUGIN_REQUIRED_FIELDS : [
		'name',
		'tokens'
	],

	DEFAULT_CONFIGURE_VALUES_MAINDB : {
		JWT_SECRET : ''
	},

	DEFAULT_SECRET_WORD : 'Serolapy'
};

export default constants;