const { expect } = require('chai');
const { waitForApiRequest, getLastApiResponse, getMockDataForProject } = require('../helpers/mockHelper');

describe('2. Dependency Tab (NPM Packages)', () => {
    beforeEach(async () => {
        await browser.url('/');
        const dependencyTable = await $('[data-testid="dependency-table"]');
        await dependencyTable.waitForDisplayed();
        
        // Wait for initial API calls
        await waitForApiRequest('/api/projects');
        await waitForApiRequest('/api/dependencies/project-1');
    });

    it('2.1 renders current vs latest versions', async () => {
        const mockData = getMockDataForProject('project-1');
        const packageRows = await $$('[data-testid^="package-name-"]');
        expect(packageRows).to.have.lengthOf(mockData.dependencies.length);

        const firstPackage = mockData.dependencies[0];
        const firstPackageName = await packageRows[0].getText();
        expect(firstPackageName).to.equal(firstPackage.name);

        const currentVersion = await $(`[data-testid="current-version-${firstPackageName}"]`);
        const latestVersion = await $(`[data-testid="latest-version-${firstPackageName}"]`);
        
        expect(await currentVersion.getText()).to.equal(firstPackage.currentVersion);
        expect(await latestVersion.getText()).to.equal(firstPackage.latestVersion);
    });

    it('2.2 check single package', async () => {
        const mockData = getMockDataForProject('project-1');
        const firstPackage = mockData.dependencies[0];
        const packageRows = await $$('[data-testid^="package-name-"]');
        const firstPackageName = await packageRows[0].getText();
        expect(firstPackageName).to.equal(firstPackage.name);

        const checkButton = await $(`[data-testid="check-package-button-${firstPackageName}"]`);
        await checkButton.click();

        const toast = await $('[data-testid="toast-message"]');
        await toast.waitForDisplayed();
        expect(await toast.getText()).to.include('Package checked');
    });

    it('2.3 bulk-select & check', async () => {
        const mockData = getMockDataForProject('project-1');
        const packageRows = await $$('[data-testid^="package-name-"]');
        const firstPackage = mockData.dependencies[0];
        const secondPackage = mockData.dependencies[1];

        const firstPackageName = await packageRows[0].getText();
        const secondPackageName = await packageRows[1].getText();
        expect(firstPackageName).to.equal(firstPackage.name);
        expect(secondPackageName).to.equal(secondPackage.name);

        await $(`[data-testid="package-checkbox-${firstPackageName}"]`).click();
        await $(`[data-testid="package-checkbox-${secondPackageName}"]`).click();

        const bulkCheckButton = await $('[data-testid="bulk-check-button"]');
        await bulkCheckButton.click();

        const toast = await $('[data-testid="toast-message"]');
        await toast.waitForDisplayed();
        expect(await toast.getText()).to.include('checked');
    });
});
