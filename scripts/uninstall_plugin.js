import fs from 'fs';
import stdio from "stdio";

export default async function () {
	const folderName = await stdio.ask('Введите название плагина для удаления');

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
}