/**
 * @file createFolders.js
 * @description Файл с функцией для создания обязательных каталогов в системе
 */

import constants from '../const.js';
import fs from 'fs';

/**
 * Функция для создания обязательных каталогов в системе
 */
export default function (){
	constants.folders.forEach((folder) => {
		if (!fs.existsSync(folder)){
			fs.mkdirSync(folder);
		}
	});	
}