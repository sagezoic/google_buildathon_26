#!/bin/zsh
# tile.sh out.jpg a b c d  (times)
out=$1; shift
ffmpeg -loglevel error -y -i t$1.png -i t$2.png -i t$3.png -i t$4.png -filter_complex "[0]scale=960:-1[a];[1]scale=960:-1[b];[2]scale=960:-1[c];[3]scale=960:-1[d];[a][b]hstack[x];[c][d]hstack[y];[x][y]vstack" $out
