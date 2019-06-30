const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const log = console.log;

// all environments
app.set('port', process.env.PORT || 8070);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

function controller(path) {
    return require('./controllers/' + path);
}

const Movies = controller('Movies');
const Genres = controller('Genres');


app.get('/', function (req, res) {
    res.redirect('movies/add_movie');
});

Movies(app);
Genres(app);





//app.use(app.router);
http.createServer(app).listen(app.get('port'), function () {
    console.log('Server is running: ' + app.get('port'));
});
