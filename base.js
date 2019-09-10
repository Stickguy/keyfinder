(function($) {

'use strict'
const allnotes = [
  "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"
]

// you define the scales you want to validate for, with name and intervals

/*
const scales = [{
  name: 'Major',
  int: [2, 4, 5, 7, 9, 11]
}, {
  name: 'Minor',
  int: [2, 3, 5, 7, 8, 10]
}];

*/

const scales = [{
  name: 'Major',
  int: [2, 4, 5, 7, 9, 11]
}, {
  name: 'Blues',
  int: [3, 5, 6, 7, 10]
}, {
  name: 'Minor',
  int: [2, 3, 5, 7, 8, 10]
}, {
  name: 'Harmonic Minor', // harmonic minor
  int: [2, 3, 5, 7, 8, 11]
}, {
  name: 'Melodic Minor', //melodic minor
  int: [2, 3, 5, 7, 9, 11]
}];



// you define which chord you accept. This is easily extensible,
// only limitation is you need to have a unique regexp, so
// there's not confusion.

const chordsDef = {
  major: {
    intervals: [4, 7],
    reg: /^[A-G]$|[A-G](?=[#b])/
  },
  minor: {
    intervals: [3, 7],
    reg: /^[A-G][#b]?[m]/
  },
  dom7: {
    intervals: [4, 7, 10],
    reg: /^[A-G][#b]?[7]/
  },
  maj7: {
    intervals: [4, 7, 11],
    reg: /^[A-G][#b]?[maj7]/
  },
  min7: {
    intervals: [3, 7, 10],
    reg: /^[A-G][#b]?[m7]/
  },
  dim: {
    intervals: [3, 6],
    reg: /^[A-G][#b]?[dim]/
  }
}

var notesArray = [];

// just a helper function to handle looping all notes array
function convertIndex(index) {
  return index < 12 ? index : index - 12;
}


// here you find the type of chord from your 
// chord string, based on each regexp signature
function getNotesFromChords(chordString) {

  var curChord, noteIndex;
  for (let chord in chordsDef) {
    if (chordsDef[chord].reg.test(chordString)) {
      var chordType = chordsDef[chord];
      break;
    }
  }

  noteIndex = allnotes.indexOf(chordString.match(/^[A-G][#b]?/)[0]);
  addNotesFromChord(notesArray, noteIndex, chordType)

}

// then you add the notes from the chord to your array
// this is based on the interval signature of each chord.
// By adding definitions to chordsDef, you can handle as
// many chords as you want, as long as they have a unique regexp signature
function addNotesFromChord(arr, noteIndex, chordType) {

  if (notesArray.indexOf(allnotes[convertIndex(noteIndex)]) == -1) {
    notesArray.push(allnotes[convertIndex(noteIndex)])
  }
  chordType.intervals.forEach(function(int) {

    if (notesArray.indexOf(allnotes[noteIndex + int]) == -1) {
      notesArray.push(allnotes[convertIndex(noteIndex + int)])
    }

  });

}

// once your array is populated you check each scale
// and match the notes in your array to each,
// giving scores depending on the number of matches.
// This one doesn't penalize for notes in the array that are
// not in the scale, this could maybe improve a bit.
// Also there's no weight, no a note appearing only once
// will have the same weight as a note that is recurrent. 
// This could easily be tweaked to get more accuracy.
function compareScalesAndNotes(notesArray) {
  var bestGuess = [{
    score: 0
  }];
  allnotes.forEach(function(note, i) {
    scales.forEach(function(scale) {
      var score = 0;
      score += notesArray.indexOf(note) != -1 ? 1 : 0;
      scale.int.forEach(function(noteInt) {
        // console.log(allnotes[convertIndex(noteInt + i)], scale)

        score += notesArray.indexOf(allnotes[convertIndex(noteInt + i)]) != -1 ? 1 : 0;

      });

      // you always keep the highest score (or scores)
      if (bestGuess[0].score < score) {

        bestGuess = [{
          score: score,
          key: note,
          type: scale.name,
          fullkey: note + ' ' + scale.name 
        }];
      } else if (bestGuess[0].score == score) {
        bestGuess.push({
          score: score,
          key: note,
          type: scale.name,
          fullkey: note + ' ' + scale.name
        })
      }



    })
  })
  return bestGuess;

}

function nameThatKey(){

	var chords = $.makeArray($(".selected").map(function() {
            return $(this).html()
        }));
    //console.table(chords);
    chords.forEach(function(chord) {
    getNotesFromChords(chord)
  });
  var guesses = compareScalesAndNotes(notesArray);
  var alertText = "<p>Probable Keys:</p><ul>";
  guesses.forEach(function(guess, i) {
    alertText += '<li>' + guess.key + ' ' + guess.type + '</li>';
  });
  alertText += "</ul>";
$('#thekey').html(alertText),                                   $('#result').css('display', 'block'),    $(".selected_slice").removeClass("selected_slice"),     $(".selected_slice_minor").removeClass("selected_slice_minor"), $(".selected_slice_hminor").removeClass("selected_slice_hminor"), $(".selected_key_text").removeClass("selected_key_text"),     guesses.forEach(function(item, index) {
        var id_major = item.fullkey.replace(" ", "_").replace("#", "sharp");
        $("#" + id_major + " .pie").addClass("selected_slice");
        var id_minor = item.fullkey.replace(" ", "_").replace("#", "sharp");
if(item.type === "Harmonic Minor"){
        var id_hminor = id_minor.replace("_Harmonic Minor", "_Minor")
        $("#" + id_hminor + " .pie_minor").addClass("selected_slice_hminor");
}
if(item.type === "Minor"){
        $("#" + id_minor + " .pie_minor").addClass("selected_slice_minor");
}
        //$("#" + id_minor + " .pie_minor").addClass("selected_slice_minor");
        var id_selected_text = item.fullkey.replace(" ", "_").replace("#", "sharp");
        id_selected_text += "-label", $("#" + id_selected_text).addClass("selected_key_text");
    }), 0 == $(".rTableCell.selected").length && ($(".selected_slice").removeClass("selected_slice"), $(".selected_slice_minor").removeClass("selected_slice_minor"),$(".selected_slice_hminor").removeClass("selected_slice_hminor"), $(".selected_key_text").removeClass("selected_key_text"),notesArray.length = 0)

    console.table(guesses);

}

var chord_selector = $('.rTableCell');
chord_selector.click(function() {
            $(this).toggleClass("selected"),nameThatKey();
        });

var clear_selected = $('#clear_selected');
clear_selected.click(function() {
            $(".rTableCell").removeClass("selected"),nameThatKey(),$('#thekey').html('');
        });

})(jQuery);
