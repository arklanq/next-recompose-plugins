import {isAsyncConfigFactorySupported} from './isAsyncConfigFactorySupported';

describe('isAsyncConfigFactorySupported()', () => {
  describe('returns boolean based on `next` package version', () => {
    test('`false` when <12.1', () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.0.0'}));
        expect(isAsyncConfigFactorySupported()).toBe(false);
      });
    });

    test('`true` when >=12.1', () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.1.0'}));
        expect(isAsyncConfigFactorySupported()).toBe(true);
      });
    });
  });
});
