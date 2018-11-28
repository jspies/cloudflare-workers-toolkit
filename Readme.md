# Cloudflare Workers Toolkit

This library provides a simple integration to Cloudflare's APIs for resources applicable to [Cloudflare Workers](https://developers.cloudflare.com/workers/about/).

### Installation

```
npm install cloudflare-workers-toolkit
```

### Initialize

```
const cloudflare = require("cloudflare-workers-toolkit");
cloudflare.setAccountId(accountId); // helper that sets an ENV var
cloudflare.setZoneId(zoneId);
```

### Workers

Deploy a worker (will overwrite as well as create)

```
cloudflare.workers.deploy({
  accountId,
  name: "My Worker",
  script: "addEventListener('fetch', event => {
      event.respondWith(new Response(event.request));
    });",
  bindings: []
})
```

```
cloudflare.workers.getSettings()
```

Get all routes for a zone
```
cloudflare.workers.getRoutes
```

### KV Storage Namespaces

```
cloudflare.storage.getNamespaces({accountId})
cloudflare.storage.createNamespace({accountId, name: "namespace name"})
```

### Credentials

Cloudflare worker toolkit requires the following environment variables to be set:

```
CLOUDFLARE_AUTH_EMAIL
CLOUDFLARE_AUTH_KEY
```

Methods optionally take needed additional parameters, such as accountId. However, the following environment variables will be used as a fallback if set.

```
CLOUDFLARE_ACCOUNT_ID
```
