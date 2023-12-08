import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import {
	appHasWeeklyNotesPluginLoaded,
	createWeeklyNote,
	getAllWeeklyNotes,
	getWeeklyNote,
} from "obsidian-daily-notes-interface";
import { Parameters } from "./types";

// Remember to rename these classes and interfaces!

interface ObsidianReviewSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ObsidianReviewSettings = {
	mySetting: "default",
};

export default class ObsidianReview extends Plugin {
	settings: ObsidianReviewSettings;

	async onload() {
		await this.loadSettings();

		this.registerObsidianProtocolHandler("obsidian-review", async (e) => {
			const parameters = e as unknown as Parameters;

			if (parameters.period == "weekly") {
				if (!appHasWeeklyNotesPluginLoaded()) {
					new Notice("Weekly Notes Plugin is Required!");
					return;
				}

				const noteDate = parameters.date
					? window.moment(parameters.date)
					: window.moment();

				let weeklyNote = await createWeeklyNote(noteDate);
				if (!weeklyNote) {
					weeklyNote = getWeeklyNote(noteDate, getAllWeeklyNotes());
				}

				const { workspace } = this.app;
				const leaf = workspace.getLeaf(false);
				await leaf.openFile(weeklyNote);
			}
		});
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: ObsidianReview;

	constructor(app: App, plugin: ObsidianReview) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
