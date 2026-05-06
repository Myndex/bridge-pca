# Bridge PCA 

## Font Use 

Unlike the main APCA, BridgePCA is all about "emulating" WCAG\_2 contrast.

So, BridgePCA is a like-for-like replacement of the faulty WCAG\_2 contrast math.

### DIFFERENCES:
For best use, do not switch polarity. Bridge PCA is polarity sensitive, even though WCAG\_2 is not. For light text on a dark background, the result should be a negative number — use the absolute value (ignore the minus sign).

NEW!! Bridge PCA now gives a WCAG 2 style RATIO, as well as an LC value!

Like APCA, BridgePCA reports results as **Lc** (Lightness Contrast) but the conversion to WCAG\_2 ratios is trivial:

- **Lc 60 exceeds WCAG 3:1**
- **Lc 75 exceeds WCAG 4.5:1**
- **Lc 90 exceeds WCAG 7:1**

**BridgePCA** has some minor internal adjustments to align with some of the incorrect aspects of WCAG\_2 contrast math. In order to be backwards compatible, BridgePCA will not forgive the false-fails of WCAG\_2 but BridgePCA will correct the many false passes.

**No Free Lunch:** while BridgePCA corrects the many false passes and improves readability, the cost is that there is reduced design flexibility due to the fact that to maintain backwards compatibility, some contrasts are forced higher than they actually need be.

One of the areas that the WCAG 2 contrast is wrong, relates to users with CVD (color vision deficiency sometimes referred to as colorblind). WCAG&nbsp;2 excludes many colors like reds and oranges against white which are good for CVD especially protanopia, while paradoxically passing those same colors against black, which is substantially worse for CVD.

The <a href="https://apcacontrast.com">full APCA</a> correctly rejects the color combinations that are detrimental to CVD, and passes the colors that are better for CVD—the only area where APCA passes colors that WCAG 2 rejects, are the very color pairs that are better for CVD.

BridgePCA has some minor internal adjustments to align with some of these more incorrect aspects of WCAG&nbsp;2 contrast math, namely the lighter colored pairs. In order to be backwards compatible, BridgePCA will not forgive the false-fails of WCAG&nbsp;2, but BridgePCA **will** correct the many false passes which vastly improves readability.

Nevertheless if you need a "standards compliant" method that also improves readability this is it. If on the other hand you do not need to abide by the letter of any particular standard, you may want to consider the more flexible full APCA solution.


## Why BridgePCA??

BridgePCA was developed to address some concerns raised by some regarding legal requirements. While actual accessibility is what is legal, WCAG&nbsp;2 misses the mark as far as the contrast math is concerned. The algorithm for 1.4.3 and 1.4.11 grossly over rates contrast for dark colors, while underrating light color pairs. There is an unfortunate implication regarding mathematics more than accessibility.

APCA and the [APCA Readability Criterion](https://readtech.org/ARC/) promotes _**actual**_ accessibility whereas WCAG&nbsp;2 contrast does not. That said, WCAG&nbsp;2 contrast's over rating of dark colors is an easy fix, and APCA directly exceeds WCAG&nbsp;2 both mathematically and in terms of actual accessibility. However WCAG&nbsp;2 rejects color pairs involving white, even though they are far more readable than the same color paired with black that WCAG&nbsp;2 passes. APCA, being perceptually uniform, correctly passes the lighter colors that are better for CVD, while rejecting the colors that are worse—but this leads to a mathematical conundrum.

Some have claimed that you have to match the math to be legal, while forgoing actual accessibility. This is not strictly true in any case we are aware of—WCAG&nbsp;2 contrast SCs have not won a case on merits in a court of law. Still, caution is good as the landscape is changing. And Bridge&nbsp;PCA helps here.

BridgePCA maintains backwards compatibility to the flawed WCAG&nbsp;2 contrast but at the loss of some useful flexibility. In other words, it rejects some useable colors all in the name of fitting within the awkward math profile of WCAG&nbsp;2 contrast. It's a way to "force fit" WCAG&nbsp;2  guidelines into something less harmful. But because WCAG_2 contrast ignores spatial characteristics (such as line thickness) as the primary driver of contrast, Bridge&nbsp;PCA is restricted from relaxing contrast on low-spatial frequency elements, which is also specifically needed, yet missing in WCAG&nbsp;2.

For instance, WCAG&nbsp;2 SC 1.4.11 is not supported by any actual science, and makes some logical leaps, ignoring the primary drivers of contrast perception. Moreover, WCAG&nbsp;2 contrast _results_ can be grossly insufficient, or just barely enough, or much more than needed, all depending on context and use-cases — unfortunately WCAG&nbsp;2 contrast ignores context and use-cases.

### Make no mistake: any controversy is over badly conceived math, not actual accessibility.

As such, while the APCA values (2021 with G4g4 constants) are visible, the "WCAG 2" equivalent values are usable as a drop in replacement. As colors get darker, you'll notice that the WCAG 2 values do not rise like the "official" algo, but remain in keeping with perceptual uniformity.

-----

You can see the current working version of BridgePCA at https://www.bridgepca.com

There is more about this project on our main site, https://www.myndex.com/WEB/Perception
