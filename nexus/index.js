const axios = require('axios').default;
const cookie = require('cookie');

const COMMON_HEADERS = {
  Accept: 'application/json,application/vnd.siesta-error-v1+json,application/vnd.siesta-validation-errors-v1+json',
  Referer: ' https://oss.sonatype.org/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
  'X-nexus-ui': 'true',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Nexus {
  async login(username, password) {
    const result = await axios.get(`https://oss.sonatype.org/service/local/authentication/login?_dc=${new Date().getTime()}`,
      {
        headers: {
          ...COMMON_HEADERS,
          Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        },
      });
    this.cookie = `NXSESSIONID=${cookie.parse(result.headers['set-cookie'][0]).NXSESSIONID}`;
  }

  async repositories() {
    const result = await axios.get(`https://oss.sonatype.org/service/local/staging/profile_repositories?_dc=${new Date().getTime()}`,
      {
        headers: {
          ...COMMON_HEADERS,
          Cookie: this.cookie,
        },
      });
    return result.data.data;
  }

  async close(repositoryId) {
    await axios.post('https://oss.sonatype.org/service/local/staging/bulk/close',
      { data: { description: '', stagedRepositoryIds: [repositoryId] } },
      {
        headers: {
          ...COMMON_HEADERS,
          'Content-Type': 'application/json',
          Cookie: this.cookie,
        },
      });
  }

  async closeWait(repositoryId) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(60000);
      // eslint-disable-next-line no-await-in-loop
      const result = await axios.get(`https://oss.sonatype.org/service/local/staging/repository/${repositoryId}/activity?_dc=${new Date().getTime()}`, {
        headers: {
          ...COMMON_HEADERS,
          Cookie: this.cookie,
        },
      });
      const closeEvents = result.data.filter((e) => e.name === 'close')[0].events;
      const failEvents = closeEvents.filter((e) => e.name === 'ruleFailed');
      if (failEvents.length) {
        throw new Error('Nexus close failed:', JSON.stringify(failEvents));
      }
      if (closeEvents[closeEvents.length - 1].name === 'repositoryClosed') {
        break;
      }
    }
  }

  async release(repositoryId) {
    await axios.post('https://oss.sonatype.org/service/local/staging/bulk/promote',
      { data: { autoDropAfterRelease: true, description: '', stagedRepositoryIds: [repositoryId] } },
      {
        headers: {
          ...COMMON_HEADERS,
          'Content-Type': 'application/json',
          Cookie: this.cookie,
        },
      });
  }
}

module.exports = new Nexus();
