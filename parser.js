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
  'OFFSET': ['offset', parseOffset],
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
  'ATTACKS': ['attacks', parseAttacks]
};
var sizes = {
  'dance': {
    'threepanel': 3,
    'single': 4,
    'solo': 6,
    'double': 8,
    'couple': 8
  },
  'pump': {
    'single': 5,
    'halfdouble': 6,
    'double': 10,
    'couple': 10
  },
  'ez2': {
    'single': 5,
    'double': 10,
    'real': 7,
  },
  'para':{
    'single': 5
  },
  'ds3ddx': {
    'single': 8
  },
  'maniax': {
    'single': 4,
    'double': 8,
  },
  'techno': {
    'single4': 4,
    'single5': 5,
    'single8': 8,
    'double4': 8,
    'double5': 10,
  },
  'pnm': {
    'five': 5,
    'nine': 9
  }
};

function parseOffset(v) {
  return parseFloat(v) * 1000;
}

function parseBoolean(v) {
  return v === 'YES' ? true : false;
}

function parseBPMs(v) {
  return v.split(',').map(function(str) {
    return str.split('=').map(function(flt) {
      return parseFloat(flt);
    });
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

function parseNotes(mode, what, difficulty, steps, what2, notes) {
  var modeDesc = mode.split('-');
  var upperLimit = sizes[modeDesc[0]][modeDesc[1]];
  return {
    mode: mode,
    difficulty: difficulty,
    steps: parseInt(steps),
    rawNotes: notes.split(',').map(function(measure) {
      var re = new RegExp(".{1," + upperLimit + "}","g");
      return measure.match(re);
    })
  };
}

function parseMeasures(data) {
  var baseBPM = data.bpms[0][1];
  var measureLength = 60000 / baseBPM * 4;
  data.notes.forEach(function(difficulty) {
    var offset = 0;
    var notes = difficulty.notes = [];
    difficulty.rawNotes.forEach(function(measure, measureId) {
      if(!measure){return}
      var len = measure.length;
      var noteTime = measureLength / len;
      measure.forEach(function(note, i) {
        // add mine handling
        if (parseInt(note)) {
          notes.push({
            offset: offset,
            steps: note,
            measure: measureId,
            type: getStepType(i, len)
          });
        }
        offset += noteTime;
      });
    });
  });
}

// TODO: add support for triples
function getStepType(offset, parts) {
  var pow = 1, part;
  // type 1 if there are 4 parts or less
  if (parts / 4 <= 1) {
    return 1;
  } else {
    // reduce offset by quads
    parts = parts / 4;
    while (offset >= parts) {
      offset -= parts;
    }
  }
  // type 1
  if (offset === 0) {
    return 1;
  }
  for (var i = 2; i < 5; i++) {
    pow *= 2;
    part = parts / pow;
    if (part !== parseInt(part)) break;
    if (offset - part === 0) {
      return i;
    } else if (offset - part > 0) {
      offset -= part;
    }
  }
  return 8;
}

var fs = require('fs');
var path = require('path');

var filepath = process.argv[2];
var dir = path.dirname(filepath);
var filename = path.basename(filepath, '.sm');
var outFile = path.join(dir, filename + '.json');

var content = fs.readFileSync(filepath, 'utf-8');
var inData = content
  .replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '')
  .replace(/[\r\n\t\s]/g, '')
  .split(';')
  .map(function(field) {
    return field.split(':');
  });

var outData = {
  notes: []
};

inData.forEach(function(field) {
  var fieldName = field[0].slice(1);
  var map = keyMap[fieldName];
  if (fieldName === 'NOTES') {
    outData.notes.push(parseNotes.apply(undefined, field.slice(1)));
  } else if (typeof map === 'string') {
    outData[map] = field[1];
  } else if (map) {
    outData[map[0]] = map[1].apply(undefined, field.slice(1));
  }
});
parseMeasures(outData);

fs.writeFileSync(outFile, JSON.stringify(outData, undefined, '\t'), 'utf-8');