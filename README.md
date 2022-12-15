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

```html
<script src="https://unpkg.com/@apideck/vault-js"></script>
```

## Prerequisites

Before opening the Vault modal with vault-js, you need to create a Vault session from your backend using the Vault API or one of our [SDKs](https://docs.apideck.com/sdks). Find out more in the [docs](https://docs.apideck.com/apis/vault/reference#operation/sessionsCreate).

## Usage

Pass the JWT you got from the Vault session to `vault-js`:

```js
import { ApideckVault } from '@apideck/vault-js';

ApideckVault.open({
  token: 'REPLACE_WITH_SESSION_TOKEN',
});
```

If you want to only show integrations for a single Unified API, you can do that by passing the `unifiedApi` option. If you want to open Vault for only a single integration, you can provide the `serviceId` option.

```js
import { ApideckVault } from '@apideck/vault-js';

ApideckVault.open({
  token: 'REPLACE_WITH_SESSION_TOKEN',
  unifiedApi: 'accounting',
  serviceId: 'quickbooks',
});
```

If you want to get notified when the modal opens and closes, you can provide the `onReady` and `onClose` options.

```jsx
import { ApideckVault } from '@apideck/vault-js';

ApideckVault.open({
  token: 'REPLACE_WITH_SESSION_TOKEN',
  onClose: () => {
    console.log('closed!');
  },
  onReady: () => {
    console.log('ready!');
  },
});
```

### Properties

| Property        | Type    | Required | Default | Description                                                                                                                       |
| --------------- | ------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| token           | string  | true     | -       | The JSON Web Token returned from the [Create Session API](https://docs.apideck.com/apis/vault/reference#operation/sessionsCreate) |
| showAttribution | boolean | false    | true    | Show "Powered by Apideck" in the backdrop of the modal backdrop                                                                   |
| onClose         | event   | false    | -       | Function that gets called when the modal is closed                                                                                |
| onReady         | event   | false    | -       | Function that gets called when the modal is opened                                                                                |
| unifiedApi      | string  | false    | -       | When unifiedApi is provided it will only show integrations from that API.                                                         |
| serviceId       | string  | false    | -       | When unifiedApi and serviceId are provided Vault opens a single integration                                                       |
