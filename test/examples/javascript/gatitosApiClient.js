(function (root, client) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['popsicle'], client);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but only CommonJS-like
    // environments that support `module.exports`, like Node.
    module.exports = client(require('popsicle'));
  } else {
    // Browser globals (root is window).
    root.GatitosApi = client(root.popsicle);
  }
})(this, function (popsicle) {
  var TEMPLATE_REGEXP = /\{([^\{\}]+)\}/g;

  /**
   * @param  {String} string
   * @param  {Object} interpolate
   * @param  {Object} defaults
   * @return {String}
   */
  function template (string, interpolate, defaults) {
    defaults    = defaults || {};
    interpolate = interpolate || {};

    return string.replace(TEMPLATE_REGEXP, function (match, key) {
      if (interpolate[key] != null) {
        return encodeURIComponent(interpolate[key]);
      }

      if (defaults[key] != null) {
        return encodeURIComponent(defaults[key]);
      }

      return '';
    });
  }

  /**
   * @param  {Object} dest
   * @param  {Object} ...source
   * @return {Object}
   */
  function extend (dest /*, ...source */) {
    for (var i = 1; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        dest[key] = arguments[i][key];
      }
    }

    return dest;
  }

  function handleRequest (client, path, method, body, options) {
    options = extend({}, client.options, options);

    var baseUri = template(options.baseUri, options.baseUriParameters);
    var reqOpts = {};

    reqOpts.url     = baseUri.replace(/\/$/, '') + path;
    reqOpts.method  = method;
    reqOpts.headers = extend({}, options.headers);

    if (method === 'GET' || method === 'HEAD') {
      reqOpts.body = options.body;
      reqOpts.query = body == null ? options.query : body;
    } else {
      reqOpts.body = body == null ? options.body : body;
      reqOpts.query = options.query;
    }

    if (options.user && typeof options.user.sign === 'function') {
      options.user.sign(reqOpts);
    }

    return client.request(reqOpts);
  }

  function Resource0 (uri, client) {
    this._uri    = uri;
    this._client = client;

    this.cats = new Resource1(uri + '/cats', client);
    this.settings = new Resource6(uri + '/settings', client);
    this.arrayprimitives = new Resource8(uri + '/arrayprimitives', client);
  };


  function Resource1 (uri, client) {
    this._uri    = uri;
    this._client = client;

  };

  Resource1.prototype.catId = function (/* ...args */) {
    var uri = this._uri + template('/{0}', arguments, [undefined]);

    return new Resource2(uri, this._client);
  };

  Resource1.prototype.get = function (body, options) {
    return handleRequest(this._client, this._uri, 'GET', body, options);
  };
  Resource1.prototype.post = function (body, options) {
    return handleRequest(this._client, this._uri, 'POST', body, options);
  };
  function Resource2 (uri, client) {
    this._uri    = uri;
    this._client = client;

    this.mapping = new Resource3(uri + '/mapping', client);
    this.picture = new Resource4(uri + '/picture', client);
    this.webFormCat = new Resource5(uri + '/webFormCat', client);
  };


  Resource2.prototype.get = function (body, options) {
    return handleRequest(this._client, this._uri, 'GET', body, options);
  };
  Resource2.prototype.put = function (body, options) {
    return handleRequest(this._client, this._uri, 'PUT', body, options);
  };
  function Resource3 (uri, client) {
    this._uri    = uri;
    this._client = client;

  };


  Resource3.prototype.get = function (body, options) {
    return handleRequest(this._client, this._uri, 'GET', body, options);
  };
  function Resource4 (uri, client) {
    this._uri    = uri;
    this._client = client;

  };


  Resource4.prototype.post = function (body, options) {
    return handleRequest(this._client, this._uri, 'POST', body, options);
  };
  function Resource5 (uri, client) {
    this._uri    = uri;
    this._client = client;

  };


  Resource5.prototype.post = function (body, options) {
    return handleRequest(this._client, this._uri, 'POST', body, options);
  };
  function Resource6 (uri, client) {
    this._uri    = uri;
    this._client = client;

  };

  Resource6.prototype.key = function (/* ...args */) {
    var uri = this._uri + template('/{0}', arguments, [undefined]);

    return new Resource7(uri, this._client);
  };

  function Resource7 (uri, client) {
    this._uri    = uri;
    this._client = client;

  };


  Resource7.prototype.get = function (body, options) {
    return handleRequest(this._client, this._uri, 'GET', body, options);
  };
  Resource7.prototype.post = function (body, options) {
    return handleRequest(this._client, this._uri, 'POST', body, options);
  };
  Resource7.prototype.put = function (body, options) {
    return handleRequest(this._client, this._uri, 'PUT', body, options);
  };
  Resource7.prototype.delete = function (body, options) {
    return handleRequest(this._client, this._uri, 'DELETE', body, options);
  };
  function Resource8 (uri, client) {
    this._uri    = uri;
    this._client = client;

  };


  Resource8.prototype.post = function (body, options) {
    return handleRequest(this._client, this._uri, 'POST', body, options);
  };

  function CustomResource (uri, client) {
    this._uri    = uri;
    this._client = client;
  }

  CustomResource.prototype.get = function (body, options) {
    return handleRequest(this._client, this._uri, 'GET', body, options);
  };
  CustomResource.prototype.post = function (body, options) {
    return handleRequest(this._client, this._uri, 'POST', body, options);
  };
  CustomResource.prototype.put = function (body, options) {
    return handleRequest(this._client, this._uri, 'PUT', body, options);
  };
  CustomResource.prototype.head = function (body, options) {
    return handleRequest(this._client, this._uri, 'HEAD', body, options);
  };
  CustomResource.prototype.delete = function (body, options) {
    return handleRequest(this._client, this._uri, 'DELETE', body, options);
  };
  CustomResource.prototype.options = function (body, options) {
    return handleRequest(this._client, this._uri, 'OPTIONS', body, options);
  };
  CustomResource.prototype.trace = function (body, options) {
    return handleRequest(this._client, this._uri, 'TRACE', body, options);
  };
  CustomResource.prototype.copy = function (body, options) {
    return handleRequest(this._client, this._uri, 'COPY', body, options);
  };
  CustomResource.prototype.lock = function (body, options) {
    return handleRequest(this._client, this._uri, 'LOCK', body, options);
  };
  CustomResource.prototype.mkcol = function (body, options) {
    return handleRequest(this._client, this._uri, 'MKCOL', body, options);
  };
  CustomResource.prototype.move = function (body, options) {
    return handleRequest(this._client, this._uri, 'MOVE', body, options);
  };
  CustomResource.prototype.purge = function (body, options) {
    return handleRequest(this._client, this._uri, 'PURGE', body, options);
  };
  CustomResource.prototype.propfind = function (body, options) {
    return handleRequest(this._client, this._uri, 'PROPFIND', body, options);
  };
  CustomResource.prototype.proppatch = function (body, options) {
    return handleRequest(this._client, this._uri, 'PROPPATCH', body, options);
  };
  CustomResource.prototype.unlock = function (body, options) {
    return handleRequest(this._client, this._uri, 'UNLOCK', body, options);
  };
  CustomResource.prototype.report = function (body, options) {
    return handleRequest(this._client, this._uri, 'REPORT', body, options);
  };
  CustomResource.prototype.mkactivity = function (body, options) {
    return handleRequest(this._client, this._uri, 'MKACTIVITY', body, options);
  };
  CustomResource.prototype.checkout = function (body, options) {
    return handleRequest(this._client, this._uri, 'CHECKOUT', body, options);
  };
  CustomResource.prototype.merge = function (body, options) {
    return handleRequest(this._client, this._uri, 'MERGE', body, options);
  };
  CustomResource.prototype.mSearch = function (body, options) {
    return handleRequest(this._client, this._uri, 'M-SEARCH', body, options);
  };
  CustomResource.prototype.notify = function (body, options) {
    return handleRequest(this._client, this._uri, 'NOTIFY', body, options);
  };
  CustomResource.prototype.subscribe = function (body, options) {
    return handleRequest(this._client, this._uri, 'SUBSCRIBE', body, options);
  };
  CustomResource.prototype.unsubscribe = function (body, options) {
    return handleRequest(this._client, this._uri, 'UNSUBSCRIBE', body, options);
  };
  CustomResource.prototype.patch = function (body, options) {
    return handleRequest(this._client, this._uri, 'PATCH', body, options);
  };
  CustomResource.prototype.search = function (body, options) {
    return handleRequest(this._client, this._uri, 'SEARCH', body, options);
  };
  CustomResource.prototype.connect = function (body, options) {
    return handleRequest(this._client, this._uri, 'CONNECT', body, options);
  };

  function Client (options) {
    this.options = extend({
      baseUri: 'http:/localhost:8080/{version}',
      baseUriParameters: {version:'v1'}
    }, options);

    this.resources = new Resource0('', this);
  };

  Client.prototype.resource = function (route, parameters) {
    var path = '/' + template(route, parameters).replace(/^\//, '');

    return new CustomResource(path, this);
  };

  Client.prototype.request = popsicle;
  Client.prototype.form = Client.form = popsicle.form;
  Client.prototype.version  = 'v1';


  return Client;
});
