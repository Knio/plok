all: plok.js

plok.js: \
	build/plok.js \
	lib/d3.v3.min.js \
	Makefile

plok.js:
	cat $(filter %.js,$^) > $@

%.min.js: %.js
	java -jar lib/compiler.jar --js $< > $@


build/%.js: src/%.js
	@echo "(function() {\n" > $@
	cat $< >> $@
	@echo "\n}());\n" >> $@
	@gjslint $@ | grep 'E:[0-9]\{4\}' \
		| grep -v -f lint_ignore  \
		| python -c 'import sys;l=list(sys.stdin);map(sys.stdout.write,l);sys.exit(bool(l))'


clean:
	-rm build/* -r
	-rm plok.js plok.min.js


.PHONY: clean
.DELETE_ON_ERROR:

depends:
	sudo easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz
	sudo apt-get install openjdk-7-jdk
