/*
 * Copyright (c) 2013 Lars Vierbergen
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function exec_make() {
	var execv = require('child_process').exec;
	var make = execv('make clean all',{'cwd': __dirname+'/..'});
	var textarea = document.getElementsByTagName('textarea')[0];
	make.on('exit', function(code) {
		if(code > 0) {
			textarea.value+='[make] exited with errorcode '+code+"\n";
		}
		else {
			document.getElementById('enter_debugger').disabled = false;
			document.getElementById('enter_debugger').click();
		}
		document.getElementById('spinner').display="none";

	});
	document.getElementById('spinner').display="block";
	textarea.value+="$ make clean all\n";
	
	make.stdout.on('data', function(data) {
		textarea.value+=data;
	});
	make.stderr.on('data', function(data) {
		textarea.value+='[stderr]'+data;
	});

}
