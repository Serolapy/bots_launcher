/*
	Создание базовых настроек системы
*/
import stdio from 'stdio';

import sqlite3 from 'sqlite3';
import * as sql_func from '../sql/sql_func.js';
import * as mainDB_func from '../sql/mainDB_func.js';

import constants from '../const.js';
const SQLite3 = sqlite3.verbose();
const mainDB = new SQLite3.Database('./databases/main.db');

import * as databasePassword from '../functions/databasePassword.js';

(async ()=>{
	if (! await sql_func.checkExistTables(mainDB, ['configure'])){
		// создание таблиц
		await mainDB_func.createTables(mainDB);
	}

	const configure_old = await mainDB_func.getConfigure(mainDB);
	const old_keys = Object.keys(configure_old)
	console.log(`Настройка конфигурации системы. ${old_keys.length === 0 ? "Текущая конфигурация не задана" : "Текущая конфигурация:"}`);
	if (old_keys.length > 0){
		console.log("{");
		Object.keys(configure_old).forEach((key)=>{ console.log(`\t${key} : ${configure_old[key]},`)});
		console.log("}");
	}
	
	if (await stdio.ask(`Вы желаете изменить конфигурацию? Старая конфигурация будет удалена`, {options : ['y','n']}) === 'y'){
		const configuration = {};
		const keys = Object.keys(constants.DEFAULT_CONFIGURE_VALUES_MAINDB);
		
		let i = 0;
		while (i < keys.length){
			const value = await stdio.ask(`Введите значение для ${keys[i]}`);
			if (value !== ""){
				configuration[keys[i]] = value;
				i++;
			}
		}
		const password = await databasePassword.getPasswordFromConsole();

		console.log("Новые настройки конфигурации:");
		console.log("{");
		Object.keys(configuration).forEach((key)=>{ console.log(`\t${key} : ${configuration[key]},`)});
		console.log("}");
		if (await stdio.ask(`Вы желаете сохранить конфигурацию?`, {options : ['y','n']}) === 'y'){
			// добавляем служебную информацию и сохраняем
			configuration["__date_of_change"] = new Date().toString();

			// работа с паролем базы данных
			const secretWordKey = '__secret_word';
    		const defaultSecretWord = constants.DEFAULT_SECRET_WORD;
    		// Проверяем, существовал ли секретный ключ ранее
    		if (old_keys.includes(secretWordKey)) {
    		    const decryptedSecretWord = databasePassword.decrypt(configure_old[secretWordKey], password);			
    		    // Проверяем, удалось ли расшифровать и изменился ли пароль
    		    if (decryptedSecretWord === null || decryptedSecretWord !== defaultSecretWord) {
    		        // Расшифровка не удалась или пароль был изменен
    		        const saveNewPassword = await stdio.ask(
    		            'Пароль базы данных изменен или не удалось расшифровать предыдущий. Сохранить новый пароль?',
    		            { options: ['y', 'n'] }
    		        );
    		        if (saveNewPassword === 'y') {
    		            const encryptedSecretWord = databasePassword.encrypt(defaultSecretWord, password);
    		            if (encryptedSecretWord !== null) {
    		                configuration[secretWordKey] = encryptedSecretWord;
    		            } else {
    		                throw Error ('Ошибка: Не удалось зашифровать пароль базы данных.');
    		            }
    		        } else {
    		            // Пользователь отказался сохранять новый пароль, оставляем старый (если он был)
    		            configuration[secretWordKey] = configure_old[secretWordKey];
    		        }
    		    } else {
    		        // Пароль не изменился, ничего не делаем
    		        configuration[secretWordKey] = configure_old[secretWordKey];
    		    }
    		} else {
    		    // Секретный ключ ранее не существовал
    		    const encryptedSecretWord = databasePassword.encrypt(defaultSecretWord, password);
    		    if (encryptedSecretWord !== null) {
    		        configuration[secretWordKey] = encryptedSecretWord;
    		    } else {
    		        throw Error ('Ошибка: Не удалось зашифровать пароль базы данных.');
    		    }
    		}

			await sql_func.deleteAllValuesFromTable(mainDB, 'configure');
			await mainDB_func.insertConfigure(mainDB, configuration);
		}
		else {
			console.log("Изменения отменены");
		}
	}
	else {
		console.log("Изменения отменены");
	}
})();