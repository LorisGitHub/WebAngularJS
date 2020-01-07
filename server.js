const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Client } = require('pg')
const MongoDBStore = require('connect-mongodb-session')(session);
const sha1 = require('sha1')
const mongodb = require('mongodb')
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const app = express();
const port = 3019;

/*var client = new pageXOffset.Client({
    host: 'localhost',
    database: "etd",
    user: "uapv1603344",
    password: "ARY74u"
}); */

var clientId;

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());

// Listen to port
var server = app.listen(port, function(){
    console.log(`Listening on port ${port}!`);
});

app.all('/', function(req, res){
    res.sendFile(path.join(__dirname, './CERIGame', 'index.html')); 
});

//Middleware mongodb
app.use(session({// charge le middleware express-session dans la pile 
    secret: 'ma phrase secrete',
    saveUninitialized: false, // Session créée uniquement à la première sauvegarde de données
    resave: false, // pas de session sauvegardée si pas de modif
    store : new MongoDBStore({ // instance de connect-mongodb-session
        uri: 'mongodb://localhost:27017/db',
        collection: 'mySessions3019',
        touchAfter: 24 * 3600 // 1 sauvegarde toutes les 24h hormis si données MAJ 
    }), 
    cookie : {maxAge : 24 * 3600 * 1000} // millisecond valeur par défaut  { path: '/', httpOnly: true, secure: false, maxAge: null } 
}));

// Form 
app.post('/login', function(req, resp){
    
    var client = new Client({
        host: 'localhost',
        database: "etd",
        user: "uapv1603344",
        password: "ARY74u"
    });


    client.connect();

    client.query("SELECT * from fredouil.users WHERE identifiant = '" + req.body['iduser'] +"' AND motpasse = '" + sha1(req.body['pass']) + "'", (err, res) => {

        if( res.rowCount == 1 ){

            req.session.userID = res.rows[0].id;
            console.log(req.session.userID +" expire dans "+req.session.cookie.maxAge);

            client.query("UPDATE fredouil.users SET statut = '1' WHERE identifiant = '" + req.body['iduser'] + "'", (err, resstat) => {
                console.log(resstat);
            });

            client.end();

            resp.send({id: res.rows[0].id, "identifiant": res.rows[0].identifiant,"nom": res.rows[0].nom, "prenom": res.rows[0].prenom, "daten": res.rows[0].date_de_naissance, "status": res.rows[0].status, "humeur": res.rows[0].humeur});
        }

    });

        
});

app.post('/logout', function(req, resp){
    
    var client = new Client({
        host: 'localhost',
        database: "etd",
        user: "uapv1603344",
        password: "ARY74u"
    });

    client.connect();

    client.query("UPDATE fredouil.users SET statut = '0' WHERE id = '" + req.body['id'] + "'", (err, res) => {

        client.end();

        console.log(res);
        resp.send(res);

    });
});

app.post('/users', function(req, resp){
    
    var client = new Client({
        host: 'localhost',
        database: "etd",
        user: "uapv1603344",
        password: "ARY74u"
    });

    client.connect();

    client.query("SELECT * from fredouil.users WHERE statut = 1;", (err, res) => {

        client.end();

        console.log(res.rows);
        resp.send(res.rows);

    });
});

app.post('/changeHumor', function(req, resp){
    
    var client = new Client({
        host: 'localhost',
        database: "etd",
        user: "uapv1603344",
        password: "ARY74u"
    });

    console.log(req.body['iduser'])
    console.log(req.body['humor']);

    client.connect();

    client.query("UPDATE fredouil.users SET humeur='" + req.body['humor'] + "' WHERE id=" + req.body['iduser'] , (err, res) => {

        client.end();

        console.log(res);
        resp.send(res);

    });
});


app.get('/quizz', function(req, res){
    MongoClient.connect("mongodb://localhost:27017/", { useNewUrlParser: true },function (err, db) {
        if (err) throw err;
        var dbo = db.db("db");
        dbo.collection("quizz").find({}).toArray(function (err, result) {
            if (err) throw err;
            
            res.send(result);
            db.close();
        });
    });
});

app.post('/Defi', function(req, res){

    console.log("nouveau defi recu");

    MongoClient.connect("mongodb://localhost:27017/", { useNewUrlParser: true },function (err, db) {
        if (err) throw err;
        var dbo = db.db("db");

        console.log(req.body);

        dbo.collection("defi").insert(req.body);
        db.close();
    });
});

