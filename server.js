// Run in cmd with `node server.js`
var http = require('http'),
	fs = require('fs'),
	url = require('url'),
	mysql = require('mysql'),
	N = 128;
    
var express = require('express');
var cors = require('cors');
var app = express();
app.use(cors());
	
var mscon = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "IAmR00t", //@todo make this actually secure
	database: "projdb"
});
mscon.connect(function(err) {
	// if(err) throw err;
	if(err) console.error(err); //it's a pain having it refuse to work unless the mysql server is running
}); 

http.createServer(function(request, response){
	var path = url.parse(request.url).pathname;
	if(path=="/getboard"){
        let params = url.parse(request.url, true).query;
        let name = (params.name || 'default').replace(/[/\\\.]/g,'');
		console.log("request for a board state recieved");
		// var data = fs.readFileSync("./board.txt");
		var data = fs.readFileSync("./boards/"+name+".txt");
		// console.log("Synchronous read: \n" + data.toString());
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
        let name = (params.name || 'default').replace(/[/\\\.]/g,'');
		let state = (params.state == "true");
		console.log("changing cell at x="+x+",y="+y+" to "+state);
		let data = fs.readFileSync('boards/'+name+'.txt').toString('UTF-8');
		// console.log(data);
		let lines = data.replace(/^\s+/,"").replace(/ /,".").split(/[\n\r,/]/);
		while(lines[y].length < N){ lines[y] = lines[y] + '.'; } ////
		
		lines[y] = lines[y].slice(0,x) + (state ? 'O' : '.') + lines[y].slice(x+1);
		while(lines[y].length < N){ lines[y] = lines[y] + '.'; }
		
		fs.writeFileSync('./boards/'+name+'.txt', lines.join('\n'));
		console.log("new state saved");
		
		//@TODO! update schema to support multiple boards
		mscon.query('INSERT INTO changes(x,y,ts,ns) VALUES('+x+','+y+','+Date.now()+','+state+')',
		  function (err, result, fields) {
			if (err) throw err;
			console.log(result);
		});
	
		
		// response.setContentType("text/plain"); 
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.writeHead(200, {"Access-Control-Allow-Origin": "*" }); 
		response.end(lines.join('\n'));
		console.log("data sent");
	}
    else if(path=="/setboard"){
		let params = url.parse(request.url, true).query;
        let name = (params.name || 'default').replace(/[/\\\.]/g,'');
		console.log("update for board \""+name+"\" recieved");
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        // request.on('end', () => {
            // response.end('ok');
        // });
        
        // @todo figure out how to track this with db, and authentication???
		
		fs.writeFileSync('./boards/'+name+'.txt', body);
		console.log("new state saved for "+name);
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