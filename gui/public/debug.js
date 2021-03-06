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
function setPin(pin, to) {
	if(to == "1")
		window.document.getElementById("led"+pin).checked = true;
	else
		window.document.getElementById("led"+pin).checked = false;
}

function setPinIO(pin, to) {
	if(to == "0") {
		window.document.getElementById("pin"+pin+"Type").innerText = "OUT";
		window.document.getElementById("led"+pin).disabled = true;
	}
	else {
		window.document.getElementById("pin"+pin+"Type").innerText = "IN";
		window.document.getElementById("led"+pin).disabled = false;
	}
}

function updatePin(elem) {
	if(block_run_controls) return
	block();
	if(elem.checked) {
		send('set '+elem.id[3]+' 1');
	}
	else {
		send('set '+elem.id[3]+' 0');
	}

}

function set_run_controls_active(enable) {
	block_run_controls = !enable
	var controls = document.getElementById('run_controls').children;
	for(i in controls) {
		controls[i].disabled = !enable
	}

}

function set_app_controls_active(enable) {
	block_run_controls = !enable
	var controls = document.getElementById('app_controls').children;
	for(i in controls) {
		controls[i].disabled = !enable
	}
}

function block() {
	window.document.getElementById("spinner").display = "block";
}

function unblock() {
	window.document.getElementById("spinner").display = "none";
}

function send(data) {
	block()
	set_run_controls_active(false);
	textarea.value+=data+"\n";
	textarea.scrollByPages(20);
	app.stdin.write(data+"\n");
}

function parse_data(data) {
	parts = data.split("\n")
	for(i in parts) {
		line = parts[i];
		if(matches = /pin ([1-7]): (0|1)/.exec(line)) {
			setPin(matches[1], matches[2]);
		}
		else if(matches = /io ([1-7]): (0|1)/.exec(line)) {
			setPinIO(matches[1], matches[2]);
		}
		else if(line == "done") {
			if(document.getElementById('run').checked)
				send('cont')
			else
				set_run_controls_active(true)
		}
	}
}

function start_program() {
	if(typeof app !== 'undefined') app.kill('SIGKILL');
	var spawn = require('child_process').spawn;
	textarea = document.getElementsByTagName('textarea')[0];
	textarea.innerHTML+='$ ./app\n';
	block()
	set_app_controls_active(false)
	app = spawn('./app', [], {'cwd': __dirname+'/../program'});
	window.beforeunload = function() { app.kill('SIGKILL');};
	set_run_controls_active(true)
	unblock()
	app.on('exit', function(code, signal) {
		set_run_controls_active(false);
		set_app_controls_active(true)
		if(code > 0) {
			textarea.value+='[app] exited with errorcode '+code+"\n";
		}
		else if(signal !== null) {
			textarea.value+='[app] killed by '+signal+"\n";
		}
		textarea.scrollByPages(20);
		unblock();

	});
	app.stdout.on('data', function(data) {
		parse_data(data.toString('ascii'));
		textarea.value+=data;
		textarea.scrollByPages(20);
	});
	app.stderr.on('data', function(data) {
		textarea.value+='[stderr] '+data;
		textarea.scrollByPages(20);
	});
	
}

function load_led_data() {
    require('fs').readFile(__dirname+'/debug.settings', function(err, data) {
        if(err) return;
        var lines = data.toString().split("\n");
        var rows = document.getElementsByTagName('table')[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        for(var i = 0; i < 7; i++) {
            rows[i].getElementsByTagName('td')[0].innerText = lines[i];
        }
    });
}

function save_led_data() {
    var lines = [];
    var rows = document.getElementsByTagName('table')[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for(var i = 0; i < 7; i++) {
        lines[i] = rows[i].getElementsByTagName('td')[0].innerText;
    }
    var data = lines.join("\n");
    require('fs').writeFileSync(__dirname+'/debug.settings', data);
}




