///////////////////////////////////////////////////////////////////////////////
/** @preserve
/////    SAPC APCA - Advanced Perceptual Contrast Algorithm
/////           bridge-pca  0.1.6  • BRIDGE contrast function only
/////           DIST: W3 • Revision date: May 17, 2022
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
/////            BPCAcontrast, bridgeRatio, sRGBtoY, displayP3toY, colorParsley
/////            } from 'bridge-pca';
/////    
/////    FORWARD CONTRAST USAGE:
/////    
/////    txtY = sRGBtoY( TEXTcolor );
/////    bgY = sRGBtoY( BACKGNDcolor );
/////    contrastLc = BPCAcontrast( txtY, bgY );
/////    wcag2ratio = bridgeRatio( contrastLc, txtY, bgY );
/////    
/////     Where the colors are sent as an rgba array [0,0,0]
/////
/////     Live Demonstrator at https://www.myndex.com/BPCA/
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
/////   For Evaluations, refer to this as: SAPC-8, v0.1.6 G-series constant 4g
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

//////////   BRIDGE PCA 0.1.6 4g USAGE  ////////////////////////////////////////
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
/////  BEGIN BPCA  0.1.6 4g BLOCK       \//////////////////////////////////////
////                                     \////////////////////////////////////

import { colorParsley, colorToHex, colorToRGB } from 'colorparsley';



//////////  ƒ  BPCAcontrast()  /////////////////////////////////////////////
export function BPCAcontrast (txtY,bgY,places = -1) {
                 // send linear Y (luminance) for text and background.
                // txtY and bgY must be between 0.0-1.0
               // IMPORTANT: Do not swap, polarity is important.

  const icp = [0.0,1.1];     // input range clamp / input error check

  if(isNaN(txtY)||isNaN(bgY)||Math.min(txtY,bgY)<icp[0]||Math.max(txtY,bgY)>icp[1]){
    return 0;  // return zero on error
    // return 'error'; // optional string return for error
  };

//////////   BPCA 0.1.6 G - 4g Constants   ///////////////////////

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
export function bridgeRatio (contrastLc = 0, txtY, bgY, ratioStr = ' to 1', places = 1) {

           // Takes the output of APCA (either a string or number)
          // and makes it a WCAG2 ratio, returning a string '4.5 to 1'
         // Jan 16 2022 constants   
         
    let maxY = Math.max(txtY, bgY);
    
    const offsetA = 0.2693;
    const preScale = -0.0561;
    const powerShift = 4.537;

    const mainFactor = 1.113946;

    const loThresh = 0.3;
    const loExp = 0.48;
    const preEmph = 0.42;
    const postDe = 0.6594;

    const hiTrim = 0.0785;
    const loTrim = 0.0815;
    const trimThresh = 0.506; // #c0c0c0

    let addTrim = loTrim + hiTrim;

    if (maxY > trimThresh) { 
      let adjFact = (1.0 - maxY) / (1.0 - trimThresh) ;
      addTrim = loTrim * adjFact + hiTrim;
    }

    contrastLc = Math.max(0, Math.abs(parseFloat(contrastLc) * 0.01));

         // convert Lc into a WCAG ratio
    let wcagContrast = (Math.pow(contrastLc + preScale, powerShift) + offsetA) *
                        mainFactor * contrastLc + addTrim;

         // adjust WCAG ratios that are under  3 : 1, clean up near 0.
    wcagContrast = (wcagContrast > loThresh) ?
                10.0 * wcagContrast :
                (contrastLc < 0.06) ? 0 :
                10.0 * wcagContrast -
                (Math.pow( loThresh - wcagContrast + preEmph, loExp ) - postDe);

    return (wcagContrast).toFixed(places) + ratioStr; // + '<br>trim:' + addTrim;
}











//////////  ƒ  sRGBtoY()  //////////////////////////////////////////////////
export function sRGBtoY (rgba = [0,0,0]) { // send sRGB 8bpc (0xFFFFFF) or string

/////   Bridge-PCA 0.1.6 G - 4g - W3 Constants   ////////////////////////

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
export function displayP3toY (rgba = [0,0,0]) { // send rgba array

/////   Bridge-PCA 0.1.6 G - 4g - W3 Constants   ////////////////////////

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
export function adobeRGBtoY (rgb = [0,0,0]) { // send rgba array

// NOTE: Currently expects 0-255

/////   Bridge-PCA 0.1.6   G - 4g - W3 Constants   ////////////////////////

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
                      // send rgba array for top, rgb for bottom.
                     // Only foreground has alpha of 0.0 to 1.0 
                    // This blends using gamma encoded space (standard)
                   // rounded 0-255 or set isInt false for float 0.0-1.0
export function alphaBlend (rgbaFG=[0,0,0,1.0], rgbBG=[0,0,0], isInt = true ) {
  
  if (rgbaFG[3]) {
    rgbaFG[3] = Math.max(Math.min(rgbaFG[3], 1.0), 0.0); // clamp alpha
    let compBlend = 1.0 - rgbaFG[3];
    let rgbOut = [0,0,0]; // or just use rgbBG to retain other elements?
  
    for (let i=0;i<3;i++) {
      rgbOut[i] = rgbBG[i] * compBlend + rgbaFG[i] * rgbaFG[3];
      if (isInt) rgbOut[i] = Math.min(Math.round(rgbOut[i]),255);
    };
  
     return rgbOut;
     
  } else { return rgbaFG }
} // End alphaBlend()








//////////  ƒ  calcBPCA()  /////////////////////////////////////////////
export function calcBPCA (textColor, bgColor, places = -1, isInt = true) {
        
        // Note that this function required colorParsley !!
	let bgClr = colorParsley(bgColor);
	let txClr = colorParsley(textColor);
	let hasAlpha = (txClr[3] != '' && txClr[3] < 1) ? true : false;

	if (hasAlpha) { txClr = alphaBlend( txClr, bgClr, isInt); };
	
	return BPCAcontrast( sRGBtoY(txClr), sRGBtoY(bgClr), places)
} // End calcBPCA()



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
/////\  END BPCA  0.1.6 4g BLOCK  /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
