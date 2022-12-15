export interface ApideckVaultOptions {
  token: string;
  unifiedApi?: string;
  serviceId?: string;
  onClose?: () => void;
  onReady?: () => void;
}

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
    open({ onClose, ...options }: ApideckVaultOptions): void {
      const modal = createModal();
      document.body.appendChild(modal);

      const onMessage = (event: MessageEvent) => {
        if (event.data === 'on-ready') {
          modal.style.display = 'block';
          modal.contentWindow?.postMessage(options, vaultIframeUrl);
        }

        if (event.data === 'on-close') {
          onClose && onClose();

          // Remove the iframe from the DOM after transition animation
          setTimeout(() => {
            document.body.removeChild(modal);
            window.removeEventListener('message', onMessage);
          }, 300);
        }
      };

      window.addEventListener('message', onMessage);
    },
  };
};

export const ApideckVault = createApideckVault();
