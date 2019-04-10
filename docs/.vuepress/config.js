module.exports = {
  title: 'Aloes - IoT Agent',
  base: '/iot-agent/',
  dest: 'public',
  themeConfig: {
    logo: '/logo.png',
    repo: 'https://framagit.org/aloes/iot-agent',
    repoLabel: 'Git',
    docsDir: 'docs',
    nav: [{text: 'Readme', link: '/readme/'}, {text: 'API', link: '/api/'}],
    sidebar: [['/readme/', 'Readme'], ['/api/', 'API']],
    serviceWorker: {
      updatePopup: true, // Boolean | Object, default to undefined.
      // If set to true, the default text config will be:
      updatePopup: {
        message: 'New content is available.',
        buttonText: 'Refresh',
      },
    },
  },
};
