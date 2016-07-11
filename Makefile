all: \
	plok.js \
	plok.min.js \
	plok.css

plok.css: src/plok.css
	cat $< > $@

plok.js: \
	build/plok.js \
	build/view.js \
	build/data.js \
	build/axis.js \
	build/chart.js \
	lib/d3-selection.v1.js \
	lib/d3-array.v1.js \
	lib/d3-collection.v1.js \
	lib/d3-color.v1.js \
	lib/d3-format.v1.js \
	lib/d3-interpolate.v1.js \
	lib/d3-time.v1.js \
	lib/d3-time-format.v1.js \
	lib/d3-scale.v1.js \
	lib/d3-axis.v1.js \
	Makefile

plok.js:
	cat $(filter %.js,$^) > $@

%.min.js: %.js
	java -jar lib/compiler.jar --js $< > $@

lib/d3%.js:
	wget -O $@ https://d3js.org/$(notdir $@)

build/%.js: src/%.js
	@echo "(function() {\n" > $@
	cat $< >> $@
	@echo "\n}());\n" >> $@
	@gjslint $@ | grep 'E:[0-9]\{4\}' \
		| grep -v -f lint_ignore  \
		| python -c 'import sys;l=list(sys.stdin);map(sys.stdout.write,l);sys.exit(bool(l))'


clean:
	-rm build/* -r
	-rm plok.js plok.min.js plok.css lib/d3*

.PHONY: clean
.DELETE_ON_ERROR:

lib/compiler.jar:
	wget -O - https://dl.google.com/closure-compiler/compiler-latest.zip \
		| python3 -c 'import sys,zipfile,io; sys.stdout.buffer.write(zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())).read("compiler.jar"))' > $@

depends: lib/compiler.jar
	sudo pip http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz
	sudo apt-get install openjdk-9-jre-headless

