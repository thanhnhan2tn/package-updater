const { mockProjects, mockDependencies, mockDockerImages } = require('./mockData');

class MockService {
    static setup(browser) {
        browser.addCommand('setupMocks', async function () {
            await browser.execute(() => {
                const originalFetch = window.fetch;
                window.fetch = async function (url, options) {
                    if (url.includes('/api/projects')) {
                        return new Response(JSON.stringify(window.mockProjects), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    if (url.includes('/api/dependencies')) {
                        const projectId = url.split('/').pop();
                        return new Response(JSON.stringify(window.mockDependencies[projectId] || []), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    if (url.includes('/api/docker')) {
                        const projectId = url.split('/').pop();
                        return new Response(JSON.stringify(window.mockDockerImages[projectId] || []), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    return originalFetch(url, options);
                };
            });

            // Inject mock data into browser context
            await browser.execute((projects, dependencies, images) => {
                window.mockProjects = projects;
                window.mockDependencies = dependencies;
                window.mockDockerImages = images;
            }, mockProjects, mockDependencies, mockDockerImages);
        });
    }
}

module.exports = MockService; 