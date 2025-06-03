import fs from "fs";
import constants from "../const.js";

export async function getPluginPathByName(db, pluginName) {
    try {
        const sql = `
            SELECT p.path 
            FROM plugin p
            JOIN name n ON p.name_id = n.id
            WHERE n.name = ?
            LIMIT 1
        `;
        
        const results = await db.all(db, sql, [pluginName]);
        
        // Если есть результаты, возвращаем path, иначе null
        return results.length > 0 ? results[0].path : null;
    } catch (err) {
        throw new Error(`Ошибка при получении пути плагина: ${err.message}`);
    }
}

/**
 * 
 * Проверяет корректность структуры и конфигурации плагина после установки
 * @async
 * @function checkPlugin
 * @param {Object} db - Объект подключения к базе данных SQLite
 * @param {string} pluginName - Название плагина (из таблицы name)
 * @returns {Promise<boolean>} true если проверка пройдена успешно
 * @throws {Error} Если плагин не проходит какую-либо проверку
 */
export async function checkPlugin(db, pluginName) {
    // 1. Проверяем существует ли плагин в БД
    const pluginPath = await getPluginPathByName(db, pluginName);
    
    if (!pluginPath) {
        throw new Error(`Плагин "${pluginName}" не найден в базе данных`);
    }

    // 2. Проверка существования директории плагина
    if (!fs.existsSync(pluginPath)) {
        throw new Error(`Директория плагина "${pluginName}" не существует по пути: ${pluginPath}`);
    }

    // 3. Проверка что это именно директория, а не файл
    if (fs.lstatSync(pluginPath).isFile()) {
        throw new Error(`Путь плагина "${pluginName}" ведет к файлу, а не к директории`);
    }

    // 4. Пути к обязательным файлам плагина
    const pluginIndexPath = `${pluginPath}/index.js`;
    const pluginConfigPath = `${pluginPath}/config.json`;

    // 5. Проверка наличия обязательных файлов
    if (!fs.existsSync(pluginIndexPath)) {
        throw new Error(`Плагин "${pluginName}" не имеет обязательного файла index.js`);
    }
    if (!fs.existsSync(pluginConfigPath)) {
        throw new Error(`Плагин "${pluginName}" не имеет обязательного файла config.json`);
    }

    // 6. Чтение и валидация конфигурации
    let pluginConfig;
    try {
        pluginConfig = JSON.parse(fs.readFileSync(pluginConfigPath, 'utf-8'));
    } catch (e) {
        throw new Error(`Некорректный JSON в конфигурации плагина "${pluginName}": ${e.message}`);
    }

    // 7. Проверка обязательных полей в конфиге
    constants.PLUGIN_REQUIRED_FIELDS.forEach(field => {
        if (pluginConfig[field] === undefined) {
            throw new Error(`Конфиг плагина "${pluginName}" не содержит обязательного поля "${field}"`);
        }
    });

    // 8. Проверка соответствия имени плагина
    if (pluginConfig.name !== pluginName) {
        throw new Error(`Имя в конфиге (${pluginConfig.name}) не соответствует запрошенному (${pluginName})`);
    }

    // 9. Дополнительная проверка файла index.js
    try {
        const indexContent = fs.readFileSync(pluginIndexPath, 'utf-8');
        if (!indexContent.trim()) {
            throw new Error(`Файл index.js плагина "${pluginName}" пуст`);
        }
    } catch (e) {
        throw new Error(`Ошибка чтения index.js плагина "${pluginName}": ${e.message}`);
    }

    return true;
}

/**
 * 
 * Проверяет корректность структуры и конфигурации плагина перед установкой
 * @async
 * @function checkPluginBeforeInstall
 * @param {string} pluginPath - Название плагина (из таблицы name)
 * @returns {Promise<boolean>} true если проверка пройдена успешно
 * @throws {Error} Если плагин не проходит какую-либо проверку
 */
export async function checkPluginBeforeInstall(pluginPath) {

    // 4. Пути к обязательным файлам плагина
    const pluginIndexPath = `${pluginPath}/index.js`;
    const pluginConfigPath = `${pluginPath}/config.json`;

    // 5. Проверка наличия обязательных файлов
    if (!fs.existsSync(pluginIndexPath)) {
        throw new Error(`Плагин не имеет обязательного файла index.js`);
    }
    if (!fs.existsSync(pluginConfigPath)) {
        throw new Error(`Плагин не имеет обязательного файла config.json`);
    }

    // 6. Чтение и валидация конфигурации
    let pluginConfig;
    try {
        pluginConfig = JSON.parse(fs.readFileSync(pluginConfigPath, 'utf-8'));
    } catch (e) {
        throw new Error(`Некорректный JSON в конфигурации плагина: ${e.message}`);
    }

    // 7. Проверка обязательных полей в конфиге
    console.log(pluginConfig)

    constants.PLUGIN_REQUIRED_FIELDS.forEach(field => {
        if (pluginConfig[field] === undefined) {
            throw new Error(`Конфиг плагина не содержит обязательного поля "${field}"`);
        }
    });

    // 9. Дополнительная проверка файла index.js
    try {
        const indexContent = fs.readFileSync(pluginIndexPath, 'utf-8');
        if (!indexContent.trim()) {
            throw new Error(`Файл index.js плагина пуст`);
        }
    } catch (e) {
        throw new Error(`Ошибка чтения index.js плагина: ${e.message}`);
    }

    return true;
}