var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var handlebars = require("express-handlebars").create({defaultLayout: "main"});
var mysql = require("mysql");

var pool = mysql.createPool({
    host: "localhost",
    port: "8088",
    user: "student",
    password: "default",
    database: "student"
});

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");
app.set("port", 5613);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static("public"));

/*pool.query("CREATE TABLE workouts", function(err){
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    pool.query(createString, function(err){
    })
});
*/
app.get('/reset-table',function(req,results,next){
    var context = {};
    pool.query("DROP TABLE IF EXISTS workouts", function(err){
        var createString = "CREATE TABLE workouts("+
        "id INT PRIMARY KEY AUTO_INCREMENT,"+
        "name VARCHAR(255) NOT NULL,"+
        "reps INT,"+
        "weight INT,"+
        "date DATE,"+
        "lbs BOOLEAN)";
        pool.query(createString, function(err){
            results.render('table',context);
        })
    });
});
//selects all from workouts DB ,cycles through every row and puts it into an array to be shipped off to JSON PARSE for realtime formatting
app.get('/', function(req, results, next){
    var context = {};
    pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
        next(err);
        return;
    }
    var params = [];
    for(var row in rows){
        var placeH = {'name': rows[row].name,'reps': rows[row].reps,'weight': rows[row].weight,  'date':rows[row].date,'id':rows[row].id};
        if(rows[row].lbs){      //evaluates entry as bool  to decide whether or not to be kg or lbs
            placeH.lbs = "lbs";
        }
        else{
            placeH.lbs = "kg";
        }
        params.push(placeH);
    }
    context.results = params;
    results.render('table', context);
    })
});


//basic DB insertion with re.query as source
app.get('/insert',function(req,results,next){
  var context = {};
   pool.query("INSERT INTO `workouts` (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)",
    [req.query.exercise,
    req.query.reps,
    req.query.weight,
    req.query.date,
    req.query.lbsOr],
    function(err, results){
        if(err){
          next(err);
          return;
        }
        context.inserted = results.insertId;
        results.send(JSON.stringify(context));
  });
});
//delete entry at the passed ID param
app.get('/delete', function(req, results, next) {
    var context = {};
    pool.query("DELETE FROM `workouts` WHERE id = ?",
        [req.query.id],
        function(err, results) {
            if(err){
                next(err);
                return;
            }
    });
});
//selects a desired entry and ships it off to the editor page to make changes
app.get('/entryEdit',function(req, results, next){
    var context = {};
    pool.query('SELECT * FROM `workouts` WHERE id=?',[req.query.id],
    function(err, rows, fields){
            if(err){
                next(err);
                return;
            }
            var holder = [];

            for(var row in rows){
                var placeH = {'name': rows[row].name,'reps': rows[row].reps,'weight': rows[row].weight,'date':rows[row].date,'lbs':rows[row].lbs,'id':rows[row].id};
                holder.push(placeH);
            }
        context.results = holder[0];
        results.render('entryEdit', context);
    });
});
//function that queries a selection, performs checks on the result, and then updates the ones that have been changed
//and keeps results that haven't been.
app.get('/editor', function(req, results, next){
    var context = {};

    pool.query("SELECT * FROM `workouts` WHERE id=?",  [req.query.id],
    function(err, results){
            if(err){
                next(err);
                return;
            }
            if(results.length == 1){
                var current = results[0]; //saves values for update comparison

                if(req.query.lbsOr === "on"){
                    req.query.lbsOr = "1";
                }
                else{
                    req.query.lbsOr = "0";
                }
                pool.query('UPDATE `workouts` SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?',
                [req.query.exercise || current.name,req.query.reps || current.reps,req.query.weight || current.weight, req.query.date || current.date,  req.query.lbsOr,  req.query.id],
                function(err, results){
                    if(err){
                        next(err);
                        return;
                    }
                    //from here on out the function is basically a copy paste from the GET"/" main page
                    //loading up the new updated table to be filled out on table view
                      pool.query('SELECT * FROM `workouts`', function(err, rows, fields){
                        if(err){
                            next(err);
                            return;
                        }
                        var holder = [];

                        for(var row in rows){
                            var placeH = {'name': rows[row].name,'reps': rows[row].reps,'weight': rows[row].weight,'date':rows[row].date,'id':rows[row].id};

                            if(rows[row].lbs){              //decide between lbs and kg again
                                placeH.lbs = "lbs";
                            }
                            else{
                                placeH.lbs = "kg";
                            }
                            holder.push(placeH);
                        }
                        context.results = holder;
                        results.render('table', context);       //Display everything
                    });
                });
            }
    });
});

app.use(function(req, results){
	results.status(404);
	results.render("404");
});

app.use(function(err, req, results, next){
	console.log(err.stack);
	results.status(500);
	results.render("500");
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://flip3.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});
