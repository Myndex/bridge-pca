///////////////////////////////////////////////////////////////////////////////
/** @preserve
/////    SAPC APCA - Advanced Perceptual Contrast Algorithm
/////           bridge-pca  0.1.2  • BRIDGE contrast function only
/////           DIST: W3 • Revision date: Dec 21, 2021
/////    Function to parse color values and determine Lc contrast
/////    Copyright © 2019-2021 by Andrew Somers. All Rights Reserved.
/////    LICENSE: W3 LICENSE
/////    CONTACT: Please use the ISSUES or DISCUSSIONS tab at:
/////    https://github.com/Myndex/SAPC-APCA/
/////
///////////////////////////////////////////////////////////////////////////////
/////
/////    IMPORT:
/////    import {
/////            BPCAcontrast, sRGBtoY, displayP3toY, colorParsley
/////            } from 'bridge-pca';
/////    
/////    FORWARD CONTRAST USAGE:
/////    Lc = BPCAcontrast( sRGBtoY( TEXTcolor ) , sRGBtoY( BACKGNDcolor ) );
/////
/////    Where the colors are sent as an rgba array [0,0,0]
/////
/////    Live Demonstrator at https://www.myndex.com/BPCA/
// */
///////////////////////////////////////////////////////////////////////////////

// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_file_name bridge-pca.min.js
// @code_url https://raw.githubusercontent.com/Myndex/bridge-pca/master/src/bridge-pca.js
// ==/ClosureCompiler==

// 


////////////////////////////////////////////////////////////////////////////////
/////
/////                      SAPC Method and APCA Algorithm
/////   WCAG_2 Bridge Version: https://github.com/Myndex/bridge-pca
/////   MAIN GITHUB: https://github.com/Myndex/SAPC-APCA
/////   DEVELOPER SITE: https://www.myndex.com/WEB/Perception
/////
/////   Acknowledgments and Thanks To:
/////   • This project references the research and work of Dr.Lovie-Kitchin, 
/////     Dr.Legge, Dr.Arditi, M.Fairchild, R.Hunt, M.Stone, Dr.Poynton, 
/////     L.Arend, M.Luo, E.Burns, R.Blackwell, P.Barton, M.Brettel, and many 
/////     others — see refs at https://www.myndex.com/WEB/WCAG_CE17polarity
/////   • Bruce Bailey of USAccessBoard for his encouragement, ideas, & feedback
/////   • Chris Loiselle of Oracle for getting us back on track in a pandemic
/////   • The many volunteer test subjects for participating in the studies.
/////   • Principal research conducted at Myndex by A.Somers.
/////
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/////
/////   *****  SAPC BLOCK  *****
/////
/////   For Evaluations, refer to this as: SAPC-8, v0.1.2 G-series constant 4g
/////            SAPC • S-LUV Advanced Predictive Color
/////
/////   SIMPLE VERSION — Only the basic APCA contrast predictor.
/////
/////   Included Extensions & Model Features in this file:
/////       • SAPC-8 Core Contrast (Base APCA, non-clinical use only) 
/////       • G series constants, group "G-4g" using a 2.4 monitor exponent
/////       • sRGB to Y, parses numeric sRGB color to luminance
/////       • SoftToe black level soft clamp and flare compensation.
/////
/////
////////////////////////////////////////////////////////////////////////////////
/////
/////               DISCLAIMER AND LIMITATIONS OF USE
/////     Bridge-PCA is an embodiment of certain suprathreshold contrast
/////     prediction technologies and it is licensed to the W3 on a
/////     limited basis for use in certain specific accessibility
/////     guidelines for web content only. Bridge-PCA may be used for 
/////     predicting colors for web content use without royalty.
/////
/////     However, Any such license excludes other use cases
/////     not related to web content. Prohibited uses include
/////     medical, clinical evaluation, human safety related,
/////     aerospace, transportation, military applications, 
/////     and uses which are not specific to web based content
/////     presented on self-illuminated displays or devices.
/////
////////////////////////////////////////////////////////////////////////////////

