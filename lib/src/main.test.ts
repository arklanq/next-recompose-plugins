import * as mainModule from './main';

describe('Library entrypoint (main)', () => {

  test('exports `ConfigBuilder`', () => {
    expect(mainModule).toMatchObject({
      ConfigBuilder: expect.any(Function),
    });
  });

});
