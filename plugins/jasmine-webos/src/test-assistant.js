function TestAssistant() {
  this.reporter = new JasmineReporter(this, jasmine.getEnv());

  this.listAttributes = {
    listTemplate: '../../plugins/jasmine-webos/app/views/test/spec-list',
    itemTemplate: '../../plugins/jasmine-webos/app/views/test/spec',
    renderLimit: 500,
    onItemRendered: function(widget, item, node) {
      if (!item.passed) {
        node.writeAttribute({'x-mojo-tap-highlight': 'momentary'});
      }
    }
  };
}

TestAssistant.prototype.setup = function() {
  this.addJasmineCSS();
  this.setUpJasmineHeader();
  this.setUpFailedSpecsList();
  this.setUpCommandMenu();

  this.controller.setupWidget('pill', {cancellable: false}, this.reporter.getPillModel());
};

TestAssistant.prototype.addJasmineCSS = function() {
  var cssTag = document.createElement('link');
  cssTag.rel = 'stylesheet';
  cssTag.type = 'text/css';
  cssTag.href = 'plugins/jasmine-webos/stylesheets/jasmine-webos.css';

  var head = document.getElementsByTagName('head')[0];
  head.appendChild(cssTag);
};

TestAssistant.prototype.setUpJasmineHeader = function() {
  this.controller.sceneElement.querySelector('.jasmine-info').innerHTML = "Jasmine " + jasmine.getEnv().versionString();
  this.controller.sceneElement.querySelector('.jasmine-webos-info').innerHTML = jasmine.webos.versionString();
};

TestAssistant.prototype.setUpFailedSpecsList = function() {

  this.controller.setupWidget(
      'failed-specs',
      this.listAttributes,
      this.reporter.getFailedSpecsListModel());

  var failedSpecList = this.controller.sceneElement.querySelector('#failed-specs');

  Mojo.Event.listen(failedSpecList, Mojo.Event.listTap, this.listTapHandler.bind(this));
};

TestAssistant.prototype.setUpCommandMenu = function() {
  this.controller.setupWidget(Mojo.Menu.commandMenu, {}, {
    visible: true,
    items: [
      {},
      { label: 'All Results', command: 'all'}
    ]
  });
};

TestAssistant.prototype.setUpAllSpecsList = function() {
  this.controller.setupWidget(
      'all-specs',
      this.listAttributes,
      this.reporter.getAllSpecsListModel());
  var allSpecList = this.controller.sceneElement.querySelector('#all-specs');
  Mojo.Event.listen(allSpecList, Mojo.Event.listTap, this.listTapHandler.bind(this));
};

TestAssistant.prototype.activate = function() {
  jasmine.getEnv().execute();
};

TestAssistant.prototype.listTapHandler = function(event) {
  if (event.item.passed) {
    return;
  }

  this.controller.stageController.pushScene({
    name: 'error',
    sceneTemplate: '../../plugins/jasmine-webos/app/views/error/error-scene'
  }, event.item);

};


TestAssistant.prototype.handleCommand = function(event) {
  switch (event.command) {

    case 'all':
      this.setUpAllSpecsList();
      this.controller.instantiateChildWidgets(this.controller.sceneElement);
      break;

    default:
      event.stop();
  }
};


// View interface
TestAssistant.prototype.writeToLog = function(message) {
  Mojo.Log.info("Jamine.log: " + message);
};

TestAssistant.prototype.runnerStarted = function(specCount) {
};

TestAssistant.prototype.specCompleted = function(spec) {
  this.controller.modelChanged(this.reporter.getPillModel(), this);
};

TestAssistant.prototype.specFailed = function(spec) {
  this.controller.sceneElement.querySelector('#pill').addClassName('fail');
  this.controller.modelChanged(this.reporter.getFailedSpecsListModel(), this);
};

TestAssistant.prototype.suiteCompleted = function(suite) {
  this.controller.modelChanged(this.reporter.getPillModel(), this);
};

TestAssistant.prototype.runnerCompleted = function(runner) {
  this.controller.modelChanged(this.reporter.getPillModel(), this);
  var timeElement = this.controller.sceneElement.querySelector('.time');
  timeElement.innerHTML = 'Finished at ' +
      Mojo.Format.formatDate(new Date(), {time: 'full'}) +
      ' on ' +
      Mojo.Format.formatDate(new Date(), {date: 'short'});
};

// TODO: Handle this better
var pockets = {
  inPalmHost: function() {
    return false;
  }
};