//////////   BRIDGE PCA 0.1.2 4g USAGE  ////////////////////////////////////////
///
///  The API for "bridge-pca" is trivially simple.
///  Send text and background sRGB numeric values to the sRGBtoY() function,
///  and send the resulting text-Y and background-Y to the BPCAcontrast function,
///  it returns a signed float with the numeric Lc contrast result.
///  
///  The two inputs are TEXT color and BACKGROUND color in that order.
///  Each must be a numeric NOT a string, as this simple version has
///  no string parsing utilities. EXAMPLE:
///  ________________________________________________________________________
///
///     txtColor = [0,0,0]; // color of the text, as will be rendered
///     bgColor  = [232,230,221]; // color for the background
///
///     contrastLc = BPCAcontrast( sRGBtoY(txtColor) , sRGBtoY(bgColor) );
///  ________________________________________________________________________
///
///                  **********   QUICK START   **********
///
///  Each color must be a 24bit color (8 bit per channel) as a single integer
///  (or 0x) sRGB encoded color, i.e. White is either the integer 16777216 or
///  the hex 0xffffff. A float is returned with a positive or negative value.
///  Negative values mean light text and a dark background, positive values
///  mean dark text and a light background. 60.0, or -60.0 is a contrast
///  "sort of like" the old WCAG 2's 4.5:1. NOTE: the total range is now less
///  than ± 110, so output can be rounded to a signed INT but DO NOT output
///  an absolute value - light text on dark BG should return a negative number.
///
///     *****  IMPORTANT: Do Not Mix Up Text and Background inputs.  *****
///     ****************   BPCA is polarity dependent!   *****************
///  
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
/////  BEGIN BPCA  0.1.2 4g BLOCK       \//////////////////////////////////////
////                                     \////////////////////////////////////


//////////  ƒ  BPCAcontrast()  /////////////////////////////////////////////
//export 
function BPCAcontrast (txtY,bgY,places = -1) {
                 // send linear Y (luminance) for text and background.
                // txtY and bgY must be between 0.0-1.0
               // IMPORTANT: Do not swap, polarity is important.

  const icp = [0.0,1.1];     // input range clamp / input error check

  if(isNaN(txtY)||isNaN(bgY)||Math.min(txtY,bgY)<icp[0]||Math.max(txtY,bgY)>icp[1]){
    return 0;  // return zero on error
    // return 'error'; // optional string return for error
  };

//////////   BPCA 0.1.2 G - 4g Constants   ///////////////////////

  const normBG = 0.56, 
        normTXT = 0.57,
        revTXT = 0.62,
        revBG = 0.65;  // G-4g constants for use with 2.4 exponent

  const blkThrs = 0.022,
        blkClmp = 1.414, 
        scaleBoW = 1.14,
        scaleWoB = 1.14,
        loBoWoffset = 0.027,
        loWoBoffset = 0.027,
        bridgeWoBfact = 0.1414,
        bridgeWoBpivot = 0.84,
        loClip = 0.1,
        deltaYmin = 0.0005;


//////////   SAPC LOCAL VARS   /////////////////////////////////////////

  let SAPC = 0.0;            // For raw SAPC values
  let outputContrast = 0.0; // For weighted final values
  let polCat = 'BoW';        // Polarity Indicator. N normal R reverse

  // TUTORIAL

  // Use Y for text and BG, and soft clamp black,
  // return 0 for very close luminances, determine
  // polarity, and calculate SAPC raw contrast
  // Then scale for easy to remember levels.

  // Note that reverse contrast (white text on black)
  // intentionally returns a negative number
  // Proper polarity is important!

//////////   BLACK SOFT CLAMP   ////////////////////////////////////////

          // Soft clamps Y for either color if it is near black.
  txtY = (txtY > blkThrs) ? txtY :
                            txtY + Math.pow(blkThrs - txtY, blkClmp);
  bgY = (bgY > blkThrs) ? bgY :
                          bgY + Math.pow(blkThrs - bgY, blkClmp);

       ///// Return 0 Early for extremely low ∆Y
  if ( Math.abs(bgY - txtY) < deltaYmin ) { return 0.0; }


//////////   Bridge-PCA/SAPC CONTRAST - LOW CLIP (W3 LICENSE)  ///////////////

  if ( bgY > txtY ) {  // For normal polarity, black text on white (BoW)

                     // Calculate the SAPC contrast value and scale

    SAPC = ( Math.pow(bgY, normBG) - Math.pow(txtY, normTXT) ) * scaleBoW;

                 // Low Clip to prevent polarity reversal
    outputContrast = (SAPC < loClip) ? 0.0 : SAPC - loBoWoffset;

  } else {    // For reverse polarity, light text on dark (WoB)
             // WoB should always return either negative value.
            // OR the output will have R appended as string '23R'
           // OR WoB '23 BoW' toolmaker choice so long as explained
    polCat = 'WoB';

    SAPC = ( Math.pow(bgY, revBG) - Math.pow(txtY, revTXT) ) * scaleWoB;

         // this is a special offset to align with incorrect WCAG_2 math.
    let bridge = Math.max( 0, txtY / bridgeWoBpivot - 1.0 ) * bridgeWoBfact;

// console.log(bridge + ' txtY ' + txtY + ' SAPC ' + SAPC);

    outputContrast = (SAPC > -loClip) ? 0.0 : SAPC + loWoBoffset + bridge;
  }

         // return Lc (lightness contrast) as a signed numeric value 
        // Round to the nearest whole number is optional.
       // Rounded can be a signed INT as output will be within ± 127 
      // places = -1 returns signed float, 0 returns rounded as string

  if(places < 0 ){
    return  outputContrast * 100.0;
  } else if(places == 0 ){
    return  Math.round(Math.abs(outputContrast)*100.0)+'<sub>'+polCat+'</sub>';
  } else if(Number.isInteger(places)){
    return  (outputContrast * 100.0).toFixed(places);
  } else { throw 'Err-3' }

} // End BPCAcontrast()






