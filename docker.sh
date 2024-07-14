docker build -t streamsink-client $(for i in `cat build.args`; do out+="--build-arg $i " ; done; echo $out;out="") .
