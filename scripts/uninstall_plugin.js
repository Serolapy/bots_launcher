import fs from 'fs';
import { promisify } from 'util';
const rmAsync = promisify(fs.rm);
import * as mainDB_func from '../sql/mainDB_func.js';

export default async function () {
	const mainDB = mainDB_func.openMainDB();
	const plugin_name = await stdio.ask('Введите название плагина для удаления');
	try {
		// 1. Получение информации о плагине
		const nameId = await mainDB_func.getNameId(mainDB, plugin_name);
		const info_sql = `
        	SELECT 
				n.id AS name_id
        	    n.name AS name,
        	    p.path AS path,
        	    p.link AS link
        	FROM name n
        	JOIN plugin p ON n.id = p.name_id
        	WHERE n.name = ?
    	`;
		const pluginInfo = await mainDB.get(info_sql, [plugin_name]);

		if(!pluginInfo){
			throw new Error(`Плагин "${plugin_name}" не найден в базе данных`);
		}

		// 2. Удаляем записи из связанных таблиц
        await mainDB.run('BEGIN TRANSACTION');
        
        // Удаляем конфигурацию
        await mainDB.run(
            'DELETE FROM configure WHERE name_id = ?',
            [pluginInfo.name_id]
        );
        
        // Удаляем плагин
        await mainDB.run(
            'DELETE FROM plugin WHERE name_id = ?',
            [pluginInfo.name_id]
        );
        
        // Удаляем имя
        await mainDB.run(
            'DELETE FROM name WHERE id = ?',
            [pluginInfo.name_id]
        );
        
        await mainDB.run('COMMIT');

		// 3. Удаляем файлы плагина
		if (fs.existsSync(pluginInfo.path)) {
			fs.rmSync(pluginInfo.path, { recursive: true, force: true });

			console.error(`Плагин был удалён`);
		}
		else {
			console.error(`Каталог ${pluginInfo.path} не найден`);
		}
	} catch (error) {
		await db.run('ROLLBACK');
		console.error(`Ошибка при удалении плагина: ${error.message}`);
	}
}