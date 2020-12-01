import path from 'path';

export const MOCK_RESOURCES_ROOT = path.resolve(__dirname, '../mocks/resources');
export const mockResourcesPath = (folder: string) => path.resolve(__dirname, '../mocks', folder);
