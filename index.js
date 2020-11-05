/* eslint-disable no-console */
/* eslint-disable func-names */
const core = require('@actions/core');
const nexus = require('./nexus/index');
const maven = require('./maven/index');

(async function () {
  try {
    const profileName = await maven.getProfileName();
    console.log(`profileName:${profileName}`);
    const mavenRepoServerUsername = core.getInput('maven-repo-server-username');
    const mavenRepoServerPassword = core.getInput('maven-repo-server-password');
    await nexus.login(mavenRepoServerUsername, mavenRepoServerPassword);
    console.log('nexus login successfully');
    const repositories = await nexus.repositories();
    console.log('fetch repositories successfully');
    const targetRepos = repositories.filter((r) => r.profileName === profileName);
    if (targetRepos && targetRepos.length) {
      const repo = targetRepos[0];
      console.log(`fetch repositorie id:${repo.repositoryId}`);
      await nexus.close(repo.repositoryId);
      console.log('nexus closing');
      await nexus.closeWait(repo.repositoryId);
      console.log('nexus closed');
      await nexus.release(repo.repositoryId);
      console.log('nexus released');
    } else {
      throw new Error(`repositorie not found,repositories:${JSON.stringify(repositories)}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}());
