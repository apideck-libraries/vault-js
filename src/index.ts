export interface ApideckVaultOptions {
  token: string;
  unifiedApi?: string;
  serviceId?: string;
  onClose?: () => void;
}

const createApideckVault = () => {
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
    modal.src = 'http://localhost:3000/';

    return modal;
  };

  return {
    open({ onClose, ...options }: ApideckVaultOptions): void {
      const modal = createModal();
      document.body.appendChild(modal);

      window.addEventListener('message', event => {
        if (event.data === 'on-ready') {
          modal.style.display = 'block';
          modal.contentWindow?.postMessage(
            options,
            'https://vaultjs.apideck.com'
          );
        }

        if (event.data === 'on-close') {
          onClose && onClose();

          // Remove the iframe from the DOM after transition animation
          setTimeout(() => {
            modal.style.display = 'none';
            document.body.removeChild(modal);
          }, 300);
        }
      });
    },
  };
};

export const ApideckVault = createApideckVault();
