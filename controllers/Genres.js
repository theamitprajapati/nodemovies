const Core = require("./Core");
const Genre_model = Core.model("../models/genre_model");


module.exports = (router) => {

    let genres = new Genre_model();
    router.get("/genres/add_genre", (req, res) => {
        res.render('genres/add_genre');
    });

    router.post("/genres/add_genre", function (req, res) {
        var r = req.body;
        var data = {
            id: (new Date().getTime()).toString(),
            title: r.title
        };

        genres.entry(data, (ress, err) => {
            res.redirect('/genres/add_genre');
        });
    });

    router.get("/genres/list_genres", (req, res) => {
        r = req.query;
        let rows = genres.list({query:r},(err,rows)=>{
            res.render('genres/list_genres',{rows:rows});
        })
    });

    router.get("/genres/details_genre", (req, res) => {
        r = req.query;
        genres.find({query:r},(err,row)=>{
            if(row.length > 0) row = row[0];
            res.render('genres/details_genres',{row:row});
        });
    });


    router.get("/genres/edit_genre", (req, res) => {
        r = req.query;
        genres.find({query:r},(err,row)=>{
            if(row.length > 0) row = row[0];
            res.render('genres/edit_genre',{row:row});
        });
    });

    router.post("/genres/edit_genre", function (req, res) {
        var r = req.body;
        var data = {
            title: r.title,
            year: r.year,
            director: r.director,
            description: r.description,
            genre: r.genre
        };

        genres.update({id: r.id},{'$set': data}, (ress, err) => {
            res.redirect('/genres/edit_genre?id='+r.id);
        });

    });

    router.get("/genres/delete_genre", (req, res) => {
        r = req.query;
        filter = {query:{id: r.id}};
        console.log(filter);
        genres.deleteReport(filter,(ress, err) => {
            res.redirect('/genres/list_genres');
        });
    });

};