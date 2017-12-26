var Router = function (options) {
  this.routes = options.routes || [];
  this.eventBus = options.eventBus;
  this.init();
}

Router.prototype = {
  init: function () {
    window.addEventListener('hashchange', () => this.handleUrl(window.location.hash));
    this.handleUrl(window.location.hash);
  },
  findPreviousActiveRoute: function () {
    return this.currentRoute;
  },
  findNewActiveRoute: function (url) {
    let route = this.routes.find((routeItem) => {
      if (typeof routeItem.match === 'string') {
        return url === routeItem.match;
      } else if (typeof routeItem.match === 'function') {
        return routeItem.match(url);
      } else if (routeItem.match instanceof RegExp) {
        return url.match(routeItem.match);
      }
    });
    return route;
  },
  getRouteParams(route, url) {
    var params = url.match(route.match) || [];
    params.shift();
    return params;
  },
  handleUrl: function (url) {
    url = url.slice(1);
    let previousRoute = this.findPreviousActiveRoute();
    let newRoute = this.findNewActiveRoute(url);
    let routeParams = this.getRouteParams(newRoute, url);
    Promise.resolve()
      .then(() => previousRoute && previousRoute.onLeave && previousRoute.onLeave(...this.currentRouteParams))
      .then(() => newRoute && newRoute.onBeforeEnter && newRoute.onBeforeEnter(...routeParams))
      .then(() => newRoute && newRoute.onEnter && newRoute.onEnter(...routeParams))
      .then(() => {
        this.currentRoute = newRoute;
        this.currentRouteParams = routeParams;
      });
  },
};

var router = new Router({
  routes: [{
    name: 'index',
    match: '',
    onBeforeEnter: () => console.log('onBeforeEnter index'),
    onEnter: () => console.log('onEnter index'),
    onLeave: () => console.log('onLeave index')
  }, {
    name: 'city',
    match: /city=(.+)/,
    onBeforeEnter: (city) => console.log(`onBeforeEnter city:${city}`),
    onEnter: (city) => console.log(`onEnter city:${city}`),
    onLeave: (city) => console.log(`onLeave city:${city}`)
  }, {
    name: 'about',
    match: (text) => text === 'about',
    onBeforeEnter: () => console.log(`onBeforeEnter about`),
    onEnter: () => {
      console.log(`onEnter about`);
      document.querySelector('#content').innerHTML = '<h1>About</h1>';
    },
    onLeave: () => {
      console.log(`onLeave about`);
      document.querySelector('#content').innerHTML = '';
    }
  }]
});