app.post('/RemoveDefi', function(req, res){

    MongoClient.connect("mongodb://localhost:27017/", { useNewUrlParser: true },function (err, db) {
        if (err) throw err;
        var dbo = db.db("db");

        console.log(req.body);

        dbo.collection("defi").remove(req.body);
        db.close();
    });
});

app.post('/DefiResult', function(req, resp){

    console.log("upload defi result");

    var client = new Client({
        host: 'localhost',
        database: "etd",
        user: "uapv1603344",
        password: "ARY74u"
    });

    console.log(req.body['id_users_gagnant']);
    console.log(req.body['id_users_perdant']);

    client.connect();

    client.query({ text :"INSERT INTO fredouil.hist_defi(id_users_gagnant, id_users_perdant, date) VALUES (" + req.body['id_users_gagnant'] + "," + req.body['id_users_perdant'] + ", NOW() )"},(err, res) => {
        resp.send(res);
        client.end();
    });

});

app.get('/historique', function(req, resp){

    var client = new Client({
        host: 'localhost',
        database: "etd",
        user: "uapv1603344",
        password: "ARY74u"
    });

    client.connect();

    // req.body['iduser']
    client.query("SELECT * from fredouil.historique WHERE id_users=" + req.query.id + " ORDER BY date DESC LIMIT 10", (err, res) => {
        resp.send(res.rows);
        client.end();
    });
});

app.post('/leaderboard', function(req, resp){

    var client = new Client({
        host: 'localhost',
        database: "etd",
        user: "uapv1603344",
        password: "ARY74u"
    });

    client.connect();

    client.query("SELECT MAX(score), fredouil.users.identifiant  FROM fredouil.historique INNER JOIN fredouil.users ON fredouil.historique.id_users=fredouil.users.id GROUP BY fredouil.users.identifiant, id_users ORDER BY max(score) DESC;", (err, res) => {
        //console.log(res.rows);
        resp.send(res.rows);
        client.end();
    });
});

app.post('/uploadScore', function(req, resp){

    var client = new Client({
        host: 'localhost',
        database: "etd",
        user: "uapv1603344",
        password: "ARY74u"
    });

    client.connect();

    client.query({ text :"INSERT INTO fredouil.historique(id_users, date, nbreponse, temps, score) VALUES (" + req.body['iduser'] +",NOW(),"+ req.body['nbreponse'] +"," + req.body['temps'] + "," + req.body['score'] + ")"},(err, res) => {
        resp.send(res);
        client.end();
    });

});

// --------------------------------------------------------------------------
// ----------------------- Initialisation des sockets -----------------------
// --------------------------------------------------------------------------

var clientServer = require('socket.io-client').connect("http://pedago01c.univ-avignon.fr:3019/");
clientServer.once( "connect", function () {
    console.log( 'Client: Connected to port ' );

    clientServer.emit( "console", "Hello World");
} );



var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

    socket.on('getId', function(data){
        clientId = data;
        //console.log(data);
    });

    setInterval(function(){

        // Recupere l'id client réglulierement
        socket.emit('getId');

        // Update la liste des users et des défis toutes les x secondes
        var client = new Client({
            host: 'localhost',
            database: "etd",
            user: "uapv1603344",
            password: "ARY74u"
        });

        client.connect();

        client.query("SELECT * from fredouil.users WHERE statut = 1;", (err, res) => {

            client.end();
            socket.emit('users', res.rows);

        });

        if(clientId !== null && clientId !== undefined){
            MongoClient.connect("mongodb://localhost:27017/", { useNewUrlParser: true },function (err, db) {
                var dbo = db.db("db");
                dbo.collection("defi").find({idDefie: clientId}).toArray(function (err, result) {
                    if (err) throw err;
                    socket.emit('defi', result);
                });
            });
        }
    }, 10000);

    socket.on('deleteDefi', function(data) {

        console.log("Delete defi", data);

        MongoClient.connect("mongodb://localhost:27017/", { useNewUrlParser: true },function (err, db) {
            var dbo = db.db("db");

            dbo.collection("defi").deleteOne({"_id": new mongodb.ObjectId(data)});
            console.log("done");

            db.close();
        });
    });

});


//Server frontend view
app.use(express.static(__dirname + '/CERIGame'));