module.exports = {
    branches: [{ name: 'pre-main' }],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
        ['@semantic-release/npm', { npmPublish: true, pkgRoot: 'plugin' }],
        [
            '@semantic-release/github',
            {
                successComment: false,
                failComment: false,
                releasedLabels: [
                    // eslint-disable-next-line max-len
                    'released<%= nextRelease.channel ? ` on ${nextRelease.channel}@${nextRelease.version}` : "" %> from <%= branch.name %>',
                ],
            },
        ],
        [
            '@semantic-release/git',
            {
                assets: ['build/**/*.js', 'CHANGELOG.md'],
                message: 'chore(release): set `package.json` to ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
            },
        ],
    ],
}
