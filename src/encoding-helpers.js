/*
** #############################  
** Helper functions for encoding
** #############################
*/

function ipIsIpv6(ip) {
  if (ip.indexOf(':') != -1) { return true; }
  else if (ip.indexOf('.') != -1) { return false; }
  else {
    throw new Error('Formatting error in IP Address input.' +
      ' ' + 'Contains neither ":" or "."');
  }
}

function splitIp(ip, ipv6) {
  var octetArray, separator, v6Base, numOctets, decimalOctetArray;
  
  octetArray = [];
  decimalOctetArray = [];
  v6Base = 16;
  
  if (ipv6) {
    separator = ':';
    numOctets = 8;
  } else {
    separator = '.';
    numOctets = 4;
  }
  
  /*
  ** Remove newline and space characters
  */    
  ip = ip.replace(/[\n\ ]/g, '');
  octetArray = ip.split(separator);

  /*
  ** If IPv6 address is in abbreviated format, we need to replace missing octets with 0
  */    
  if (octetArray.length < numOctets) {
    if (ipv6) {
      var numMissingOctets = (numOctets - octetArray.length);
      
      octetArray = padOctets(octetArray, numMissingOctets);
    } else {
      throw new Error('Formatting error in IP Address input.' +
      ' ' + 'IPv4 address has fewer than 4 octets.');
    }
  }

  /*
  ** Conter IPv6 addresses from hex to decimal
  */       
  if (ipv6) {
    for (var i = 0; i < octetArray.length; i++) {
      decimalOctetArray[i] = parseInt(octetArray[i], v6Base);
    }     
  } else {
    decimalOctetArray = octetArray;
  }
  
  return decimalOctetArray;  
}

/*
** If IPv6 is abbreviated, pad with appropriate number of 0 octets
*/   
function padOctets(octetArray, numMissingOctets) {
  var paddedOctet, aLength;
  
  paddedOctet = 0;
  aLength = octetArray.length;
  
  /*
  ** If the first or last octets are blank, zero them
  */    
  if (octetArray[0] === '') {
    octetArray[0] = paddedOctet;
  }    
  if (octetArray[aLength - 1] === '') {
    octetArray[aLength - 1] = paddedOctet;
  }
  
  /*
  ** Check the rest of the array for blank octets and pad as needed
  */ 
  for (var i = 0; i < aLength; i++) {
    if (octetArray[i] === '') {
      octetArray[i] = paddedOctet;
      
      for (var j = 0; j < numMissingOctets; j++) {
        octetArray.splice(i, 0, paddedOctet);
      }
    }
  }
  
  return octetArray;
}

/*
** Convert each decimal octet into a factor of the divisor (16 or 256)
** and a remainder
*/   
function factorOctets(octetArray, ipv6) {
  var divisor, factoredOctetArray;
  
  factoredOctetArray = [];
  
  if (ipv6) {
    divisor = 256;
  } else {
    divisor = 16;
  }
  
  for (var i = 0; i < octetArray.length; i++) {
    var octetValue, factor1, factor2;
    
    octetValue = octetArray[i];
    
    factor1 = octetArray[i] % divisor;
    octetValue = octetValue - factor1;
    factor2 = octetValue / divisor;
    
    factoredOctetArray.push(factor2);
    factoredOctetArray.push(factor1);
  }   
  
  return factoredOctetArray;
}

function encodeWords(factorArray, ipv6) {
  var key, encodedWordArray;
  
  encodedWordArray = [];   
  key = getKey(ipv6);
  
  for (var i = 0; i < factorArray.length; i++) {
    var dict;
    
    dict = key[i];    
    encodedWordArray[i] = dict[factorArray[i]];
  }
  
  return encodedWordArray;
}
