<img src="https://user-images.githubusercontent.com/8850410/208065819-716c6e02-98c9-4df5-b687-e5acd1e3c4e5.png" width="100%" />

<p align="left">
  <a href="https://www.npmjs.com/package/@apideck/vault-js"><img src="https://img.shields.io/npm/v/@apideck/vault-js.svg" alt="Total Downloads"></a>
  <a href="https://www.npmjs.com/package/@apideck/vault-js"><img src="https://img.shields.io/npm/dw/@apideck/vault-js.svg" alt="Latest Stable Version"></a>
</p>

# Vault JS

A vanilla JavaScript library to embed [Apideck Vault](https://www.apideck.com/products/vault) in any web application.

**Vault JS** | [React Vault](https://github.com/apideck-libraries/vault-react) | [Vue Vault](https://github.com/apideck-libraries/vue-vault)

## Installation

### Package

```sh
npm install @apideck/vault-js
```

### Script

If you don't want to set up a build environment, you can get `@apideck/vault-js` from a CDN like unpkg.com and it will be globally available through the `window.ApideckVault` object.

```html
<script src="https://unpkg.com/@apideck/vault-js"></script>
```

## Prerequisites

Before opening the Vault modal with `@apideck/vault-js`, you need to create a Vault session from your backend using the Vault API or one of our [SDKs](https://docs.apideck.com/sdks). Find out more in the [docs](https://docs.apideck.com/apis/vault/reference#operation/sessionsCreate).

## Usage

Pass the JWT you got from the Vault session to `@apideck/vault-js`:

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

If you want to open a specific view you can pass the `initialView` prop. The available views are `settings`, `configurable-resources`, and `custom-mapping`.

```js
import { ApideckVault } from '@apideck/vault-js';

ApideckVault.open({
  token: 'REPLACE_WITH_SESSION_TOKEN',
  unifiedApi: 'accounting',
  serviceId: 'quickbooks',
  initialView: 'custom-mapping',
});
```

If you want to open vault in a specific language you can pass a locale. The available locales are `en` (default), `nl`, `de`, `fr`, and `es`.

```js
import { ApideckVault } from '@apideck/vault-js';

ApideckVault.open({
  token: 'REPLACE_WITH_SESSION_TOKEN',
  locale: 'nl',
});
```

You can also show a language switch at the bottom of the modal by setting the `showLanguageSwitch` property.

```js
import { ApideckVault } from '@apideck/vault-js';

ApideckVault.open({
  token: 'REPLACE_WITH_SESSION_TOKEN',
  showLanguageSwitch: true,
});
```

If you want to use the button layout instead of the dropdown menu in the TopBar for connection actions, you can set the `showButtonLayout` property.

```js
import { ApideckVault } from '@apideck/vault-js';

ApideckVault.open({
  token: 'REPLACE_WITH_SESSION_TOKEN',
  showButtonLayout: true,
});
```

You can also close the modal programmatically by calling `ApideckVault.close()`.

If you want to show a logo on top of the modal, you can set the `logo` property on the `theme` object you can provide through the session. [View Vault API documentation](https://developers.apideck.com/apis/vault/reference#operation/sessionsCreate).

### Properties

| Property               | Type                             | Required | Default | Description                                                                                                                                      |
| ---------------------- | -------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| token                  | string                           | true     | -       | The JSON Web Token returned from the [Create Session API](https://docs.apideck.com/apis/vault/reference#operation/sessionsCreate)                |
| showAttribution        | boolean                          | false    | true    | Show "Powered by Apideck" in the backdrop of the modal backdrop                                                                                  |
| open                   | () => void                       | false    | -       | Function to open the Vault modal                                                                                                                 |
| close                  | () => void                       | false    | -       | Function to close the Vault modal                                                                                                                |
| onReady                | () => void                       | false    | -       | Function that gets called when the modal is opened                                                                                               |
| onClose                | () => void                       | false    | -       | Function that gets called when the modal is closed                                                                                               |
| onConnectionChange     | (connection: Connection) => void | false    | -       | Function that gets called when the user updates a connection. This can be linking their account, filling out settings or adding a new connection |
| onConnectionDelete     | (connection: Connection) => void | false    | -       | Function that gets called when the user deletes a connection                                                                                     |
| unifiedApi             | string                           | false    | -       | When unifiedApi is provided it will only show integrations from that API.                                                                        |
| serviceId              | string                           | false    | -       | When unifiedApi and serviceId are provided Vault opens a single integration                                                                      |
| showConsumer           | boolean                          | false    | false   | If true it shows the current consumer metadata at the bottom of the modal                                                                        |
| initialView            | ConnectionViewType               | false    | -       | Open Vault in a specific view for a connection: "settings", "configurable-resources", or "custom-mapping"                                        |
| locale                 | string                           | false    | "en"    | Open Vault in a specific language: "en", "nl", "de", "fr" or "es"                                                                                |
| showLanguageSwitch     | boolean                          | false    | false   | Show language switch at bottom                                                                                                                   |
| showButtonLayout       | boolean                          | false    | false   | Use button layout instead of dropdown menu in TopBar for connection actions                                                                      |
| autoStartAuthorization | boolean                          | false    | false   | If true it will automatically start the authorization process for the connection.                                                                |
