const { expect } = require('chai');
const { waitForApiRequest, getLastApiResponse, verifyProjectApiCalls } = require('../helpers/mockHelper');

describe('1. Project List & Navigation', () => {
    beforeEach(async () => {
        await browser.url('/');
    });

    it('1.1 loads projects', async () => {
        const projectList = await $('[data-testid="project-list"]');
        await projectList.waitForDisplayed();
        
        // Verify API call was made and response matches mock data
        await waitForApiRequest('/api/projects');
        const response = await getLastApiResponse('/api/projects');
        expect(response).to.have.lengthOf(4);
        
        const projectTiles = await $$('[data-testid^="project-tile-"]');
        expect(projectTiles).to.have.lengthOf(4);
    });

    it('1.2 switches projects', async () => {
        const projectTiles = await $$('[data-testid^="project-tile-"]');
        const secondProject = projectTiles[1];
        await secondProject.click();

        // Wait for dependency list to reload
        const dependencyTable = await $('[data-testid="dependency-table"]');
        await dependencyTable.waitForDisplayed();
        
        // Verify all API calls were made for the second project
        await verifyProjectApiCalls('project-2');
        
        // Verify project is active
        const isActive = await secondProject.getAttribute('data-active');
        expect(isActive).to.equal('true');
    });
});