//////////  ƒ  bridgeRatio()  ////////////////////////////////////////////
//export
function bridgeRatio (contrastLc = 0, ratioStr = ' to 1', places = 1) {
           // Takes the output of APCA (either a string or number)
          // and makes it a WCAG2 ratio, returning a string '4.5 to 1'
         // Jan 16 2022 constants   
    let finalScale = 0.170;
    let preScale = -0.078;
    let powerShift = 3.14159;
    let loThresh = 0.222;
    let loExp = 0.890;

    contrastLc = Math.pow(Math.max(0, Math.abs(parseFloat(contrastLc) * 0.01) +
                 preScale), powerShift) + finalScale;
    
    contrastLc = (contrastLc > loThresh) ? contrastLc :
                 contrastLc - Math.pow(loThresh - contrastLc, loExp);
    
    return ( contrastLc * 10.0 ).toFixed(places) + ratioStr;
}        











//////////  ƒ  sRGBtoY()  //////////////////////////////////////////////////
//export
function sRGBtoY (rgba = [0,0,0]) { // send sRGB 8bpc (0xFFFFFF) or string

/////   Bridge-PCA 0.1.2 G - 4g - W3 Constants   ////////////////////////

const mainTRC = 2.4; // 2.4 exponent emulates actual monitor perception

const sRco = 0.2126478133913640,
      sGco = 0.7151791475336150,
      sBco = 0.0721730390750208; // sRGB coefficients

// Derived from:
// xW	yW	K	xR	yR	xG	yG	xB	yB
// 0.312720	0.329030	6504	0.640	0.330	0.300	0.600	0.150	0.060

         // linearize r, g, or b then apply coefficients
        // and sum then return the resulting luminance

  function simpleExp (chan) { return Math.pow(chan/255.0, mainTRC); };

  return sRco * simpleExp(rgba[0]) +
         sGco * simpleExp(rgba[1]) +
         sBco * simpleExp(rgba[2]);

} // End sRGBtoY()






//////////  ƒ  displayP3toY()  /////////////////////////////////////////////
//export 
function displayP3toY (rgba = [0,0,0]) { // send rgba array

/////   Bridge-PCA 0.1.2 G - 4g - W3 Constants   ////////////////////////

const mainTRC = 2.4; // 2.4 exponent emulates actual monitor perception
                    // Pending evaluation, because, Apple...
    
const sRco = 0.2289829594805780, 
      sGco = 0.6917492625852380, 
      sBco = 0.0792677779341829; // displayP3 coefficients

// Derived from:
// xW	yW	K	xR	yR	xG	yG	xB	yB
// 0.312720	0.329030	6504	0.680	0.320	0.265	0.690	0.150	0.060

         // linearize r, g, or b then apply coefficients
        // and sum then return the resulting luminance

  function simpleExp (chan) { return Math.pow(chan/255.0, mainTRC); };

  return sRco * simpleExp(rgba[0]) +
         sGco * simpleExp(rgba[1]) +
         sBco * simpleExp(rgba[2]);

} // End displayP3toY()







