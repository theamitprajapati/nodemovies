const Core = require("./Core");
const Movies_model = Core.model("../models/movies_model");
const Genre_model = Core.model("../models/genre_model");


module.exports = (router) => {

    let movies = new Movies_model();
    let genre = new Genre_model();

    router.get("/movies/add_movie", (req, res) => {
        genre.list({}, (err, rows) => {
            res.render('movies/add_movie', {genres: rows});
        });
    });

    router.post("/movies/add_movie", function (req, res) {
        var r = req.body;
        var data = {
            id: (new Date().getTime()).toString(),
            title: r.title,
            year: r.year,
            director: r.director,
            description: r.description,
            genre: r.genre
        };

        movies.entry(data, (ress, err) => {
            res.redirect('/movies/add_movie');
        });
    });

    router.get("/movies/list_movies", (req, res) => {
        r = req.query;
        if(r.genre )
           r = r.genre.length == 0 ? r = {} : r;

        movies.list(r, (err, rows) => {
            genre.list({}, (gerr, genrs) => {
                res.render('movies/list_movies', {rows: rows, genres_list: genrs});
            })
        })
    });

    router.get("/movies/dump", (req, res) => {
        r = req.query;
        let rows = movies.movies_list({}, (err, rows) => {
            console.log(rows);
            res.send(rows);
        })
    });

    router.get("/movies/details_movie", (req, res) => {
        r = req.query;
        movies.find({query: r}, (err, row) => {
            if (row.length > 0) row = row[0];
            res.render('movies/details_movies', {row: row});
        });
    });


    router.get("/movies/edit_movie", (req, res) => {
        r = req.query;
        movies.find({query: r}, (err, row) => {
            if (row.length > 0) row = row[0];
            genre.list({}, (err, genrs) => {
            res.render('movies/edit_movie', {row: row,genres_list: genrs});
        });
        });
    });

    router.post("/movies/edit_movie", function (req, res) {
        var r = req.body;
        var data = {
            title: r.title,
            year: r.year,
            director: r.director,
            description: r.description,
            genre: r.genre
        };

        movies.update({id: r.id}, {'$set': data}, (ress, err) => {
            res.redirect('/movies/edit_movie?id=' + r.id);
        });

    });

    router.get("/movies/delete_movie", (req, res) => {
        r = req.query;
        filter = {query: {id: r.id}};
        console.log(filter);
        movies.deleteReport(filter, (ress, err) => {
            res.redirect('/movies/list_movies');
        });
    });

};