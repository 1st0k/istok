import { makeResultError, makeGetSetResultSuccess, UniformFiniteSource, makeGetListResultSuccees } from '../Source';

export const INTENDED_ERROR = 'intended error' as const;
export type IntendedError = typeof INTENDED_ERROR;

export const successSource: UniformFiniteSource<string, IntendedError> = {
  get(id) {
    return Promise.resolve(makeGetSetResultSuccess(id, 'test resource data'));
  },
  set(id, data) {
    return Promise.resolve(makeGetSetResultSuccess(id, data));
  },
  getList() {
    return Promise.resolve(makeGetListResultSuccees([{ id: 'a/1' }]));
  },
};

export const errorSource: UniformFiniteSource<string> = {
  get(id) {
    return Promise.resolve(makeResultError(`${INTENDED_ERROR} "get" with resource ${id}`));
  },
  set(id, _) {
    return Promise.resolve(makeResultError(`${INTENDED_ERROR} "set" with resource ${id}`));
  },
  getList() {
    return Promise.resolve(makeResultError(`${INTENDED_ERROR} "getMany"`));
  },
};
