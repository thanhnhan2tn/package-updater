const mockProjects = [
    {
        id: 'project-1',
        name: 'Frontend Project',
        path: '/path/to/frontend',
        type: 'frontend'
    },
    {
        id: 'project-2',
        name: 'Backend Project',
        path: '/path/to/backend',
        type: 'backend'
    },
    {
        id: 'project-3',
        name: 'Remote Project',
        remote: 'https://github.com/user/repo',
        type: 'fullstack'
    },
    {
        id: 'project-4',
        name: 'Empty Project',
        path: '/path/to/empty',
        type: 'frontend'
    }
];

const mockDependencies = {
    'project-1': [
        {
            name: 'react',
            currentVersion: '17.0.0',
            latestVersion: '18.0.0',
            type: 'frontend',
            outdated: true,
            majorUpgrade: true
        },
        {
            name: 'typescript',
            currentVersion: '4.5.0',
            latestVersion: '5.0.0',
            type: 'frontend',
            outdated: true,
            majorUpgrade: true
        }
    ],
    'project-4': [] // Empty project for testing empty state
};

const mockDockerImages = {
    'project-1': [
        {
            name: 'node',
            tag: '14',
            latestTag: '16',
            registry: 'docker.io',
            outdated: true
        },
        {
            name: 'nginx',
            tag: '1.19',
            latestTag: '1.21',
            registry: 'docker.io',
            outdated: true
        }
    ]
};

module.exports = {
    mockProjects,
    mockDependencies,
    mockDockerImages
}; 