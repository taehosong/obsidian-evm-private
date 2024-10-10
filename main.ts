import { App, Modal, Plugin, Setting } from "obsidian";
import { HDNodeWallet, Wallet } from "ethers";

export default class MyPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor(
			"evm-private",
			async (source, el, ctx) => {
        const encrypted = JSON.parse(source);
        const div = el.createEl('div');
        // div.createEl('span').setText(encrypted.address)

				const button = div.createEl("button");
				button.setText("PrivateKey Decrypt");
				button.addEventListener("click", () => {
					new PrivateKeyModal(this.app)
						.setEncryptedKey(source)
						.open();
				});
			}
		);

		this.registerMarkdownCodeBlockProcessor(
			"evm-seed",
			async (source, el, ctx) => {
        const encrypted = JSON.parse(source);
        const div = el.createEl('div');
        // div.createEl('span').setText(encrypted.address)
        
				const button = div.createEl("button");
				button.setText("Seed Decrypt");
				button.addEventListener("click", () => {
					new SeedModal(this.app)
						.setEncryptedKey(source)
						.open();
				});
			}
		);

	}

	onunload() {}
}

class InputPasswordModal extends Modal {
	protected encryptedKey: string;

	constructor(app: App) {
		super(app);
	}

	setEncryptedKey(key: string) {
		this.encryptedKey = key;
		return this;
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class PrivateKeyModal extends InputPasswordModal {
	onOpen() {
		const { contentEl } = this;
		const password = contentEl.createEl("input", {
			placeholder: "password",
			type: "password",
		});
		const button = contentEl.createEl("button");
		button.setText("확인");
		button.addEventListener("click", () => {
			Wallet.fromEncryptedJson(this.encryptedKey, password.value)
				.then((wallet) => {
					new Setting(contentEl)
						.setName("Address")
						.setDesc("Address")
						.addText((text) => text.setValue(wallet.address));
					new Setting(contentEl)
						.setName("Private Key")
						.setDesc("Private Key")
						.addText((text) => text.setValue(wallet.privateKey));
				})
				.catch((e) => {
					contentEl.setText(e.message);
				});
		});
	}
}

class SeedModal extends InputPasswordModal {
	onOpen() {
		const { contentEl } = this;
		const password = contentEl.createEl("input", {
			placeholder: "password",
			type: "password",
		});
		const button = contentEl.createEl("button");
		button.setText("확인");
		button.addEventListener("click", () => {
			Wallet.fromEncryptedJson(this.encryptedKey, password.value)
				.then((wallet: HDNodeWallet) => {
					const mnemonic = wallet.mnemonic?.phrase;
					if (!mnemonic) {
						contentEl.setText("Invalid wallet");
						return;
					}
					new Setting(contentEl)
						.setName("Seed")
						.setDesc("Seed")
						.addText((text) => text.setValue(mnemonic));

					for (let i = 0; i < 3; i++) {
						const wallet1 = wallet.deriveChild(i);
						new Setting(contentEl)
							.setName("Address")
							.setDesc("Address")
							.addText((text) => text.setValue(wallet1.address));
						new Setting(contentEl)
							.setName("Private Key")
							.setDesc("Private Key")
							.addText((text) =>
								text.setValue(wallet1.privateKey)
							);
					}

					// new Setting(contentEl)
					// 	.setName("Address")
					// 	.setDesc("Address")
					// 	.addText((text) => text.setValue(wallet.address));
					// new Setting(contentEl)
					// 	.setName("Private Key")
					// 	.setDesc("Private Key")
					// 	.addText((text) => text.setValue(wallet.privateKey));
				})
				.catch((e) => {
					contentEl.setText(e.message);
				});
		});
	}
}
