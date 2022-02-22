#!/bin/sh
convert -density 4096x4096 -background transparent -resize 256x256 favicon.svg favicon.png

convert -define icon:auto-resize -colors 256 favicon.png ../src/favicon.ico

rm -f favicon.png
