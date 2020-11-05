const fs = require('fs');
const parser = require('fast-xml-parser');

module.exports = {
  async getProfileName() {
    const pomXml = await new Promise((resolve, reject) => {
      fs.readFile('pom.xml', 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
    const pomJson = parser.parse(pomXml);
    return pomJson.project.groupId;
  },
};
