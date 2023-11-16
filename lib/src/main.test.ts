import * as module_main from './main';

describe('Library entrypoint (main)', () => {
  test('exports `Config`', () => {
    expect(module_main).toMatchObject({
      Config: expect.any(Function), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    });
  });
});
