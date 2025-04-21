module.exports = {
    validProjectId: 'project-1',
    emptyProjectId: 'project-4',
    expectedProjectCount: 4,
    expectedDependenciesCount: {
        'project-1': 2,
        'project-4': 0
    },
    expectedDockerImagesCount: {
        'project-1': 2
    }
}; 