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

  let modal: HTMLIFrameElement | null = null;

  return {
    open(options: ApideckVaultOptions): void {
      const {
        onClose,
        onReady,
        onConnectionChange,
        onConnectionDelete,
        ...otherOptions
      } = options;

      modal = createModal();

      document.body.appendChild(modal);

      const onMessage = (event: MessageEvent) => {
        if (modal === null) return;

        if (event.data === 'on-ready') {
          modal.style.display = 'block';
          modal.contentWindow?.postMessage(otherOptions, vaultIframeUrl);
          onReady?.();
        }

        if (event.data === 'on-close') {
          onClose?.();
          window.removeEventListener('message', onMessage);

          // Remove the iframe from the DOM after transition animation
          setTimeout(() => {
            if (modal === null) return;

            document.body.removeChild(modal);
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
    close(): any {
      if (modal === null) return;
      modal?.contentWindow?.postMessage({ type: 'close' }, vaultIframeUrl);

      // Remove the iframe from the DOM after transition animation
      setTimeout(() => {
        if (modal === null) return;
        document.body.removeChild(modal);
        modal = null;
      }, 300);
    },
  };
};

export { ApideckVaultOptions, Connection } from './types';
export const ApideckVault = createApideckVault();
