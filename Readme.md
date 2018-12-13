# Cloudflare Workers Toolkit

This library provides a simple integration to Cloudflare's APIs for resources applicable to [Cloudflare Workers](https://developers.cloudflare.com/workers/about/).

### Multiscript versus Single Script

There are some subtle and not so subtle differences between Cloudflare accounts with multiscript enabled or not. By default, a standard Cloudflare account has single script enabled and an enterprise account has multi script enabled.

The subtle difference has to do with whether you deploy scripts by account or zone. The worker scripts take either an accountId (multi script) or zoneId (single script). When using an accountId, you must also specify a name for the script. You do not need to name a single script (zoneId) worker.

The not so subtle difference is that single script accounts use filters and multi script accounts use routes. Routes and Filters both use a URL pattern to control worker behavior. The difference is that filters control whether the single worker runs or doesn't run, whereas routes control which worker script is run.

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

### Routes

Get all routes for a zone
```
cloudflare.routes.getRoutes({zoneId})
```

Remove a route
```
cloudflare.routes.remove({zoneId, routeId})
```

### KV Storage Namespaces

```
cloudflare.storage.getNamespaces({accountId})
cloudflare.storage.createNamespace({accountId, name: "namespace name or id"})
cloudflare.storage.removeNamespace({accountId, name: "namespace name or id"})
```

Once you created name space you can set/query/delete keys value pairs into the namespace

```
cloudflare.kv.getKeys({accountId, nameSpace: "name space name or id"}) // Return a list of keys in [{name: 'key name'},...] format
cloudflare.kv.getKeyValue({accountId, nameSpace: "name space name or id", key: "key-name"}) // Return a key value
cloudflare.kv.getAllKeysAndValues({accountId, nameSpace: "name space name or id"}) // Return a list of keys and values in format [{name: 'key name', value: 'value'},...] format
cloudflare.kv.setKeyValue({accountId, nameSpace: "name space name or id", key: "key-name", value: 'value'})
cloudflare.kv.deleteKey({accountId, nameSpace: "name space name or id", key: "key-name"})
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
