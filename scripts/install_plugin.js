import { exec } from 'child_process';
import fs from 'fs';
import stdio from "stdio";

// Определяем имя папки, в которую будет клонирован репозиторий
// Используем последний сегмент URL без .git как имя папки

export default async function () {
	const repoUrl = await stdio.ask('Введите ссылку на Git-репозиторий плагина');

	const folderName = repoUrl.split('/').pop().replace(/\.git$/, '');

	// удаляем старую версию, если она есть
	try {
		if (fs.existsSync(`plugins/${folderName}`)) {
			fs.rmSync(`plugins/${folderName}`, { recursive: true, force: true });
			console.error(`Плагин был удалён`);
		}
	} catch (error) {
		console.error(`Ошибка при удалении плагина: ${error.message}`);
	}

	// загружаем новую версию
	exec(`git clone ${repoUrl} plugins/${folderName}`, (error, stdout) => {
		if (error) {
			console.error(`Ошибка при загрузке плагина: ${error.message}`);
			return;
		}
		console.log(`Плагин успешно скачан: ${folderName}`);
		console.log(stdout);
		console.log('Для установки зависимостей плагина выполните команду npm run install_plugins_dep');
	});
}
