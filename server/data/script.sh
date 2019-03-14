#!/bin/sh

#find . -name "s2-corpus-*" -print -exec gunzip -k -S ".json" {} /; -exec

#&& gunzip *.gz &&
#find . -name "s2-corpus-*"  -print -exec mongoimport --numInsertionWorkers 2 --db search --collection semanticscholar --file  {} \; -exec rm {} \;
#find . -name "s2-corpus-*" -print -exec curl -XPOST 'localhost:9200/search/semanticscholar/_bulk?pretty' -T {} \; -exec rm {} \;

#wget -i manifest.txt -B https://s3-us-west-2.amazonaws.com/ai2-s2-research-public/open-corpus/
for f in $(find . -name "*.gz"); do 
	temp_dir = "./temp";
	file_name="$f.json";
	gunzip -k "$f" > "$temp_dir/$file_name";
	cd temp_dir;
	echo $file_name;
	split $file_name "$file_name-" -l 5000 -a 3 -d;
	for fs in $(find . -name "$file_name-*"); do
		echo $fs;
		sed 's/^/{"index":{}}\n/' "$fs" > "$fs-i";
		echo "$fs-i";
		curl -XPOST -H 'Content-Type: application/json' 'localhost:9200/search/semanticscholar/_bulk?pretty' --data-binary "@$fs-i";
	done
	DATE=`date '+%Y-%m-%d %H:%M:%S'`;
	echo "$f $DATE" >> completed.log;
	cd ../;
	rm -R "$temp_dir";

	echo "sample:";
	echo curl -H 'Content-Type: application/json' localhost:9200/search/semanticscholar/_search?pretty -d '{"size":1,"query": {"match_all": {}}}';
done


# mv filename temp
# (echo abcdef ; cat temp ; echo ghijkl) > filename
# rm temp
