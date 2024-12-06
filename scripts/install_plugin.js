import { exec } from 'child_process';
import fs from 'fs';

if(process.argv[2] === undefined){
	console.error("Нет аргумента для запуска");
	process.exit(1);	
}

const repoUrl = process.argv[2];

// Определяем имя папки, в которую будет клонирован репозиторий
// Используем последний сегмент URL без .git как имя папки
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