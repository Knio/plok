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
	lib/d3.v3.js \
	Makefile

plok.js:
	cat $(filter %.js,$^) > $@

%.min.js: %.js
	java -jar lib/compiler.jar --js $< > $@

lib/d3.v3.js:
	wget -O $@ http://d3js.org/d3.v3.js

build/%.js: src/%.js
	@echo "(function() {\n" > $@
	cat $< >> $@
	@echo "\n}());\n" >> $@
	@gjslint $@ | grep 'E:[0-9]\{4\}' \
		| grep -v -f lint_ignore  \
		| python -c 'import sys;l=list(sys.stdin);map(sys.stdout.write,l);sys.exit(bool(l))'


clean:
	-rm build/* -r
	-rm plok.js plok.min.js plok.css lib/d3.v3.js


.PHONY: clean
.DELETE_ON_ERROR:

depends:
	sudo easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz
	sudo apt-get install openjdk-7-jdk
