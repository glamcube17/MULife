// `node server.js`
var http = require('http'),
	fs = require('fs'),
	url = require('url'),
	N = 128,
    M = 128;
    
var express = require('express');
var app = express();
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
});
	
// var mscon = mysql.createConnection({
	// host: "localhost",
	// user: "root",
	// password: "IAmR00t", //@todo make this actually secure
	// database: "projdb"
// });
var msok = false;
// mscon.connect(function(err) {
	// // if(err) throw err;
    // //it's a pain having it refuse to work unless the mysql server is running
    // // if(err){ console.error(err); console.info('could not connect to mysql server, is it running?'); }
    // if(err){ console.info('could not connect to mysql server, is it running?'); }
    // else{ msok = true; console.log('connected to mysql server'); }
// }); 

http.createServer(function(request, response){
	var path = url.parse(request.url).pathname;
	
	if(path=="/mulife"){
        console.log("request for page received");
        try{
            fs.readFile("index.html", function (error, pgResp) {
                if(error) {response.writeHead(404);response.write('Not Found');
                }else { response.writeHead(200, { 'Content-Type': 'text/html' }); response.write(pgResp); }
                response.end();
            });
        }catch(e){console.log(e);}
    }
    else if(path=="/css/uibase.css"){
        console.log("request for stylesheet received");
        try{
            fs.readFile("css/uibase.css", function (error, pgResp) {
                if(error) {response.writeHead(404);response.write('Not Found');
                }else { response.writeHead(200, { 'Content-Type': 'text/css' }); response.write(pgResp); }
                response.end();
            });
        }catch(e){console.log(e);}
    }
    else if(path=="/css/jquery-ui.css"){
        console.log("request for other stylesheet received");
        try{
            fs.readFile("css/jquery-ui.css", function (error, pgResp) {
                if(error) {response.writeHead(404);response.write('Not Found');
                }else { response.writeHead(200, { 'Content-Type': 'text/css' }); response.write(pgResp); }
                response.end();
            });
        }catch(e){console.log(e);}
    }
    else if(path=="/css/jquery-ui-1.12.icon-font.css"){
        console.log("request for other other stylesheet received");
        try{
            fs.readFile("css/jquery-ui-1.12.icon-font.css", function (error, pgResp) {
                if(error) {response.writeHead(404);response.write('Not Found');
                }else { response.writeHead(200, { 'Content-Type': 'text/css' }); response.write(pgResp); }
                response.end();
            });
        }catch(e){console.log(e);}
    }
    else if(path=="/javascript/jquery.js"){
        console.log("request for jquery files received");
        try{
            fs.readFile("javascript/jquery.js", function (error, pgResp) {
                if(error) {response.writeHead(404);response.write('Not Found');
                }else { response.writeHead(200, { 'Content-Type': 'text/js' }); response.write(pgResp); }
                response.end();
            });
        }catch(e){console.log(e);}
    }
    else if(path=="/javascript/jquery-ui.js"){
        console.log("request for other jquery files received");
        try{
            fs.readFile("javascript/jquery-ui.js", function (error, pgResp) {
                if(error) {response.writeHead(404);response.write('Not Found');
                }else { response.writeHead(200, { 'Content-Type': 'text/js' }); response.write(pgResp); }
                response.end();
            });
        }catch(e){console.log(e);}
    }
    
    
    
    
    
    
    // actual controls
    
    
	else if(path=="/getboard"){
        let params = url.parse(request.url, true).query;
        let name = (params.name || 'default').replace(/[/\\\.]/g,''); //sanitize filepath
		console.log("request for "+name+" board state recieved");
        let data;
        try{
            data = fs.readFileSync("./boards/"+name+".json");
        }catch(e){
            // if(e.code === 'ENOENT'){
            console.log("no such file or something went wrong, creating blank canvas");
            let lines = new Array(128);
            for(let i = 0; i < 128; i++){
                lines[i] = '0'.repeat(128);
            }
            data = JSON.stringify({'name':name,'survive':'23','born':'3','width':128,'height':128,
                                   'wrap':true,'wrapx':true,'wrapy':true,'edgestate':0,
                                   'palette':'μLife Default','state':lines});
        }
        response.writeHead(200, {"Content-Type": "text/json"});
        response.writeHead(200, {"Access-Control-Allow-Origin": "*" }); 
        response.end(data);
        console.log("data sent");
	}
	else if(path=="/changeboard"){
		let params = url.parse(request.url, true).query;
        let name = (params.name || 'default').replace(/[/\\\.]/g,''); //sanitize filepath
		console.log("change for "+name+" board state recieved");
		// console.log(params);
		let x = parseInt(params.x);
		let y = parseInt(params.y);
		let state = params.state;
		console.log("changing cell at x="+x+",y="+y+" to "+state);
		let data = JSON.parse( fs.readFileSync('./boards/'+name+'.json').toString('UTF-8') );
		// console.log(data);
		// let lines = data.state.replace(/^\s+/g,"").replace(/ /g,".").replace(/[\n\r]/g,"/").split("/");
		let lines = data.state;
        let N = data.width || 128;
        let M = data.height || 128;
		while(lines[y].length < N){ lines[y] = lines[y] + '.'; } ////
		
		// lines[y] = lines[y].slice(0,x) + (state ? 'O' : '.') + lines[y].slice(x+1);
		lines[y] = lines[y].slice(0,x) + (state) + lines[y].slice(x+1);
		while(lines[y].length < N){ lines[y] = lines[y] + '0'; }
        while(lines.length < M){ lines = lines + [ lines[lines.length-1] ]; }
		
        data.state = lines;
		fs.writeFileSync('./boards/'+name+'.json', JSON.stringify(data));
		console.log("new state saved");
		
		//@TODO! update schema to support multiple boards
        if(msok){
            mscon.query('INSERT INTO changes(x,y,ts,ns) VALUES('+x+','+y+','+Date.now()+','+state+')',
              function (err, result, fields) {
                // if (err){console.error(err);}
                if (err){console.error('could not log change to mysql server, is it running?');}
                // console.log(result);
            });
        }
		
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
            if(data.survive   === undefined){ data.survive   = "23"; }
            if(data.born      === undefined){ data.born      = "3"; }
            if(data.width     === undefined){ data.width     = "128"; }
            if(data.height    === undefined){ data.height    = "128"; }
            if(data.wrap      === undefined){ data.wrap      = "true"; }
            if(data.wrapx     === undefined){ data.wrapx     = "true"; }
            if(data.wrapy     === undefined){ data.wrapy     = "true"; }
            if(data.edgestate === undefined){ data.edgestate = "0"; }
            fs.writeFileSync('./boards/'+name+'.json', JSON.stringify(data));
            console.log("new state saved for "+name+" (length "+body.length+")");
        });
        response.writeHead(200, {"Content-Type": "text/json"});
		response.writeHead(200, {"Access-Control-Allow-Origin": "*" }); //trying to get cors to work
        // @todo figure out how to track this with db, and authentication???
	}
    else if(path=="/listboards"){
        console.log("request for list of saved boards received");
        let files = fs.readdirSync('./boards');
        for(let i=0; i<files.length; i++) {
            files[i] = files[i].split('.')[0];
        }
        // console.log(files);
        response.writeHead(200, {"Content-Type": "text/json"});
		response.writeHead(200, {"Access-Control-Allow-Origin": "*" });
        response.end( JSON.stringify({ "boards":files }) );
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
//console.log("I am ready!");
