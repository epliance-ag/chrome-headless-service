#!/usr/bin/env bash

diffpdf reference/simplepage.pdf result/simplepage.pdf
diffpdf reference/headerfooter.pdf result/headerfooter.pdf
diffpdf reference/onlyfooter.pdf result/onlyfooter.pdf
diffpdf reference/mergeheaderfooter.pdf result/mergeheaderfooter.pdf
diffpdf reference/merge.pdf result/merge.pdf
diffpdf reference/stripjs.pdf result/stripjs.pdf
diffpdf reference/simplepagelandscape.pdf result/simplepagelandscape.pdf
