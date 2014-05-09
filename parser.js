var keyMap = {
  'TITLE': 'title',
  'SUBTITLE': 'subTitle',
  'ARTIST': 'artist',
  'TITLETRANSLIT': 'titleTranslit',
  'SUBTITLETRANSLIT': 'subTitleTransit',
  'ARTISTTRANSLIT': 'artistTranslit',
  'GENRE': 'genre',
  'CREDIT': 'credit',
  'BANNER': 'banner',
  'BACKGROUND': 'background',
  'LYRICSPATH': 'lyricsPath',
  'CDTITLE': 'CDTitle',
  'MUSIC': 'music',
  'OFFSET': ['offset', parseFloat],
  'SAMPLESTART': ['sampleStart', parseFloat],
  'SAMPLELENGTH': ['sampleLength', parseFloat],
  'SELECTABLE': ['selectable', parseBoolean],
  'BPMS': ['bpms', parseBPMs],
  'STOPS': ['stops', parseStops],
  'DELAYS': ['delays', parseDelays],
  'TIMESIGNATURES': ['timeSignatures', parseTimeSignatures],
  'TICKCOUNTS': ['tickCounts', parseTickCounts],
  'BGCHANGES': ['bgChanges', parseBgChanges],
  'KEYSOUNDS': ['keySounds', parseKeySounds],
  'ATTACKS': ['attacks', parseAttacks],
  'NOTES': ['measures', parseMeasures]
};

function parseBoolean(v) {
  return v === 'YES' ? true : false;
}

function parseBPMs(v) {
//  var bpms = {};
//  v.split(',').forEach(function(str) {
//    var arr = str.split('=');
//    bpms[arr[0]] = parseFloat(arr[1]);
//  });
  return v.split(',').map(function(str) {
    return str.split('=');
  });
}

function parseStops(v) {
  return v;
}

function parseDelays(v) {
  return v;
}

function parseTimeSignatures(v) {
  return v;
}

function parseTickCounts(v) {
  return v;
}

function parseBgChanges(v) {
  return v;
}

function parseKeySounds(v) {
  return v;
}

function parseAttacks(v) {
  return v;
}

function parseMeasures(mode, what, difficulty, steps, what2, notes) {
  return {
    mode: mode,
    difficulty: difficulty,
    steps: parseInt(steps),
    notes: notes.split(',').map(function(measure) {
      return measure.match(/.{1,4}/g);
    })
  };
}

function parseNotes(data) {
  var baseBPM = data.bpms[0][1];
  var measures = data.measures;
  var notes = [];
  return notes;
}

var fs = require('fs');
var path = require('path');

var filepath = process.argv[2];
var dir = path.dirname(filepath);
var filename = path.basename(filepath, '.sm');
var outFile = path.join(dir, filename + '.json');

var content = fs.readFileSync(filepath, 'utf-8');
var inData = content
  .replace(/[\r\n\t\s]/g, '')
  .split(';')
  .map(function(field) {
    return field.split(':');
  });

var outData = {};

inData.forEach(function(field) {
  var fieldName = field[0].slice(1);
  var map = keyMap[fieldName];
  if (!map) return;
  if (typeof map === 'string') {
    outData[map] = field[1];
  } else {
    outData[map[0]] = map[1].apply(undefined, field.slice(1));
  }
});
outData.notes = parseNotes(outData);

console.log(outData, outData.notes);