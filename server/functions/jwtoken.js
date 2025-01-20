import jwt  from 'jsonwebtoken';

const JWT_SECRET = configure_app.JWT_SECRET;

/**
 * Создать новый jwt-токен пользователя
 * @param {Number} user_id 
 * @param {Number} chat_id 
 * @param {Number} message_id 
 * @returns {String} Токен
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