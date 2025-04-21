const { expect } = require('chai');
const { waitForApiRequest, getLastApiResponse, getMockDataForProject } = require('../helpers/mockHelper');

describe('3. Docker Images Tab', () => {
    beforeEach(async () => {
        await browser.url('/');
        const dockerTab = await $('[data-testid="docker-tab"]');
        await dockerTab.click();
        await $('[data-testid="docker-images-table"]').waitForDisplayed();
        
        // Wait for initial API calls
        await waitForApiRequest('/api/projects');
        await waitForApiRequest('/api/docker/project-1');
    });

    it('3.1 renders images list', async () => {
        const mockData = getMockDataForProject('project-1');
        const imageRows = await $$('[data-testid^="image-name-"]');
        expect(imageRows).to.have.lengthOf(mockData.dockerImages.length);

        const firstImage = mockData.dockerImages[0];
        const firstImageName = await imageRows[0].getText();
        expect(firstImageName).to.equal(firstImage.name);

        const currentTag = await $(`[data-testid="current-tag-${firstImageName}"]`);
        const latestTag = await $(`[data-testid="latest-tag-${firstImageName}"]`);
        
        expect(await currentTag.getText()).to.equal(firstImage.tag);
        expect(await latestTag.getText()).to.equal(firstImage.latestTag);
    });

    it('3.2 check single image', async () => {
        const mockData = getMockDataForProject('project-1');
        const firstImage = mockData.dockerImages[0];
        const imageRows = await $$('[data-testid^="image-name-"]');
        const firstImageName = await imageRows[0].getText();
        expect(firstImageName).to.equal(firstImage.name);

        const checkButton = await $(`[data-testid="check-image-button-${firstImageName}"]`);
        await checkButton.click();

        const toast = await $('[data-testid="toast-message"]');
        await toast.waitForDisplayed();
        expect(await toast.getText()).to.include('Image checked');
    });

    it('3.3 bulk-select & check images', async () => {
        const mockData = getMockDataForProject('project-1');
        const imageRows = await $$('[data-testid^="image-name-"]');
        const firstImage = mockData.dockerImages[0];
        const secondImage = mockData.dockerImages[1];

        const firstImageName = await imageRows[0].getText();
        const secondImageName = await imageRows[1].getText();
        expect(firstImageName).to.equal(firstImage.name);
        expect(secondImageName).to.equal(secondImage.name);

        await $(`[data-testid="image-checkbox-${firstImageName}"]`).click();
        await $(`[data-testid="image-checkbox-${secondImageName}"]`).click();

        const bulkCheckButton = await $('[data-testid="bulk-check-images-button"]');
        await bulkCheckButton.click();

        const toast = await $('[data-testid="toast-message"]');
        await toast.waitForDisplayed();
        expect(await toast.getText()).to.include('checked');
    });
});
