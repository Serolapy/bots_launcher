import crypto from 'crypto';
import stdio from 'stdio';

/**
 * Функция для шифрования строки с использованием AES-256-CBC.
 *
 * @param {string} text - Текст для шифрования.
 * @param {string} password - Пароль, используемый для генерации ключа.
 * @returns {string|null} - Зашифрованный текст в виде шестнадцатеричной строки
 */
export function encrypt(text, password) {
    // Проверка входных параметров
    if (typeof text !== 'string' || text.length === 0) {
        console.error('Ошибка: Текст для шифрования должен быть непустой строкой.');
        return null;
    }
    if (typeof password !== 'string' || password.length === 0) {
        console.error('Ошибка: Пароль должен быть непустой строкой.');
        return null;
    }

    try {
        const iv = crypto.randomBytes(16);
        const key = crypto.scryptSync(password, 'Serolapy', 32);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
		let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + encrypted;
    } catch (error) {
        console.error('Ошибка при шифровании');
        return null;
    }
}

/**
 * Функция для расшифровки строки, зашифрованной с использованием AES-256-CBC.
 *
 * @param {string} text - Зашифрованный текст (в виде шестнадцатеричной строки).
 * @param {string} password - Пароль, использованный для шифрования.
 * @returns {string|null} - Расшифрованный текст
 */
export function decrypt(text, password) {
    // Проверка входных параметров
    if (typeof text !== 'string' || text.length < 32) {
        console.error('Ошибка: Некорректный зашифрованный текст.');
        return null;
    }
    if (typeof password !== 'string' || password.length === 0) {
        console.error('Ошибка: Пароль должен быть непустой строкой.');
        return null;
    }

    try {
        const iv = Buffer.from(text.slice(0, 32), 'hex');
        const key = crypto.scryptSync(password, 'Serolapy', 32);
        const encryptedText = text.slice(32);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
		console.error('Ошибка при расшифровке');
        return null;
    }
}

// Регулярное выражение для проверки строки
const regex = /^[a-zA-Z0-9_]+$/;

export async function getPasswordFromConsole(){
	const password = await stdio.ask(`Введите пароль от базы данных (латинские буквы, цифры, символ "_")`);
	if (!regex.test(password)){
		console.log('Введённый пароль содержит недопустимые символы');
		return await getPasswordFromConsole();
	}
	return password
}