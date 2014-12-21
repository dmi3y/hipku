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
