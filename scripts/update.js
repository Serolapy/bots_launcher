import { exec } from 'child_process';

exec(`git pull`, (error, stdout) => {
	if (error) {
		console.error(`Ошибка при обновлении приложения: ${error.message}`);
		return;
	}
	console.log(`Приложение обновлено`);
	console.log(stdout);
});