var express = require('express');

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
