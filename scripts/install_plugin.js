import os from 'os';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import stdio from "stdio";
import * as pluginFunc from '../functions/pluginFunc.js';
import * as mainDB_func from '../sql/mainDB_func.js';
import * as sql_func from '../sql/sql_func.js';
import fs from 'fs';

const execAsync = promisify(exec);

/**
 * Устанавливает плагин из Git-репозитория с полной проверкой
 * @async
 * @function installPlugin
 * @returns {Promise<void>}
 */
// TODO: сделать нормальную привязку к БД + вынести ее в отдельную функцию

const mainDB = mainDB_func.openMainDB();

export default async function installPlugin() {
    try {
        // 1. Получаем URL репозитория
        const repoUrl = await stdio.ask('Введите ссылку на Git-репозиторий плагина');
        const tempDir = path.join(os.tmpdir(), `botLauncher_installPlugin_${Date.now()}`);

        // 2. Скачиваем во временную директорию
        console.log('Загрузка плагина...');
        await execAsync(`git clone ${repoUrl} ${tempDir}`);

        // 3. Проверяем структуру плагина
        console.log('Проверка плагина...');
        const pluginConfigPath = path.join(tempDir, 'config.json');
        if (!fs.existsSync(pluginConfigPath)) {
            throw new Error('Файл config.json не найден в репозитории');
        }

        const pluginConfig = JSON.parse(fs.readFileSync(pluginConfigPath, 'utf-8'));
        const plugin_name = pluginConfig.name;

        // 4. Проверка плагина
		pluginFunc.checkPluginBeforeInstall(tempDir);

        // 5. Проверяем имя в БД
        if (! await mainDB_func.checkNameExists(mainDB, plugin_name)) {
            throw new Error(`Плагин с именем "${plugin_name}" уже установлен`);
        }

        // 6. Переносим в рабочую директорию
        const finalDir = path.join('plugins', plugin_name);
        console.log('Перенос файлов...');
        if (fs.existsSync(finalDir)) {
            fs.rmSync(finalDir, { recursive: true, force: true });
        }
        fs.cpSync(tempDir, finalDir, { recursive: true, force: true });
        fs.rmSync(tempDir, { recursive: true, force: true });

        // 7. Регистрируем в БД
        console.log('Сохранение в БД...');
        const nameId = await mainDB_func.createName(mainDB, plugin_name);
		const insert_pluginToDb = `
			INSERT INTO plugin (name_id, link, path)
			VALUES (
			    ?, 
			    ?, 
			    ?
			);
		`
		await sql_func.run(mainDB, insert_pluginToDb, [nameId, repoUrl, finalDir]);
        await mainDB_func.clearAllConfig_byName(mainDB, plugin_name);
        // TODO: регистрация в messenger, если надо
        console.log(`✅ Плагин "${plugin_name}" успешно установлен в ${finalDir}`);
    } catch (error) {
        console.error(`Ошибка установки: ${error.message}`);
        throw error;
    }
}
