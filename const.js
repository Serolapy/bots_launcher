// обновил тут - обнови README.md

const constants = {
	BOT_SERVER_PORT : 8443,							// порт сервера лаунчера
	DB_DOMAIN : "mongodb://localhost",				// домен базы данных
	DB_MONGO_PORT : 27017,							// порт базы данных
	DB_SERVER_PORT : 3900,							// порт для подключения к серверу базы данных
	folders : [
		'plugins', 
		'logs', 
		'backups', 
		'temp',
		'databases'
	],												// папки, которые необходимо обязательно создать в проекте

	PLUGIN_REQUIRED_FIELDS : [						// обязательные поля в конфиг-файле плагинов
		'plugin_name',								// название плагина
	],

	DEFAULT_CONFIGURE_VALUES_MAINDB : {
		JWT_SECRET : ''
	},

};

export default constants;