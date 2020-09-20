import path from 'path';
import fs from 'fs-extra';

/*
  Must be executed from the projet's root folder
*/
export async function copyTemplate(template: string, dest: string) {
  const selfRoot = process.argv[1].replace(/bin\.js$/, '');
  const templatesRoot = path.resolve(selfRoot, 'templates');
  const templateRoot = path.resolve(templatesRoot, template);

  try {
    // We can't await Promise.all because copy of a directory failing with "EEXIST"
    // It is because the directory is created by copy of a single file
    await fs.copy(templateRoot, dest);
    await Promise.all([fs.copy(path.resolve(templatesRoot, 'tsconfig.json'), path.resolve(dest, 'tsconfig.json'))]);

    return { type: 'ok', result: `Created new module from "${template}" template at "${dest}".` };
  } catch (error) {
    return {
      type: 'error',
      error,
    };
  }
}

export async function newModule(name: string) {
  const modulesRoot = path.resolve(process.cwd(), 'packages');
  const newModuleRoot = path.resolve(modulesRoot, 'istok-' + name);

  try {
    const isDirectoryExist = fs.statSync(newModuleRoot).isDirectory();
    if (isDirectoryExist) {
      return {
        type: 'error',
        error: `Directory with module ${name} is already exist.`,
      };
    }
  } catch (e) {}

  const result = await copyTemplate('module', path.resolve(newModuleRoot));

  return result;
}
