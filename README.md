# Vault JS

A vanilla JavaScript library to embed [Apideck Vault](https://www.apideck.com/products/vault) in any web application.

Looking for a framework specific package?

- [React Vault](https://github.com/apideck-libraries/react-vault)
- [Vue Vault](https://github.com/apideck-libraries/vue-vault)

## Installation

### Package

```sh
npm install @apideck/vault-js
```

### Script

If you don't want to set up a build environment, you can get vault-js from a CDN like unpkg.com and it will be globally available through the `window.ApideckVault` object.

```
<script src="https://unpkg.com/@apideck/vault-js"></script>
```

## Prerequisites

Before opening the Vault modal with vault-js, you need to create a Vault session from your backend using the Vault API or one of our SDKs. Find out more [here]().

## Usage

Pass the JWT you got from the Vault session to the vault-js:

```js
import { ApideckVault } from '@apideck/vault-js';

ApideckVault.open({
  token: jwtSessionToken
})
```

If you want to scope the connection results to a single Unified API, you can do that by giving the `unifiedApi` prop. If you want to open Vault for only a single connector, you should also provide the `serviceId`.

```js
import { Vault } from '@apideck/react-vault';

const MyComponent = () => {
  return (
    <Vault
      token="REPLACE_WITH_SESSION_TOKEN"
      unifiedApi="accounting"
      serviceId="quickbooks"
      trigger={<button>Open Vault</button>}
    />
  );
};

export default MyComponent;
```

If you want to get notified when the modal opens and closes, you can provide the `onReady` and `onClose` options.

```jsx
import { Button } from '@apideck/components';
import { Vault } from '@apideck/react-vault';
import { useState } from 'react';

const VaultButton = ({ token }) => {
  const [openVault, setOpenVault] = useState(false);

  const toggleVault = () => {
    setOpenVault(!openVault);
  };

  return (
    <div className="flex items-center space-x-3">
      <Button text="Open Vault" onClick={toggleVault} />
      <Vault token={token} open={openVault} onClose={toggleVault} />
    </div>
  );
};

export default VaultButton;
```

### Properties

| Property        | Type    | Required | Default | Description                                                                                                                                       |
| --------------- | ------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| token           | string  | true     | -       | The JSON Web Token returned from the Create Session call                                                                                          |
| trigger         | element | false    | -       | The component that should trigger the Vault modal on click                                                                                        |
| showAttribution | boolean | false    | true    | Show "Powered by Apideck" in the backdrop of the modal backdrop                                                                                   |                                                                                                     |
| onClose         | event   | false    | -       | Function that gets called when the modal is closed                                                                                                |
| unifiedApi      | string  | false    | -       | When unifiedApi is provided it will scope the connection results to that API. If also a serviceId is provided Vault opens for a single connection |
| serviceId       | string  | false    | -       | When unifiedApi and serviceId are provided Vault opens a single connection                                                                        |
