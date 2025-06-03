import stdio from "stdio";

import configScript from './scripts/config.js';
import mainScript from './index.js';
import updateScript from "./scripts/update.js";
import install_pluginScript from "./scripts/install_plugin.js";
import uninstall_pluginScript from "./scripts/uninstall_plugin.js";
import install_plugins_depScript from "./scripts/install_plugins_dep.js";

import createFolders from './functions/createFolders.js';
import * as mainDB_func from "./sql/mainDB_func.js";

/**
 * Показать раздел меню
 * @param {string} menuName - Раздел из menuConfig
 */
async function showMenu(menuName){
	if (! menuName in menuConfig){
		throw Error(`Не найден раздел меню "${menuName}"`);
	}

	const menu = menuConfig[menuName];

	["label", "items"].forEach(key => {
		if (!(key in menu)) {
			throw new Error(`Не найден ключ "${key}" в меню "${menu}"`);
		}
	});
	Object.entries(menu.items).forEach(([key, value]) => {
		if (!(value instanceof Button)) {
			throw new Error(`Значение ключа "${key}" в меню "${menuName}" не является экземпляром Button`);
		}
	});
	

	const list = Object.keys(menu.items);

	console.log(``);
	console.log(`┌─[ ${menu.label} ]`);
	console.log(`│`);
	for (let i = 0; i < list.length; i++){
		console.log(`${i + 1 === list.length ? '└' : '├'}── ${list[i]} ► ${menu.items[list[i]].label}`);
	}

	const actionNumber = await stdio.ask(`Введите номер желаемого действия`, {options : list});
	const btn = menu.items[actionNumber];

	if (btn.action){
		await btn.action();
		showMenu(menuName);
	} else {
		showMenu(btn.submenu);
	}
}


class Button {
	constructor(label, action, submenu) {
		this.label = label;
		if (action) {
			this.action = action;
		}
		else {
			this.submenu = submenu;
		}
	}
}


const menuConfig = {
	main: {
		label: 'Главное меню',
		items: {
			'0': new Button ('Выход', () => { process.exit(0) }),
			'1': new Button ('Запустить лаунчер', mainScript),
			'2': new Button ('Настроить конфигурацию', configScript),
			'3': new Button ('Действия с плагинами..', null, 'plugins'),
			'4': new Button ('Обновить систему', updateScript),
		}
	},
	plugins: {
		label: 'Действия с плагинами',
		items: {
			'0': new Button ('Главное меню..', null, 'main'),
			//TODO: '1': new Button ('Вывести список плагинов', () => {}),
			'2': new Button ('Установить плагин', install_pluginScript),
			'3': new Button ('Установить зависимости для плагинов', install_plugins_depScript),
			'4': new Button ('Удалить плагин', uninstall_pluginScript),
	  	}
	},
};

// инициализируем базу данных
const mainDB = mainDB_func.openMainDB();
await mainDB_func.createTables(mainDB);
await mainDB.close();

// создаём каталоги, если их нет
createFolders();

showMenu('main');