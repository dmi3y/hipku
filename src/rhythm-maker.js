/*
** Return an array of dictionaries representing the correct word
** order for the haiku
*/
function getKey(ipv6) {
  var key;

  if (ipv6) {
    key = [
      ip6.adjectives,
      ip6.nouns,
      ip6.adjectives,
      ip6.nouns,
      ip6.verbs,
      ip6.adjectives,
      ip6.adjectives,
      ip6.adjectives,
      ip6.adjectives,
      ip6.adjectives,
      ip6.nouns,
      ip6.adjectives,
      ip6.nouns,
      ip6.verbs,
      ip6.adjectives,
      ip6.nouns
    ];
  } else {
    key = [
      ip4.animalAdjectives,
      ip4.animalColors,
      ip4.animalNouns,
      ip4.animalVerbs,
      ip4.natureAdjectives,
      ip4.natureNouns,
      ip4.plantNouns,
      ip4.plantVerbs
    ];
  }

  return key;
}

function writeHaiku(wordArray, ipv6) {
  var octet, schemaResults, schema, nonWords, haiku;

  octet = 'OCTET'; // String to place in schema to show word slots
  schemaResults = getSchema(ipv6, octet);
  schema = schemaResults[0];
  nonWords = schemaResults[1];

  /*
  ** Replace each instance of 'octet' in the schema with a word from
  ** the encoded word array
  */
  for (var i = 0; i < wordArray.length; i++) {
    for (var j = 0; j < schema.length; j++) {
      if (schema[j] === octet) {
        schema[j] = wordArray[i];
        break;
      }
    }
  }

  /*
  ** Capitalize appropriate words
  */
  schema = capitalizeHaiku(schema, nonWords);
  haiku = schema.join('');

  return haiku;
}

function getSchema(ipv6, octet) {
  var schema, newLine, period, space, nonWords;

  schema = [];
  newLine = '\n';
  period = '.';
  space = ' ';
  nonWords = [newLine, period, space];

  if (ipv6) {
      schema = [octet,
      octet,
      'and',
      octet,
      octet,
      newLine,
      octet,
      octet,
      octet,
      octet,
      octet,
      octet,
      octet,
      period,
      newLine,
      octet,
      octet,
      octet,
      octet,
      octet,
      period,
      newLine];
  } else {
      schema = ['The',
      octet,
      octet,
      octet,
      newLine,
      octet,
      'in the',
      octet,
      octet,
      period,
      newLine,
      octet,
      octet,
      period,
      newLine];
  }

  /*
  ** Add spaces before words except the first word
  */
  for (var i = 1; i < schema.length; i++) {
      var insertSpace = true;

      /*
      ** If the next entry is a nonWord, don't add a space
      */
      for (var j = 0; j < nonWords.length; j++) {
        if (schema[i] === nonWords[j]) {
            insertSpace = false;
        }
      }

      /*
      ** If the previous entry is a newLine, don't add a space
      */
      if (schema[i - 1] === newLine) {
          insertSpace = false;
      }

      if (insertSpace) {
          schema.splice(i, 0, space);
          i = i + 1;
      }
  }

  return [schema, nonWords];
}

function capitalizeHaiku(haikuArray, nonWords) {
  var period = '.';

  /*
  ** Always capitalize the first word
  */
  haikuArray[0] = capitalizeWord(haikuArray[0]);

  for (var i = 1; i < haikuArray.length; i++) {

    if (haikuArray[i] === period) {
      var isWord;

      /*
      ** If the current entry is a period then the next entry will be
      ** a newLine or a space, so check two positions ahead and
      ** capitalize that entry, so long as it's a word
      */

      isWord = true;

      if (haikuArray[i + 2] === undefined ||
          haikuArray[i + 2] === null ||
          haikuArray[i + 2] === '') {
        isWord = false;
      }

      for (var j = 0; j < nonWords.length; j++) {
        if (haikuArray[i + 2] === nonWords[j]) {
          isWord = false;
        }
      }

      if (isWord) {
        haikuArray[i + 2] = capitalizeWord(haikuArray[i + 2]);
      }
    }
  }

  return haikuArray;
}

function capitalizeWord(word) {
  word = word.substring(0,1).toUpperCase() +
    word.substring(1, word.length);

  return word;
}
