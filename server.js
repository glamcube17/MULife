// Run in cmd with `node server.js`
var http = require('http'),
	fs = require('fs'),
	url = require('url'),
	mysql = require('mysql'),
	N = 128;
    
var express = require('express');
// var cors = require('cors');
var app = express();
// app.use(cors());
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
});
	
var mscon = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "IAmR00t", //@todo make this actually secure
	database: "projdb"
});
mscon.connect(function(err) {
	// if(err) throw err;
    //it's a pain having it refuse to work unless the mysql server is running
    // if(err){ console.error(err); console.info('could not connect to mysql server, is it running?'); }
    if(err){ console.info('could not connect to mysql server, is it running?'); }
}); 

http.createServer(function(request, response){
	var path = url.parse(request.url).pathname;
	if(path=="/getboard"){
        let params = url.parse(request.url, true).query;
        let name = (params.name || 'default').replace(/[/\\\.]/g,'');
		console.log("request for "+name+" board state recieved");
		// var data = fs.readFileSync("./board.txt");
		var data = fs.readFileSync("./boards/"+name+".txt");
		// var data = json.parse( fs.readFileSync("./boards/"+name+".txt") );
		// console.log("Synchronous read: \n" + data.toString());
		response.writeHead(200, {"Content-Type": "text/json"});
		response.writeHead(200, {"Access-Control-Allow-Origin": "*" }); 
		response.end(data);
		console.log("data sent");
	}
	else if(path=="/changeboard"){
		let params = url.parse(request.url, true).query;
        let name = (params.name || 'default').replace(/[/\\\.]/g,'');
		console.log("change for "+name+" board state recieved");
		// console.log(params);
		let x = parseInt(params.x);
		let y = parseInt(params.y);
		let state = (params.state == "true");
		console.log("changing cell at x="+x+",y="+y+" to "+state);
		let data = JSON.parse( fs.readFileSync('./boards/'+name+'.txt').toString('UTF-8') );
		// console.log(data);
		// let lines = data.state.replace(/^\s+/g,"").replace(/ /g,".").replace(/[\n\r]/g,"/").split("/");
		let lines = data.state;
		while(lines[y].length < N){ lines[y] = lines[y] + '.'; } ////
		
		lines[y] = lines[y].slice(0,x) + (state ? 'O' : '.') + lines[y].slice(x+1);
		while(lines[y].length < N){ lines[y] = lines[y] + '.'; }
        while(lines.length < N){ lines = lines + [ lines[lines.length-1] ]; }
		
		// fs.writeFileSync('./boards/'+name+'.txt', lines.join('\n'));
        data.state = lines;
		fs.writeFileSync('./boards/'+name+'.txt', JSON.stringify(data));
		console.log("new state saved");
		
		//@TODO! update schema to support multiple boards
		mscon.query('INSERT INTO changes(x,y,ts,ns) VALUES('+x+','+y+','+Date.now()+','+state+')',
		  function (err, result, fields) {
			// if (err){console.error(err);}
			if (err){console.error('could not log change to mysql server, is it running?');}
			// console.log(result);
		});
	
		
		response.writeHead(200, {"Content-Type": "text/json"});
		response.writeHead(200, {"Access-Control-Allow-Origin": "*" }); 
		// response.end(lines.join('\n'));
		response.end(JSON.stringify(data));
		console.log("data sent");
	}
    else if(path=="/setboard"){
		let params = url.parse(request.url, true).query;
        let name = (params.name || 'default').replace(/[/\\\.]/g,'');
		console.log("update for "+name+" board state recieved");
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        request.on('end', () => {
            response.end('ok');
            console.log('ok');
            let data = JSON.parse(body);
            if(data.survive === undefined){ data.survive = "23"; }
            if(data.born    === undefined){ data.born    = "3"; }
            // let data = JSON.parse(body);
            // let state = data.state;
            // let data = json.stringify( { "name":name,"survive":params.survive,"born":params.born,"state":body } );
            fs.writeFileSync('./boards/'+name+'.txt', JSON.stringify(data));
            console.log("new state saved for "+name+" (length "+body.length+")");
        });
        response.writeHead(200, {"Content-Type": "text/json"});
		response.writeHead(200, {"Access-Control-Allow-Origin": "*" }); //trying to get cors to work
        
        // @todo figure out how to track this with db, and authentication???
		
		
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
console.log("node server initialized");