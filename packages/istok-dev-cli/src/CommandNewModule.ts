import path from 'path';
import fs from 'fs-extra';

/*
  Must be executed from the 
*/
export function copyTemplate(src: string, dest: string) {
  return fs
    .copy(src, dest)
    .catch(error => ({
      type: 'error',
      error,
    }))
    .then(result => ({
      type: 'ok',
      result,
    }));
}

export function newModule(name: string) {
  const selfRoot = process.argv[1].replace(/bin\.js$/, '');
  const templatesRoot = path.resolve(selfRoot, 'templates/module');
  const modulesRoot = path.resolve(process.cwd(), 'packages');
  const newModuleRoot = path.resolve(modulesRoot, name);

  console.log('self root', selfRoot);

  try {
    const isDirectoryExist = fs.statSync(newModuleRoot).isDirectory();
    if (isDirectoryExist) {
      return {
        type: 'error',
        error: `Directory with module ${name} is already exist.`,
      };
    }
  } catch (e) {}

  return copyTemplate(templatesRoot, path.resolve(newModuleRoot));
}
