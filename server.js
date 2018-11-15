// Run in cmd with `node server.js`
var http = require('http'),
	fs = require('fs'),
	url = require('url'),
	mysql = require('mysql'),
	N = 128;
	
var mscon = mysql.createConnection({
	// host: "localhost",
	host: "127.0.0.1",
	user: "root",
	password: "IAmR00t"
});

// 'use strict';
// const mysqlx = require('@mysql/xdevapi');
// const options = {
  // host: 'localhost',
  // port: 33060,
  // password: 'IAmR00t',
  // user: 'root',
  // schema: 'projdb'
// };


mscon.connect(function(err) {
	if(err) throw err; //Here's where it's throwing a bitch fit about not supporting shit
	mscon.query("SELECT x,y,ts FROM changes WHERE newstate=1", function (err, result) {
		if (err) throw err;
		console.log("Result: " + result);
	});
}); 
	
http.createServer(function(request, response){
	var path = url.parse(request.url).pathname;
	if(path=="/getstring"){
		console.log("request recieved");
		var string = choices[Math.floor(Math.random()*choices.length)];
		console.log("string '" + string + "' chosen");
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.writeHead(200, {"Access-Control-Allow-Origin": "*" }); 
		response.end(string);
		console.log("string sent");
	}
	else if(path=="/getboard"){
		console.log("request for a board state recieved");
		var data = fs.readFileSync("./board.txt");
		console.log("Synchronous read: \n" + data.toString());
		// response.setContentType("text/plain"); 
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.writeHead(200, {"Access-Control-Allow-Origin": "*" }); 
		response.end(data);
		console.log("data sent");
	}
	else if(path=="/changeboard"){
		console.log("update for board state recieved");
		let params = url.parse(request.url, true).query;
		// console.log(params);
		let x = parseInt(params.x);
		let y = parseInt(params.y);
		let state = (params.state == "true");
		console.log("changing cell at x="+x+",y="+y+" to "+state);
		let data = fs.readFileSync('board.txt').toString('UTF-8');
		// console.log(data);
		let lines = data.replace(/^\s+/,"").replace(/ /,".").split(/[\n\r,/]/);
		// while(lines[y].length < N){ lines[y] = lines[y] + '.'; }
		
		lines[y] = lines[y].slice(0,x) + (state ? 'O' : '.') + lines[y].slice(x+1);
		while(lines[y].length < N){ lines[y] = lines[y] + '.'; }
		
		fs.writeFileSync('board.txt', lines.join('\n'));
		console.log("new state saved");
		// response.setContentType("text/plain"); 
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.writeHead(200, {"Access-Control-Allow-Origin": "*" }); 
		response.end(lines.join('\n')); //@todo eliminate redundant operation
		console.log("data sent");
	}
	else{
		fs.readFile('./index.html', function(err, file) {  
			if(err) {  
				// write an error response or nothing here  
				return;  
			}  
			response.writeHead(200, { 'Content-Type': 'text/html' });
			response.end(file, "utf-8");  
		});
	}
}).listen(8001);
console.log("server initialized");