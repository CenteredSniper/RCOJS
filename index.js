const fs = require("fs")
const request = require('request')
const prompt = require("prompt-sync")({ sigint: true });

const ProgramFilesPath = "C:/Program Files (x86)/Roblox/Versions"
const AppDataPath = process.env.APPDATA + "/../Local/Roblox/Versions"
const FPSPrompt = prompt("Set FPS as: ");
const QuickGameLaunch = prompt("Enable QuickGameLaunch: ");
const Vulkan = prompt("Enable Vulkan: ");

var isElevated;
var ClientAppSettings

{ // Check Elevation
	try {
	    child_process.execFileSync( "net", ["session"], { "stdio": "ignore" } );
	    isElevated = true;
	}
	catch ( e ) {
	    isElevated = false;
	}
}

function getDirectories(path) {
	return fs.readdirSync(path).filter(function (file) {
		return fs.statSync(path+'/'+file).isDirectory() && fs.existsSync(path+'/'+file + "/RobloxPlayerLauncher.exe");
	});
}

function AddRCO(Path) {
	getDirectories(Path).forEach(element => {
		if (!fs.existsSync(Path + "/" + element + "/ClientSettings")){
			fs.mkdirSync(Path + "/" + element + "/ClientSettings", { recursive: true })
			console.log('Created Folder in ' + element);
		}

		fs.writeFile(Path + "/" + element + "/ClientSettings/ClientAppSettings.json", ClientAppSettings, function (err) {
			if (err) throw err;               
			console.log('Created File in ' + element);
		  }); 
	});
}

function CheckIfTrue(Value) {
	return Value == "y" || Value == "yes" || Value == "n" && false || Value == "no" && false || Value == "true" || Value == "false" && false || false
}

request('https://roblox-client-optimizer.simulhost.com/ClientAppSettings.json', function (error, response, body) {
	if (!error && response.statusCode == 200) {
		ClientAppSettings = JSON.parse(body)

		let FPS = FPSPrompt && !isNaN(FPSPrompt) && Math.round(Number(FPSPrompt)) || 240
		ClientAppSettings.DFIntTaskSchedulerTargetFps = FPS

		if (CheckIfTrue(QuickGameLaunch)) {
			ClientAppSettings.QuickGameLaunch = true
		}
		

		if (CheckIfTrue(Vulkan)) {
			ClientAppSettings.FFlagDebugGraphicsPreferD3D11 = false
			ClientAppSettings.FFlagDebugGraphicsPreferD3D11FL10 = false
			ClientAppSettings.FFlagDebugGraphicsPreferOpenGL = false
			ClientAppSettings.FFlagDebugGraphicsPreferVulkan = true
			ClientAppSettings.FFlagDebugGraphicsDisableDirect3D11 = true
		}

		ClientAppSettings = JSON.stringify(ClientAppSettings, null, "\t")

		if (isElevated) {
			AddRCO(ProgramFilesPath)
		}; AddRCO(AppDataPath)

	} else {
		console.log(error)
	}
})
