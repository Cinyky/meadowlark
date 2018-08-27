var express = require('express');

var app = express();

// set up handlebars view engine
var handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
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

app.get('/', function(req, res) {
	res.render('home');
});
app.get('/about', function(req,res){
	var randomFortune = 
		fortuneCookies[Math.floor(Math.random() * fortuneCookies.length)];

	res.render('about', { fortune: randomFortune ,param : "cyy nodejs demo"});
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