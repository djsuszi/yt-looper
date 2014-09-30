QUnit.test('qunit self-test', function (assert) {
  assert.ok(1 == '1', 'Passed!');
});

QUnit.module('Basic URL parsing');

QUnit.test('one video, one interval', function (assert) {
  var test_url = 'http://yt.aergia.eu/#v=T0rs3R4E1Sk&t=23;30';
  var expected_intervals = [{'start':23,'end':30}];
  var videos = parseVideos(test_url);
  assert.ok(videos.length == 1, 'incorrect number of detected videos');
  test_url = videos[0];

  assert.deepEqual(getParam(test_url, 'v'), 'T0rs3R4E1Sk', 'incorrect video id');
  assert.deepEqual(getParam(test_url, 't'), '23;30', 'incorrect interval data');
  assert.deepEqual(parseIntervals(test_url, 't'), expected_intervals, 'incorrect parseIntervals result');
});

QUnit.test('one video, multiple intervals', function (assert) {
  var test_url = 'http://yt.aergia.eu/#v=ZNno63ZO2Lw&t=54s;1m20s+1m33s;1m47s+3m30s;3m46s';
  var expected_intervals = [{'start':54,'end':80},{'start':93,'end':107},{'start':210,'end':226}];

  var videos = parseVideos(test_url);
  assert.ok(videos.length == 1, 'incorrect number of detected videos');
  test_url = videos[0];

  assert.deepEqual(getParam(test_url, 'v'), 'ZNno63ZO2Lw', 'incorrect video id');
  assert.deepEqual(getParam(test_url, 't'), '54s;1m20s+1m33s;1m47s+3m30s;3m46s', 'incorrect interval data');
  assert.deepEqual(parseIntervals(test_url, 't'), expected_intervals, 'incorrect parseIntervals result');
});

QUnit.module('Advanced URL parsing');

QUnit.test('two videos, mixed intervals', function (assert) {
  var test_url = 'http://yt.aergia.eu/#v=ZNno63ZO2Lw&t=54;1m20s+1m33s;1m47s+3m30s;3m46s&v=TM1Jy3qPSCQ&t=2;16s';
  var expected_intervals;

  var videos = parseVideos(test_url);
  assert.ok(videos.length == 2, 'incorrect number of detected videos');

  test_url = videos[0];
  expected_intervals = [{'start':54,'end':80},{'start':93,'end':107},{'start':210,'end':226}];
  assert.deepEqual(getParam(test_url, 'v'), 'ZNno63ZO2Lw', 'incorrect video id');
  assert.deepEqual(getParam(test_url, 't'), '54;1m20s+1m33s;1m47s+3m30s;3m46s', 'incorrect interval data');
  assert.deepEqual(parseIntervals(test_url, 't'), expected_intervals, 'incorrect parseIntervals result');


  test_url = videos[1];
  expected_intervals = [{'start':2,'end':16}];
  assert.deepEqual(getParam(test_url, 'v'), 'TM1Jy3qPSCQ', 'incorrect video id');
  assert.deepEqual(getParam(test_url, 't'), '2;16s', 'incorrect interval data');
  assert.deepEqual(parseIntervals(test_url, 't'), expected_intervals, 'incorrect parseIntervals result');

});
// vim:ts=2:sw=2:et:
