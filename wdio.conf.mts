import * as path from "path";
import { env } from "process";
import {
	obsidianBetaAvailable,
	parseObsidianVersions,
} from "wdio-obsidian-service";

// wdio-obsidian-service will download Obsidian versions into this directory
const cacheDir = path.resolve(".obsidian-cache");

// choose Obsidian versions to test
let defaultVersions = "earliest/earliest latest/latest";
if (await obsidianBetaAvailable({ cacheDir })) {
	defaultVersions += " latest-beta/latest";
}
const desktopVersions = await parseObsidianVersions(
	env.OBSIDIAN_VERSIONS ?? defaultVersions,
	{ cacheDir },
);
const mobileVersions = await parseObsidianVersions(
	env.OBSIDIAN_MOBILE_VERSIONS ?? defaultVersions,
	{ cacheDir },
);
if (env.CI) {
	// Print the resolved Obsidian versions to use as the workflow cache key
	// (see .github/workflows/test.yaml)
	console.log("obsidian-cache-key:", JSON.stringify([desktopVersions]));
}

export const config: WebdriverIO.Config = {
	runner: "local",
	framework: "mocha",
	specs: ["./test/specs/**/*.e2e.ts"],
	// How many instances of Obsidian should be launched in parallel
	maxInstances: 1,

	// "matrix" to test your plugin on multiple Obsidian versions and with emulateMobile
	capabilities: [
		...desktopVersions.map<WebdriverIO.Capabilities>(
			([appVersion, installerVersion]) => ({
				browserName: "obsidian",
				"wdio:obsidianOptions": {
					appVersion,
					installerVersion,
					plugins: ["."],
					// If you need to switch between multiple vaults, you can omit this and
					// use `reloadObsidian` to open vaults during the test.
					vault: "test/vault",
				},
			}),
		),
		...mobileVersions.map<WebdriverIO.Capabilities>(
			([appVersion, installerVersion]) => ({
				browserName: "obsidian",
				"wdio:obsidianOptions": {
					appVersion,
					installerVersion,
					emulateMobile: true,
					plugins: ["."],
					// If you need to switch between multiple vaults, you can omit this and
					// use `reloadObsidian` to open vaults during the test.
					vault: "test/vault",
				},
				"goog:chromeOptions": {
					mobileEmulation: {
						// can also set deviceName: "iPad" etc. instead of hard-coding size.
						// If you have issues getting click events etc. to work properly, try
						// setting `touch: false` here.
						deviceMetrics: { width: 390, height: 844 },
					},
				},
			}),
		),
	],

	services: ["obsidian"],
	// You can use any wdio reporter, but they show the Chromium version
	// instead of the Obsidian version. obsidian reporter just wraps
	// spec reporter to show the Obsidian version.
	reporters: ["obsidian"],

	cacheDir,
	mochaOpts: {
		ui: "bdd",
		timeout: 60000,
		// You can set mocha settings like "retry" and "bail"
	},
	logLevel: "warn",
};
