/*
** #############################
** Helper functions for decoding
** #############################
*/

function splitHaiku(haiku) {
  var wordArray;

  haiku = haiku.toLowerCase();

  /*
  ** Replace newline characters with spaces
  */
  haiku = haiku.replace(/\n/g, ' ');

  /*
  ** Remove anything that's not a letter, a space or a dash
  */
  haiku = haiku.replace(/[^a-z\ -]/g, '');
  wordArray = haiku.split(' ');

  /*
  ** Remove any blank entries
  */
  for (var i = 0; i < wordArray.length; i++) {
    if (wordArray[i] === '') {
      wordArray.splice(i, 1);
    }
  }

  return wordArray;
}

function haikuIsIpv6(wordArray) {
  var ipv6, key, dict;

  key = getKey(false);
  dict = key[0];
  ipv6 = true;

  /*
  ** Compare each word in the haiku against each word in the first
  ** dictionary defined in the IPv4 key. If there's a match, the
  ** current haiku is IPv4. If not, IPv6.
  */
  for (var i = 0; i < wordArray.length; i++) {
    var currentWord = wordArray[i];

    for (var j = 0; j < dict.length; j++) {
      if (currentWord === dict[j]) {
          ipv6 = false;
          break;
      }
    }

    if (ipv6 === false) {
      break;
    }
  }

  return ipv6;
}

/*
** Return an array of factors and remainders for each encoded
** octet-value
*/
function getFactors(wordArray, ipv6) {
  var key, factorArray, wordArrayPosition;

  key = getKey(ipv6);
  factorArray = [];
  wordArrayPosition = 0;

  /*
  ** Get the first dictionary from the key. Check the first entry in
  ** the encoded word array to see if it's in that dictionary. If it
  ** is, store the dictionary offset and move onto the next dictionary
  ** and the next word in the encoded words array. If there isn't a
  ** match, keep the same dictionary but check the next word in the
  ** array. Keep going till we have an offset for each dictionary in
  ** the key.
  */
  for (var i = 0; i < key.length; i++) {
    var result, factor, newPosition;

    result = [];
    result = getFactorFromWord(key[i], key.length,
                wordArray, wordArrayPosition);
    factor = result[0];
    newPosition = result[1];
    wordArrayPosition = newPosition;

    factorArray.push(factor);
  }

  return factorArray;
}

function getFactorFromWord(dict, maxLength, words, position) {
  var factor = null;

  for (var j = 0; j < dict.length; j++) {
    var dictEntryLength, wordToCheck;

    /*
    ** Get the number of words in the dictionary entry
    */
    dictEntryLength = dict[j].split(' ').length;

    /*
    ** build a string to compare against the dictionary entry
    ** by joining the appropriate number of wordArray entries
    */
    wordToCheck =
      words.slice(position, position + dictEntryLength);
    wordToCheck = wordToCheck.join(' ');

    if (dict[j] === wordToCheck) {
      factor = j;

      /*
      ** If the dictionary entry word count is greater than one,
      ** increment the position counter by the difference to
      ** avoid rechecking words we've already checkced
      */
      position = position + (dictEntryLength - 1);
      break;
    }
  }

  position = position + 1;

  if (factor === null) {
    if (position >= maxLength) {
      /*
      ** We've reached the entry of the haiku and still not matched
      ** all necessary dictionaries, so throw an error
      */
      throw new Error('Decoding error: one or more dictionary words' +
                       'missing from input haiku');
    } else {
      /*
      ** Couldn't find the current word in the current dictionary,
      ** try the next word
      */
      return getFactorFromWord(dict, maxLength, words, position);
    }
  } else {
    /*
    ** Found the word - return the dictionary offset and the new
    ** word array position
    */
    return [factor, position];
  }
}

function getOctets(factorArray, ipv6) {
  var octetArray, multiplier;

  octetArray = [];
  if (ipv6) {
    multiplier = 256;
  } else {
    multiplier = 16;
  }

  for (var i = 0; i < factorArray.length; i = i + 2) {
    var factor1, factor2, octet;

    factor1 = factorArray[i];
    factor2 = factorArray[i + 1];
    octet = (factor1 * multiplier) + factor2;

    if (ipv6) {
      octet = octet.toString(16);
    }

    octetArray.push(octet);
  }

  return octetArray;
}

function getIpString(octetArray, ipv6) {
  var ipString, separator;

  ipString = '';

  if (ipv6) {
    separator = ':';
  } else {
    separator = '.';
  }

  for (var i = 0; i < octetArray.length; i++) {
    if (i > 0) {
      ipString += separator;
    }
    ipString += octetArray[i];
  }

  return ipString;
}

/*
** ##############
** Public Methods
** ##############
*/

/*
** Object holds all public methods and is returned by the module
*/
var publicMethods = {};

/*
** Public method to encode IP Addresses as haiku
*/
var encode = function(ip) {
  var ipv6, decimalOctetArray, factoredOctetArray, encodedWordArray,
    haikuText;

  ipv6 = ipIsIpv6(ip);
  decimalOctetArray = splitIp(ip, ipv6);
  factoredOctetArray = factorOctets(decimalOctetArray, ipv6);
  encodedWordArray = encodeWords(factoredOctetArray, ipv6);
  haikuText = writeHaiku(encodedWordArray, ipv6);

  return haikuText;
};

/*
** Public method to decode haiku into IP Addresses
*/
var decode = function(haiku) {
  var wordArray, ipv6, factorArray, octetArray, ipString;

  wordArray = splitHaiku(haiku);
  ipv6 = haikuIsIpv6(wordArray);
  factorArray = getFactors(wordArray, ipv6);
  octetArray = getOctets(factorArray, ipv6);
  ipString = getIpString(octetArray, ipv6);

  return ipString;
};

/*
** Attach the public methods to the return object
*/
publicMethods.encode = encode;
publicMethods.decode = decode;

/*
** Return an array of dictionaries representing the correct word
** order for the haiku
*/
function getKey(ipv6) {
  var key;

  if (ipv6) {
    key = [
      adjectives,
      nouns,
      adjectives,
      nouns,
      verbs,
      adjectives,
      adjectives,
      adjectives,
      adjectives,
      adjectives,
      nouns,
      adjectives,
      nouns,
      verbs,
      adjectives,
      nouns
    ];
  } else {
    key = [
      animalAdjectives,
      animalColors,
      animalNouns,
      animalVerbs,
      natureAdjectives,
      natureNouns,
      plantNouns,
      plantVerbs
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
