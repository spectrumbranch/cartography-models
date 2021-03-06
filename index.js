module.exports.init = function(dbconfig, virt_modules, done) {
	//console.log("lib/models/index::init()");
	
	var Sequelize = require('sequelize');
	
	var dbname = dbconfig.db;
	var dbhostname = dbconfig.hostname;
	var dbport = dbconfig.port;
	var dbuser = dbconfig.user;
	var dbpassword = dbconfig.password;

	var sequelize = new Sequelize(dbname, dbuser, dbpassword, {
		host: dbhostname,
		port: dbport
	});

	//list all cartography models that will be loaded
	var models = [
		{
			name: "Map",
			file: "map"
		},
		{
			name: "Tile2D",
			file: "tile2d"
		},
		{
			name: "UserAttributes",
			file: "user_attributes"
		}
	];

	//load models dynamically
	models.forEach(function(model) {
		module.exports[model.name] = sequelize.import(__dirname + '/' + model.file); 
	});
	
	//export the connection
	module.exports.sequelize = sequelize;
	
	virt_modules.scurvy.loadModels(module.exports);
    (function(model) {
        //define all associations
		
		//scurvy associations
		var scurvy = virt_modules.scurvy;
		scurvy.setupAssociations(model);
		
		//cartography specific associations
		model.User.hasMany(model.Map);
		model.Map.belongsTo(model.User);
		model.Map.hasMany(model.Tile2D);
		model.Tile2D.belongsTo(model.Map);
		model.User.hasOne(model.UserAttributes);
		model.UserAttributes.belongsTo(model.User);
        
        //ensure tables are created with the fields and associations
		
		//scurvy tables
		scurvy.setupSync(model, function(err) {
			if (err) { console.log('Error when trying to sync scurvy tables.'); }
			
			//cartography specific tables
			model.Map.sync().success(function() {
				model.Tile2D.sync().success(function() {
					model.UserAttributes.sync().success(function() {
						//callback
						done();
					}).error(function(error) { console.log("Error during UserAttributes.sync(): " + error); });
				}).error(function(error) { console.log("Error during Tile2D.sync(): " + error); });
			}).error(function(error) { console.log("Error during Map.sync(): " + error); });
		});
    })(module.exports);
};
