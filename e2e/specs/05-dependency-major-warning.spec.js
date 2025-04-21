const { expect } = require('chai');

describe('5. Safe Upgrade Flow', () => {
    beforeEach(async () => {
        await browser.url('/');
    });

    it('5.1 upgrade packages', async () => {
        const packageRows = await $$('[data-testid^="package-name-"]');
        const firstPackageName = await packageRows[0].getText();
        await $(`[data-testid="package-checkbox-${firstPackageName}"]`).click();

        const applyFixButton = await $('[data-testid="apply-fix-button"]');
        await applyFixButton.click();

        const toast = await $('[data-testid="toast-message"]');
        await toast.waitForDisplayed();
        expect(await toast.getText()).to.include('Upgrade complete');
    });

    it('5.2 upgrade images', async () => {
        const dockerTab = await $('[data-testid="docker-tab"]');
        await dockerTab.click();

        const imageRows = await $$('[data-testid^="image-name-"]');
        const firstImageName = await imageRows[0].getText();
        await $(`[data-testid="image-checkbox-${firstImageName}"]`).click();

        const upgradeImagesButton = await $('[data-testid="upgrade-images-button"]');
        await upgradeImagesButton.click();

        const toast = await $('[data-testid="toast-message"]');
        await toast.waitForDisplayed();
        expect(await toast.getText()).to.include('Images upgraded');
    });
});
