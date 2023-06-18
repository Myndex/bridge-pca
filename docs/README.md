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

**No Free Lunch:** while BridgePCA corrects the many false passes and improve readability, the cost is that there is reduced design flexibility due to the fact that to maintain backwards compatibility, some contrasts are forced higher than they actually need be.

But if you need a standards compliant method that also improves readability this is it. If on the other hand you do not need to abide by the letter of any particular standard, you may want to consider the more flexible full APCA solution.


## Why BridgePCA??

BridgePCA was developed to address some aspersions from a small group of trolls who have been crowing that _"oh WCAG 2 is law tho."_ the truth is that it's not codified as an absolute law in most places, and even so, actual accessibility is what is legal. APCA and the [APCA Readability Criterion](https://readtech.org/ARC/) promotes _**actual**_ accessibility while WCAG_2 contrast does not.

BridgePCA maintains backwards compatibility to the flawed WCAG_2 contrast but at the loss of some useful flexibility. It's a way to "force fit" WCAG_2 guidelines into something less harmful, but because WCAG_2 contrast ignores spatial characteristics such as line thickness as the primary driver of contrast, Bridge PCA is restricted from relaxing contrast on low-spatial frequency elements, which is specifically needed yet missing in WCAG 2.

For instance, WCAG_2 SC 1.4.11 is not supported by any actual science, only some self-referential cites that arguably have no place in a standards document. 1.4.11 makes some logical leaps and ignores the primary drivers of contrast perception. Moreover, WCAG_2 contrast _results_ can be grossly insufficient, or just barely enough, or much more than needed, all depending on context and use-cases — yet WCAG_2 contrast ignores context and use-cases.


-----

You can see the current working version of BridgePCA at https://www.myndex.com/BPCA/

There is more about this project on our main site, https://www.myndex.com/WEB/Perception