//////////  ƒ  adobeRGBtoY()  /////////////////////////////////////////////
//export 
function adobeRGBtoY (rgb = [0,0,0]) { // send rgba array

// NOTE: Currently expects 0-255

/////   Bridge-PCA 0.1.1   G - 4g - W3 Constants   ////////////////////////

const mainTRC = 2.35; // 2.35 exponent emulates actual monitor perception
                     // Pending evaluation...
    
const sRco = 0.2973550227113810, 
      sGco = 0.6273727497145280, 
      sBco = 0.0752722275740913; // adobeRGB coefficients

// Derived from:
// xW	yW	K	xR	yR	xG	yG	xB	yB
// 0.312720	0.329030	6504	0.640	0.330	0.210	0.710	0.150	0.060

         // linearize r, g, or b then apply coefficients
        // and sum then return the resulting luminance

  function simpleExp (chan) { return Math.pow(chan/255.0, mainTRC); };

  return sRco * simpleExp(rgb[0]) +
         sGco * simpleExp(rgb[1]) +
         sBco * simpleExp(rgb[2]);

} // End displayP3toY()




//////////  ƒ  alphaBlend()  /////////////////////////////////////////////
//export 
                      // send rgba array for top, rgb for bottom.
                     // Only foreground has alpha of 0.0 to 1.0 
                    // This blends using gamma encoded space (standard)
                   // rounded 0-255 or set isInt false for float 0.0-1.0
function alphaBlend (rgbaFG=[0,0,0,1.0], rgbBG=[0,0,0], isInt = true ) {
	
	rgbaFG[3] = Math.max(Math.min(rgbaFG[3], 1.0), 0.0); // clamp alpha
	let compBlend = 1.0 - rgbaFG[3];
	let rgbOut = [0,0,0]; // or just use rgbBG to retain other elements?
	
	for (i=0;i<3;i++) {
		rgbOut[i] = rgbBG[i] * compBlend + rgbaFG[i] * rgbaFG[3];
		if (isInt) rgbOut[i] = Math.min(Math.round(rgbOut[i]),255);
	};
  return rgbOut;
} // End alphaBlend()




//////////  ƒ  calcBPCA()  /////////////////////////////////////////////
//export 
function calcBPCA (textColor, bgColor, places = -1, isInt = true) {
        
        // Note that this function required colorParsley !!
	let bgClr = colorParsley(bgColor);
	let txClr = colorParsley(textColor);
	let hasAlpha = (txClr[3] != '' || txClr[3] < 1) ? true : false;

	if (hasAlpha) { txClr = alphaBlend( txClr, bgClr, isInt); };
	
	return BPCAcontrast( sRGBtoY(txClr), sRGBtoY(bgClr), places)
} // End calcBPCA()











///// OPTIONAL STRING PARSING UTILITY //////////////////////////////////////////

