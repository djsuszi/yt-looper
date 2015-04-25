module.exports = {

  'Clicking on "help" in #menu' : function (browser) {
    browser.maximizeWindow()
      .url('http://127.0.0.1:28080/#i=cJjBEQP.png')
      .waitForElementVisible('#menu')
      .assert.cssClassNotPresent('#help-toggle', 'ticker')
      .assert.hidden('#help')
      .saveScreenshot('help0.png')
      .click('#help-toggle')
      .saveScreenshot('help1.png')
      .pause(2000)
      .saveScreenshot('help2.png')
      .waitForElementVisible('#help')
      .saveScreenshot('help3.png')
      .assert.cssClassPresent('#help-toggle','ticker')
      .assert.visible('#help')
      .click('#help-toggle')
      .waitForElementNotVisible('#help')
      .saveScreenshot('help4.png')
      .assert.cssClassNotPresent('#help-toggle', 'ticker')
      .assert.hidden('#help')
      .end();
  },

};
