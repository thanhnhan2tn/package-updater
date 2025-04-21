const { expect } = require('chai');

describe('4. Remote Project Support', () => {
    beforeEach(async () => {
        await browser.url('/');
    });

    it('4.1 clone remote repo on select', async () => {
        const projectTiles = await $$('[data-testid^="project-tile-"]');
        const remoteProject = await projectTiles.find(async (tile) => {
            const path = await tile.$('[data-testid^="project-path-"]');
            const pathText = await path.getText();
            return pathText.includes('github.com') || pathText.includes('gitlab.com');
        });
        
        if (!remoteProject) {
            throw new Error('No remote project found in the list');
        }

        await remoteProject.click();

        const loader = await $('[data-testid="clone-loader"]');
        await loader.waitForDisplayed();
        await loader.waitForDisplayed({ reverse: true }); // Wait for loader to disappear

        const dependencyTable = await $('[data-testid="dependency-table"]');
        await dependencyTable.waitForDisplayed();
    });
});