/* // PARSESTRING COMMENT SWITCH //////////////////////////////////////
//  (add/remove first slash in the above line to toggle b4 compile)  //


/////  ƒ  colorParsley()  //////////////////////////////////////////////////
//export
function colorParsley (colorIn) {

    if (typeof colorIn === 'string') {
        return parseString(colorIn);
    } else if (typeof colorIn === 'number') {
        return [(colorIn & 0xFF0000) >> 16,
                (colorIn & 0x00FF00) >> 8,
                (colorIn & 0x0000FF), 1.0];
    } else if (typeof colorIn === 'object') {
       if (Array.isArray(colorIn)) {
          return colorIn;
       } else {
          return [colorIn.r,
                  colorIn.g,
                  colorIn.b,
                  colorIn.a]; // warning: make sure obj has r: g: b: a:
       }
    };
    return -1; // return error -1
}




/////  ƒ  parseString()  ///////////////////////////////////////////////////

function parseString (colorString = '#abcdef') {

                  // strip spaces, #, & common junk and make a clean string
    colorString = colorString.replace(/[\s `~!@#$%^&*<>?{}:;"'+=_]/g,'');
    
    colorString = colorString.toLowerCase();   // set lowercase

///// CSS4 NAMED COLORS /////////////

      // See if name is matched and overwrite the input
  let namedColors = { aliceblue:'f0f8ff',antiquewhite:'faebd7',aqua:'00ffff',aquamarine:'7fffd4',azure:'f0ffff',beige:'f5f5dc',bisque:'ffe4c4',black:'000000',blanchedalmond:'ffebcd',blue:'0000ff',blueviolet:'8a2be2',brown:'a52a2a',burlywood:'deb887',cadetblue:'5f9ea0',chartreuse:'7fff00',chocolate:'d2691e',coral:'ff7f50',cornflowerblue:'6495ed',cornsilk:'fff8dc',crimson:'dc143c',cyan:'00ffff',darkblue:'00008b',darkcyan:'008b8b',darkgoldenrod:'b8860b',darkgray:'a9a9a9',darkgreen:'006400',darkgrey:'a9a9a9',darkkhaki:'bdb76b',darkmagenta:'8b008b',darkolivegreen:'556b2f',darkorange:'ff8c00',darkorchid:'9932cc',darkred:'8b0000',darksalmon:'e9967a',darkseagreen:'8fbc8f',darkslateblue:'483d8b',darkslategray:'2f4f4f',darkslategrey:'2f4f4f',darkturquoise:'00ced1',darkviolet:'9400d3',deeppink:'ff1493',deepskyblue:'00bfff',dimgray:'696969',dimgrey:'696969',dodgerblue:'1e90ff',firebrick:'b22222',floralwhite:'fffaf0',forestgreen:'228b22',fuchsia:'ff00ff',gainsboro:'dcdcdc',ghostwhite:'f8f8ff',gold:'ffd700',goldenrod:'daa520',gray:'808080',green:'008000',greenyellow:'adff2f',grey:'808080',honeydew:'f0fff0',hotpink:'ff69b4',indianred:'cd5c5c',indigo:'4b0082',ivory:'fffff0',khaki:'f0e68c',lavender:'e6e6fa',lavenderblush:'fff0f5',lawngreen:'7cfc00',lemonchiffon:'fffacd',lightblue:'add8e6',lightcoral:'f08080',lightcyan:'e0ffff',lightgoldenrodyellow:'fafad2',lightgray:'d3d3d3',lightgreen:'90ee90',lightgrey:'d3d3d3',lightpink:'ffb6c1',lightsalmon:'ffa07a',lightseagreen:'20b2aa',lightskyblue:'87cefa',lightslategray:'778899',lightslategrey:'778899',lightsteelblue:'b0c4de',lightyellow:'ffffe0',lime:'00ff00',limegreen:'32cd32',linen:'faf0e6',magenta:'ff00ff',maroon:'800000',mediumaquamarine:'66cdaa',mediumblue:'0000cd',mediumorchid:'ba55d3',mediumpurple:'9370db',mediumseagreen:'3cb371',mediumslateblue:'7b68ee',mediumspringgreen:'00fa9a',mediumturquoise:'48d1cc',mediumvioletred:'c71585',midnightblue:'191970',mintcream:'f5fffa',mistyrose:'ffe4e1',moccasin:'ffe4b5',navajowhite:'ffdead',navy:'000080',oldlace:'fdf5e6',olive:'808000',olivedrab:'6b8e23',orange:'ffa500',orangered:'ff4500',orchid:'da70d6',palegoldenrod:'eee8aa',palegreen:'98fb98',paleturquoise:'afeeee',palevioletred:'db7093',papayawhip:'ffefd5',peachpuff:'ffdab9',peru:'cd853f',pink:'ffc0cb',plum:'dda0dd',powderblue:'b0e0e6',purple:'800080',rebeccapurple:'663399',red:'ff0000',rosybrown:'bc8f8f',royalblue:'4169e1',saddlebrown:'8b4513',salmon:'fa8072',sandybrown:'f4a460',seagreen:'2e8b57',seashell:'fff5ee',sienna:'a0522d',silver:'c0c0c0',skyblue:'87ceeb',slateblue:'6a5acd',slategray:'708090',slategrey:'708090',snow:'fffafa',springgreen:'00ff7f',steelblue:'4682b4',tan:'d2b48c',teal:'008080',thistle:'d8bfd8',tomato:'ff6347',turquoise:'40e0d0',violet:'ee82ee',wheat:'f5deb3',white:'ffffff',whitesmoke:'f5f5f5',yellow:'ffff00',yellowgreen:'9acd32',gray1:'111111',gray2:'222222',gray3:'333333',gray4:'444444',gray5:'555555',gray6:'666666',gray7:'777777',gray8:'888888',gray9:'999999',graya:'aaaaaa',grayb:'bbbbbb',grayc:'cccccc',grayd:'dddddd',graye:'eeeeee',grey1:'111111',grey2:'222222',grey3:'333333',grey4:'444444',grey5:'555555',grey6:'666666',grey7:'777777',grey8:'888888',grey9:'999999',greya:'aaaaaa',greyb:'bbbbbb',greyc:'cccccc',greyd:'dddddd',greye:'eeeeee'};

    for (let key in namedColors) {
        if (colorString == key) {
            colorString = namedColors[key];
            break;
        }
    }

    // end of named colors section

    // ARRAY OF COLOR DEFINITION OBJECTS
    // objects with alpha are separated, and immediately
    // follow the non-alpha version. Float rgb is not added yet.
    
  let colorDefs = [
    {
      rex: /^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/i,
      parseStr: function (slices){ // rgb(123,123,123)
        return [
          parseInt(slices[1]),
          parseInt(slices[2]),
          parseInt(slices[3])
        ];
      }
    },
    {
      rex: /^rgba\((\d{1,3}),(\d{1,3}),(\d{1,3})\),([01]?[0.1]\d{0,42})\)$/i,
      parseStr: function (slices){ // rgba(123,123,123,1.0)
        return [
          parseInt(slices[1]),
          parseInt(slices[2]),
          parseInt(slices[3]),
          parseInt(slices[4])
        ];
      }
    },
    {
      rex: /^([0-9|a-f])([0-9|a-f])([0-9|a-f])$/i,
      parseStr: function (slices){ // fff
        return [
          parseInt(slices[1]+slices[1],16),
          parseInt(slices[2]+slices[2],16),
          parseInt(slices[3]+slices[3],16)
        ];
      }
    },
    {
      rex: /^([0-9|a-f])([0-9|a-f])([0-9|a-f])([0-9|a-f])$/i,
      parseStr: function (slices){ // fffa
        return [
          parseInt(slices[1]+slices[1],16),
          parseInt(slices[2]+slices[2],16),
          parseInt(slices[3]+slices[3],16),
          parseInt(slices[4]+slices[4],16)
        ];
      }
    },
    {
      rex: /^([0-9|a-f]{2})([0-9|a-f]{2})([0-9|a-f]{2})$/i,
      parseStr: function (slices){ // ffffff
        return [
          parseInt(slices[1],16),
          parseInt(slices[2],16),
          parseInt(slices[3],16)
        ];
      }
    },
    {
      rex: /^([0-9|a-f]{2})([0-9|a-f]{2})([0-9|a-f]{2})([0-9|a-f]{2})$/i,
      parseStr: function (slices){ // ffffffaa
        return [
          parseInt(slices[1],16),
          parseInt(slices[2],16),
          parseInt(slices[3],16),
          parseInt(slices[4],16)
        ];
      }
    }
  ];

  // REGEX SEARCH CASCADE TO DETERMINE INPUT TYPE
  // NEW: Alpha Inputs and the new "2 Char Hex"
  // Which auto-makes grey based on the first
  // two characters typed. (f4 becomes f4f4f4)
  // this.r etc are type INT
  
  let colorDefLen = colorDefs.length;
  let rexInput, slicesInput;
  let r,g,b;
  let a = 1.0, i = 0;

    // Loop stops once valid color is found
  for (; i < colorDefLen; i++) {

    rexInput = colorDefs[i].rex;
    slicesInput = rexInput.exec(colorString);

    if (slicesInput) {
      let channel = colorDefs[i].parseStr(slicesInput);
      //  Shishado™ cleansing masks for that refreshing, clean feeling.
      r = channel[0] & 0xFF;
      g = channel[1] & 0xFF;
      b = channel[2] & 0xFF;
      a = (isNaN(channel[3])) ? 1.0 : Math.min(Math.max(channel[3],0.0),1.0);

      return [r,g,b,a];
    }
  }
    return colorString //false; // return false due to error
}

module.exports = {
   BPCAcontrast,
   sRGBtoY,
   displayP3toY,
   colorParsley
}


/*/ ///// PARSESTRING MID TOGGLE /////

module.exports = {
   BPCAcontrast,
   bridgeRatio,
   sRGBtoY,
   displayP3toY,
   adobeRGBtoY,
   alphaBlend,
   calcBPCA
};

// import { colorParsley } from './colorparsley';

// */ ///// END PARSESTRING COMMENT SWITCH /////



////\                              /////////////////////////////////////////////
/////\  END BPCA  0.1.2 4g BLOCK  /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
