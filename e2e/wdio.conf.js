/** @type {import('@wdio/cli').Config} */
const chromedriver = require('chromedriver');
const { spawn } = require('child_process');
const { mockProjects, mockDependencies, mockDockerImages } = require('./mocks/mockData');
let frontendProcess;
let backendProcess;

exports.config = {
    runner: 'local',
    specs: ['./specs/**/*.spec.js'],
    maxInstances: 1,
    capabilities: [{
        maxInstances: 1,
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1920,1080'
            ]
        }
    }],
    logLevel: 'error',
    bail: 0,
    baseUrl: 'http://localhost:3000',
    waitforTimeout: 20000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    services: [
        ['chromedriver', {
            chromedriverCustomPath: chromedriver.path,
            args: ['--silent']
        }]
    ],

    // Hooks
    before: async function (capabilities, specs) {
        await browser.setTimeout({ 'implicit': 5000 });
        
        // Setup API mocks
        await browser.mock('/api/projects', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            statusCode: 200,
            body: mockProjects
        });

        await browser.mock('**\/api/dependencies/*', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            statusCode: 200,
            transformResponse: (url) => {
                const projectId = url.split('/').pop();
                return mockDependencies[projectId] || [];
            }
        });

        await browser.mock('**\/api/docker/*', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            statusCode: 200,
            transformResponse: (url) => {
                const projectId = url.split('/').pop();
                return mockDockerImages[projectId] || [];
            }
        });
    },
};
