// service permettant la gestion de variable de session locales contenant les informations de derniere connexion de l'utilisateur
// issu de https://www.jvandemo.com/learn-how-to-make-authentication-in-your-angular-applications-simpler-and-more-consistent/  

function sessionService($log, localStorage, $http) {

    // Instantiate data when service isloaded
    this._user = JSON.parse(localStorage.getItem('session.user'));
    
    this.getUser = function () {
        return this._user;
    };
    
    this.setUser = function (user) {
        this._user = user;
        localStorage.setItem('session.user', JSON.stringify(user));
        return this;
    };

    this.setHumor = function(humor){
        this._user['humeur'] = humor;
        localStorage.setItem('session.user', JSON.stringify(this._user));
    }
    
    this.destroy = function destroy() {
        this.setUser(null);
    };
    
    /*this.updateUser = function(){
        var mySession = this;
        $http.get('http://pedago01c.univ-avignon.fr:3019/updateUser?id='+this.getUser().id)
            .then(function (response,err) {
                mySession._user = response.data;
                localStorage.setItem('session.user', JSON.stringify(response.data));
            });
    }

    this.updateStatut = function (newStatut) {
        var mySession = this;
        return $http.post('http://pedago01c.univ-avignon.fr:3019/updateStatut', { 'id': this._user.id, 'statut': newStatut })
            .then(function (response, err) {
                $http.get('http://pedago01c.univ-avignon.fr:3019/updateUser?id=' + mySession.getUser().id)
                    .then(function (response, err) {
                        
                        mySession._user = response.data;
                        localStorage.setItem('session.user', JSON.stringify(response.data));
                    });
            });
    }*/
}

function localStorageServiceFactory($window){
    if($window.localStorage){
      return $window.localStorage;
    }
    throw new Error('Local storage support is needed');
}

function AuthService($http,session){ 
	/** 
	*  Vérifie si l'utilisateur est connecté
	* @returnsboolean 
	*/ 
	this.isLoggedIn = function isLoggedIn(){ 
		return session.getUser() !== null; 
    }
    
    /** 
    * service appelé lors d'une tentative de connexion 
    * @ param credentials
    * returns |Promise} 
    */
    this.logIn = function (iduser, passwduser) {
        return $http
            .post('/login', { 'iduser':iduser, 'pass': passwduser })
            .then(function (response,err) {
                if (response.data != ""){
                    session.setUser(response.data);
                }
                return (response.data);
            });
    };


    this.getUsers = function(){
        return $http.post('/users').then(function(rep, err){
            return rep.data;
        });
    }

    this.setHumor = function(humor){
        return $http.post('/changeHumor', humor).then(function(rep, err){
            console.log("Humor changed!");
        });
    }

    /** 
   * service de déconnexion
   * @   returns {*|Promise} 
   */
    this.logOut = function (id) {
        /*return $http.get('http://pedago02a.univ-avignon.fr:3004/logout')
            .then(function (response) {
                // Destroy session in the browser 
                session.destroy();
                return (response.data);
            });*/

            return $http.post('logout', { 'id': id} ).then(function(rep, err){
                console.log("Deconnxion réussie");
                session.destroy();
            });

    }; 
    
}

function treatSocketFactory($rootScope) {
    var socket = io.connect('http://pedago01c.univ-avignon.fr:3019/');
    return {
        on: function(eventName, callback){
            socket.on(eventName, callback);
        },
        emit: function(eventName, data) {
            console.log("data from service: " + eventName + ' / ' + data);
            socket.emit(eventName, data);
        }
    };
}

function QuizzService($http){

    this.allQuizz = function(){
        return $http.get("/quizz").then(function(rep, err){
            quizz = [];
            for(var i in rep.data){
                singleQuizz = {};
                singleQuizz.theme = rep.data[i].thème;
                singleQuizz.redacteur = rep.data[i].rédacteur;
                singleQuizz.quizz = [];
                for(var j in rep.data[i].quizz){
                    singleQuestion = {};
                    singleQuestion.id = rep.data[i].quizz[j].id;
                    singleQuestion.question = rep.data[i].quizz[j].question;
                    singleQuestion.réponse = rep.data[i].quizz[j].réponse;
                    singleQuestion.anecdote = rep.data[i].quizz[j].anecdote;
                    singleQuestion.propositions = [];
                    var tab = rep.data[i].quizz[j].propositions;
                    singleQuestion.propositions.push(tab.splice(tab.indexOf(singleQuestion.réponse),1)[0]);
                    for (var nb=0; nb<5;nb++){
                        singleQuestion.propositions.push(tab.splice(tab.indexOf(Math.floor(Math.random() * Math.floor(tab.length))),1)[0]);
                    }
                    singleQuestion.propositions.sort(function(a, b){return 0.5-Math.random()});
                    singleQuizz.quizz.push(singleQuestion);
                }
                quizz.push(singleQuizz);
            }
            //console.log(quizz);
            return quizz;
        });
    }

    this.getHistorique = function(iduser){
        return $http.get("/historique?id="+iduser).then(function(rep, err){
            //console.log(rep.data);
            return rep.data;
        });
    }

    this.getLeaderboard = function(){
        return $http.post("/leaderboard").then(function(rep, err){
            //console.log(rep.data);
            return rep.data;
        });
    }

    this.postHistorique = function(HistoInfo){
        console.log(HistoInfo['iduser']);
        console.log(HistoInfo['nbreponse']);
        return $http.post("/uploadScore", HistoInfo).then(function(rep, err){
            return rep.data;
        });
    }

    this.postDefi = function(data){
        $http.post("/Defi", data);
    }

    this.delDefi = function(data){
        $http.post("/RemoveDefi", data);
    }

    this.postDefiResult = function(data){
        return $http.post("/DefiResult", data).then(function (rep, err) {
            return rep.data;
        });
    }

    

}


treatSocketFactory.$inject = ['$rootScope'];
QuizzService.$inject = ['$http'];
localStorageServiceFactory.$inject = ['$window'];
AuthService.$inject = ['$http', 'session'];
sessionService.$inject = ['$log', 'localStorage','$http'];
