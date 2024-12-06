import fs from 'fs';
import { resolve, join } from 'path';
import cp from 'child_process';
import os from 'os';
    
const folder = resolve('plugins/');
    
fs.readdirSync(folder).forEach(function(plugin) {
    const pluginPath = join(folder, plugin);
    
    // ищем в каждом плагине файл package.json
    if (!fs.existsSync(join(pluginPath, 'package.json'))) {
        return;
    }
    
    console.log('Installing plugins dependencies: ', plugin);
    
    // устанавливаем зависимости через npm install
    const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

    cp.spawn(npmCmd, ['i'], {
        env: process.env,
        cwd: pluginPath,
        stdio: 'inherit',
        shell: true
    });
})