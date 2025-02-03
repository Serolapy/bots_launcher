/**
 * Прокидываем классы в global.classes[]
 */
import 'colors';

import Plugin from "./Plugin.js"

export default function (){
	global.classes = {
		'Plugin' : Plugin,
	}
	
	console.log(`[ classes/index.js ]`.blue, `Определены следующие классы: ${Object.keys(global.classes).join(', ')}`)
}