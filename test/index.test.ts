import { ApideckVault } from '../src';

describe('ApideckVault', () => {
  let mockIframe: HTMLIFrameElement;

  beforeEach(() => {
    mockIframe = {
      style: {},
      contentWindow: { postMessage: jest.fn() } as any,
    } as HTMLIFrameElement;
    jest.spyOn(document, 'createElement').mockReturnValue(mockIframe);

    jest
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => mockIframe);
  });

  it('should open an iframe with styles', () => {
    ApideckVault.open({ token: 'foo' });

    expect(document.body.appendChild).toHaveBeenCalledWith(mockIframe);

    expect(mockIframe.style).toEqual({
      border: 'none',
      display: 'none',
      height: '100%',
      position: 'fixed',
      left: '0',
      top: '0',
      width: '100%',
      zIndex: '9999',
    });
  });
});
