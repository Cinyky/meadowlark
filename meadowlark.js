var express = require('express'),
	formidable = require('formidable'),
	jqupload = require('jquery-file-upload-middleware');

Cache = require('./cache')
var app = express();

// set up handlebars view engine
var handlebars = require('express-handlebars')
	.create({ defaultLayout:'main',
	helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
	}
	});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

var fortuneCookies = [
	"Conquer your fears or they will conquer you.",
	"Rivers need springs.",
	"Do not fear what you don't know.",
	"You will have a pleasant surprise.",
	"Whenever possible, keep it simple.",
];



// mocked weather data
function getWeatherData(){
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}


// middleware to add weather data to context
app.use(function(req, res, next){
	if(!res.locals.partials) res.locals.partials = {};
 	res.locals.partials.weatherContext = getWeatherData();
 	next();
});

// jQuery File Upload endpoint middleware
app.use('/upload', function(req, res, next){
    var now = Date.now();
    jqupload.fileHandler({
        uploadDir: function(){
            return __dirname + '/public/uploads/';
        },
        uploadUrl: function(){
            return '/uploads/';
        },
    })(req, res, next);
});

app.get('/', function(req, res) {
	res.render('home');
});

app.get('/lay', function(req, res) {
	res.render('home',{layout: 'microsite'});
});

app.get('/nolay', function(req, res) {
	res.render('home',{layout: null});
});
app.get('/about', function(req,res){
	var randomFortune = 
		fortuneCookies[Math.floor(Math.random() * fortuneCookies.length)];

	res.render('about', { fortune: randomFortune ,param : "<b>cyy nodejs demo</b>"});
});

app.get('/test', function(req,res){
	var randomFortune = 
		fortuneCookies[Math.floor(Math.random() * fortuneCookies.length)];

	res.render('test', {
			currency: {
	           name: 'United States dollars',
	           abbrev: 'USD',
			}, 
			tours: [
	                   { name: 'Hood River', price: '$99.95' },
	                   { name: 'Oregon Coast', price: '$159.95' },
			],
			specialsUrl: '/january-specials',
			// currencies: [ 'USD', 'GBP', 'BTC' ],
		});
	});


var tours = [
	{ id: 0, name: 'Hood River', price: 99.99 },
	{ id: 1, name: 'Oregon Coast', price: 149.95 },
	];

app.get('/api/tours/:id', function(req,res){
	var p = tours.some(function(p){ 
		return p.id == req.params.id }
	);
	console.log("req.params",req.params.id);
	if( p ) {
		let a = "" ;
		if( req.query.name ) a += req.query.name + " -"; 
		if( req.query.price ) a += req.query.price; 
		res.json({success: a});
	} else {
		res.json({error: 'No such tour exists.'});
	}
});

app.get('/api/ast2/', function(req,res){
	console.log("req.query",req.query);
	return Cache.hget("EqualMap", req.query.id).then(function(resp){
        res.json({success: resp});
	});
});

app.get('/ast', function(req, res){
    // we will learn about CSRF later...for now, we just
    // provide a dummy value
    res.render('ast', { csrf: 'CSRF token goes here' });
});

app.post('/parse', function(req, res){
	var param = req.body;
	// console.log(param);
    if(req.xhr || req.accepts('json,html')==='json'){
		// if there were an error, we would send { error: 'error description' }
		return Cache.hget("EqualMap", param.id).then(function(resp){
			console.log("param.id: " + param.id + " resp: " + resp);
			res.send({ success: true , result: resp});
		});
		// res.send(JSON.stringify(result));
    } else {
        // if there were an error, we would redirect to an error page
        res.redirect(303, '/thank-you');
    }
});
app.get('/parseJS', function(req, res){
    // we will learn about CSRF later...for now, we just
	// provide a dummy value
	Cache.hgetall("Task").then(function(resp){
		console.log(`hgetall:${JSON.stringify(resp)}`);
		resp.taskTimeStr = new Date(parseInt(resp.time).toLocaleString().replace(/:\d{1,2}$/,' ');
		console.log(resp.taskTimeStr)
		if (resp) {
			res.render('parseJS', resp);
		} else {
			res.render('parseJS', {});
		}
	})
});

app.post('/parseTask', function(req, res){
	var param = req.body;
	console.log(param);
    if(req.xhr || req.accepts('json,html')==='json'){
		// if there were an error, we would send { error: 'error description' }
		return Cache.hgetall("Task").then(function(resp){
			console.log(`param.url:${param.url} hgetall:${JSON.stringify(resp)}`);
			if (resp) {
				res.send({ success: true , result: "任务["+param.url+"]已经提交，请耐心等待"});
			} else {
				Cache.hset("Task", "url", param.url);
				Cache.hset("Task", "time", Date.now());
				res.send({ success: true , result: "任务 ["+param.url+"] 提交成功"});
			}
		});
    } else {
        // if there were an error, we would redirect to an error page
        res.redirect(303, '/thank-you');
    }
});

app.get('/jquery-test', function(req, res){
	res.render('jquery-test');
});

app.get('/nursery-rhyme', function(req, res){
	res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme', function(req, res){
	res.json({
		animal: 'squirrel',
		bodyPart: 'tail',
		adjective: 'bushy',
		noun: 'heck',
	});
});


app.get('/tours/hood-river', function(req, res){
	res.render('tours/hood-river');
});
app.get('/tours/oregon-coast', function(req, res){
	res.render('tours/oregon-coast');
});
app.get('/tours/request-group-rate', function(req, res){
	res.render('tours/request-group-rate');
});


app.get('/thank-you', function(req, res){
	res.render('thank-you');
});
app.get('/newsletter', function(req, res){
    // we will learn about CSRF later...for now, we just
    // provide a dummy value
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});
app.post('/process', function(req, res){
    if(req.xhr || req.accepts('json,html')==='json'){
        // if there were an error, we would send { error: 'error description' }
        res.send({ success: true });
    } else {
        // if there were an error, we would redirect to an error page
        res.redirect(303, '/thank-you');
    }
});
app.get('/contest/vacation-photo', function(req, res){
    var now = new Date();
    res.render('contest/vacation-photo', { year: now.getFullYear(), month: now.getMonth() });
});
app.post('/contest/vacation-photo/:year/:month', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});





// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate.' );
});
