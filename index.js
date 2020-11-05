/* eslint-disable no-console */
/* eslint-disable func-names */
const core = require('@actions/core');
const nexus = require('./nexus/index');
const maven = require('./maven/index');

(async function () {
  try {
    const profileName = await maven.getProfileName();
    console.log(`ProfileName:${profileName}`);
    const mavenRepoServerUsername = core.getInput('maven-repo-server-username');
    const mavenRepoServerPassword = core.getInput('maven-repo-server-password');
    await nexus.login(mavenRepoServerUsername, mavenRepoServerPassword);
    console.log('Nexus login successfully');
    const repositories = await nexus.repositories();
    console.log('Fetch repositories successfully');
    const targetRepos = repositories.filter((r) => r.profileName === profileName);
    if (!targetRepos || targetRepos.length <= 0) {
      throw new Error(`Repository not found,repositories:${JSON.stringify(repositories)}`);
    }
    if (targetRepos.length > 1) {
      throw new Error(`Repository is duplicated:${JSON.stringify(repositories)}`);
    }
    const repo = targetRepos[0];
    console.log(`Fetch repositorie id:${repo.repositoryId}`);
    await nexus.close(repo.repositoryId);
    console.log('Nexus closing');
    await nexus.closeWait(repo.repositoryId);
    console.log('Nexus closed');
    await nexus.release(repo.repositoryId);
    console.log('Nexus released');
  } catch (error) {
    core.setFailed(error.message);
  }
}());
