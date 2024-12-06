import fs from 'fs';

if(process.argv[2] === undefined){
	console.error("Нет аргумента для запуска");
	process.exit(1);	
}

const folderName = process.argv[2];

try {
	if (fs.existsSync(`plugins/${folderName}`)) {
		fs.rmSync(`plugins/${folderName}`, { recursive: true, force: true });
		console.error(`Плагин был удалён`);
	}
	else {
		console.error(`Плагин не найден`);
	}
} catch (error) {
	console.error(`Ошибка при удалении плагина: ${error.message}`);
}