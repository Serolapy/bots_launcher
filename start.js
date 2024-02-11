import fs from 'fs';

const folders = ['plugins', 'logs', 'backups'];		//папки, которые необходдимо обязательно создать
folders.forEach((folder) => {
	if (!fs.existsSync(folder)){
		fs.mkdirSync(folder);
	}
});

global.debug = false;
if(process.argv[2] !== undefined && process.argv[2] === 'debug'){
	global.debug = true;
}