/**
 * Helper functions for working with mocks in tests
 */
const { mockProjects, mockDependencies, mockDockerImages } = require('../mocks/mockData');

/**
 * Wait for an API request to complete
 * @param {string} path - The API path to wait for
 * @returns {Promise} - Resolves when the request is complete
 */
async function waitForApiRequest(path) {
    await browser.waitUntil(
        async () => {
            const requests = await browser.mock.calls(path);
            return requests.length > 0;
        },
        {
            timeout: 5000,
            timeoutMsg: `Expected API request to ${path} to be made`
        }
    );
}

/**
 * Get the most recent response for a specific API path
 * @param {string} path - The API path to get the response for
 * @returns {Object} - The response data
 */
async function getLastApiResponse(path) {
    const calls = await browser.mock.calls(path);
    return calls[calls.length - 1].response.body;
}

/**
 * Get mock data for a specific project
 * @param {string} projectId - The project ID to get data for
 * @returns {Object} - The mock data for the project
 */
function getMockDataForProject(projectId) {
    return {
        project: mockProjects.find(p => p.id === projectId),
        dependencies: mockDependencies[projectId] || [],
        dockerImages: mockDockerImages[projectId] || []
    };
}

/**
 * Verify API calls were made for a project
 * @param {string} projectId - The project ID to verify calls for
 */
async function verifyProjectApiCalls(projectId) {
    await waitForApiRequest('/api/projects');
    await waitForApiRequest(`/api/dependencies/${projectId}`);
    await waitForApiRequest(`/api/docker/${projectId}`);
    
    const projectCalls = await browser.mock.calls('/api/projects');
    const dependencyCalls = await browser.mock.calls(`/api/dependencies/${projectId}`);
    const dockerCalls = await browser.mock.calls(`/api/docker/${projectId}`);
    
    expect(projectCalls).to.have.lengthOf.at.least(1);
    expect(dependencyCalls).to.have.lengthOf.at.least(1);
    expect(dockerCalls).to.have.lengthOf.at.least(1);
}

module.exports = {
    waitForApiRequest,
    getLastApiResponse,
    getMockDataForProject,
    verifyProjectApiCalls
}; 