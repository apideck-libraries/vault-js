import { ApideckVaultOptions } from './types';

const createApideckVault = () => {
  const vaultIframeUrl = 'https://vaultjs.apideck.com';
  const createModal = (): HTMLIFrameElement => {
    const modal = document.createElement('iframe');
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.border = 'none';
    modal.style.zIndex = '9999';
    modal.src = vaultIframeUrl;

    return modal;
  };

  return {
    open(options: ApideckVaultOptions): void {
      const {
        onClose,
        onReady,
        onConnectionChange,
        onConnectionDelete,
        ...otherOptions
      } = options;
      const modal = createModal();
      document.body.appendChild(modal);

      const onMessage = (event: MessageEvent) => {
        if (event.data === 'on-ready') {
          modal.style.display = 'block';
          modal.contentWindow?.postMessage(otherOptions, vaultIframeUrl);
          onReady?.();
        }

        if (event.data === 'on-close') {
          onClose?.();

          // Remove the iframe from the DOM after transition animation
          setTimeout(() => {
            document.body.removeChild(modal);
            window.removeEventListener('message', onMessage);
          }, 300);
        }

        if (typeof event.data === 'object' && event.data?.data) {
          switch (event.data?.type) {
            case 'on-connection-change':
              onConnectionChange?.(event.data.data);
              break;
            case 'on-connection-delete':
              onConnectionDelete?.(event.data.data);
              break;
          }
        }
      };

      window.addEventListener('message', onMessage);
    },
  };
};

export * from './types';
export const ApideckVault = createApideckVault();
