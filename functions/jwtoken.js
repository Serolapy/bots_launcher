/**
 * @file jwtoken.js
 * @description Модуль для работы с JSON Web Tokens (JWT).
 */

import jwt  from 'jsonwebtoken';

/**
 * Секретный ключ для подписи JWT, полученный из конфигурации приложения.
 * @constant {string}
 */
const JWT_SECRET = configure_app.JWT_SECRET;

/**
 * Создает новый JWT-токен пользователя.
 * @function new_token
 * @param {number} user_id - Идентификатор пользователя.
 * @param {number} chat_id - Идентификатор чата.
 * @param {number} message_id - Идентификатор сообщения.
 * @param {number|null} inline_message_id - Идентификатор инлайн-сообщения (может быть null).
 * @returns {string} JWT-токен.
 */
export var new_token = function(user_id, chat_id, message_id, inline_message_id){
	let data = {
		user_id : user_id,
		chat_id : chat_id,
		message_id : message_id,
		inline_message_id : inline_message_id
	};
	return jwt.sign(data, JWT_SECRET);
}