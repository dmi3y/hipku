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
