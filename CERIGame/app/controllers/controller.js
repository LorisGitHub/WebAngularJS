function quizzControl($scope, auth, localStorage, session, quizz, socketIO){

    $scope.logged = false;

    $scope.connexionPage = true;
    $scope.accueilPage = false;
    $scope.quizzPage = false;
    $scope.profilPage = false;
    $scope.quizzEditPage = false;
    $scope.playingPage = false;
    $scope.ScorePage = false;
    $scope.HistoriquePage = false;
    $scope.LeaderBoardPage = false;
    $scope.DefiPage = false;
    $scope.NotifPage = false;

    $scope.iduser = null;
    $scope.passwduser = null;

    $scope.iduser = "";
    $scope.passwduser = "";


    $scope.change = function(){
        if( $scope.logged == true ){
            $scope.id = "";
            $scope.nom = "";
            $scope.prenom = "";
            $scope.daten = "";
            $scope.status = "";
            $scope.humeur = "";
        }            
        $scope.logged = !$scope.logged;
    }

    $scope.toAccueilPage = function(){
        $scope.accueilPage = true;
        $scope.quizzPage = false;
        $scope.profilPage = false;
        $scope.connexionPage = false;
        $scope.quizzEditPage = false;
        $scope.playingPage = false;
        $scope.ScorePage = false;
        $scope.HistoriquePage = false;
        $scope.LeaderBoardPage = false;
    }

    $scope.toProfilPage = function(){
        $scope.accueilPage = false;
        $scope.profilPage = true;
        $scope.quizzPage = false;
        $scope.connexionPage = false;
        $scope.quizzEditPage = false;
        $scope.playingPage = false;
        $scope.ScorePage = false;
        $scope.HistoriquePage = false;
        $scope.LeaderBoardPage = false;
    }

    $scope.updateHumor = function(data){
        //console.log(data);

        humorChange = {
            'iduser' : $scope.getMyId(),
            'humor' : data,
        }

        session.setHumor(data);
        auth.setHumor(humorChange);
    }

    $scope.Login = function(){

        $scope.loginMsg = "Informations invalides !";

        if( $scope.iduser != "" || $scope.passwduser != "" ){

            auth.logIn($scope.iduser, $scope.passwduser).then(

                function(data){
                    console.log(data);
                    if( data != "" ){

                        localStorage.setItem("LastConnection", new Date() );
                        console.log($scope.nom);
                        
                        $scope.logged = true;

                        $scope.accueilPage = true;
                        $scope.connexionPage = false;

                        $scope.loginMsg = "Connexion réussie";


                    }

                }, function(error){
                    console.log("erreur d'authentification !");
                    $scope.loginMsg = "Informations incorrectes !";
                }
            );

        } 
    }

    $scope.Logout = function(){
        auth.logOut($scope.getMyId());
        $scope.loginMsg = "";
        $scope.accueilPage = false;
        $scope.quizzPage = false;
        $scope.profilPage = false;
        $scope.connexionPage = true;
        $scope.quizzEditPage = false;
        $scope.playingPage = false;
        $scope.ScorePage = false;
        $scope.HistoriquePage = false;
    }

    /* Renvoie la derniere connection*/
    $scope.lastLogging = function () {
        return new Date(localStorage.getItem("LastConnection"));
    }

    $scope.isLogged = function() {
        return auth.isLoggedIn();
    }

    $scope.getLastName = function () {
		if (session.getUser() == null) return "";
        return session.getUser().nom;
    }

    $scope.getFirstName = function () {
		if (session.getUser() == null) return "";
        return session.getUser().prenom;
    }

    $scope.getIdentifiant = function () {
		if (session.getUser() == null) return "";
        return session.getUser().identifiant;
    }

    $scope.getMyId = function(){
        if (session.getUser() == null) return 0;
        return session.getUser().id;
    }

    $scope.getBirthday = function () {
		if (session.getUser() == null) return "";
        return session.getUser().daten;
    }

    $scope.getHumor = function () {
        if (session.getUser() == null) return "";
        return session.getUser().humeur;
    }


    $scope.listQuizz = [];

    $scope.getQuizz = function(){

        quizz.allQuizz().then(
            function(quizz){
                console.log(quizz);
                $scope.inDefi = false;
                $scope.NotifDefi = null;

                $scope.listQuizz = quizz;
                $scope.accueilPage = false;
                $scope.quizzPage = true;
                $scope.profilPage = false;
                $scope.connexionPage = false;
                $scope.quizzEditPage = false;
                $scope.playingPage = false;
                $scope.ScorePage = false;
                $scope.HistoriquePage = false;
                $scope.LeaderBoardPage = false;
            }, function(error){
                console.log(error);
            }
        );

    }
    
    $scope.lastQuestion = [];
    $scope.currentQuizz;
    var size;

    $scope.openSingleQuizzPage = function(quizz){

        console.log(quizz);

        $scope.currentQuizz = quizz;
        $scope.questionNumber = [];
        $scope.singleQuizzData = quizz;
        $scope.diff = null;
        $scope.questionLeft = true;

        $scope.quizzEditPage = true;
        $scope.accueilPage = false;
        $scope.quizzPage = false;
        $scope.profilPage = false;
        $scope.connexionPage = false;
        $scope.playingPage = false;

        size = quizz.quizz.length;
        for(i=1; i<=size; i++){
            if(i%5 == 0){
                $scope.questionNumber.push(i);
            }
        }

        $scope.diff = 0;

    }

    $scope.WaitingDiff = true;
    $scope.WaitingSize = true;
    var ind = 0;
    $scope.nombreQ = 0;
    var doneQuestion = [];
    $scope.score;
    $scope.theQuestion = [];
    $scope.diff = 0;
    $scope.times = [];
    $scope.quizzStartingDate;
    $scope.ProgressBarLength = { width: 0 + '%'};

    $scope.initPlay = function(nbQuestion){

        $scope.WaitingSize = false;
        $scope.score = 0;
        $scope.nbParcouru = 0;
        $scope.nombreQ = nbQuestion;

        $scope.ProgressBarLength = { width: 0 + '%'};

        console.log(nbQuestion);
        doneQuestion = [];
        $scope.times = [];

        $scope.quizzEditPage = false;
        $scope.playingPage = true;  

        $scope.play();

    
    }

    $scope.nbParcouru;
    var date1;

    $scope.play = function(){

        date1 = Date.now();

        $scope.anecdote = false;
        $scope.WaitingResponse = true;

        var good = false;
        while(!good){
            ind = Math.floor(Math.random() * size);

            good = true;
            for(j=0; j<doneQuestion.length; j++){
                if(doneQuestion[j] == ind){
                    good = false;
                }
            }

        }

        $scope.theQuestion = $scope.singleQuizzData.quizz[ind];
        doneQuestion.push(ind);

        console.log('array length: ' + doneQuestion.length + ' taille max: ' + $scope.nombreQ);
        if(doneQuestion.length >= $scope.nombreQ){
            $scope.questionLeft = false;
        }

        $scope.propositions = [];
        for(var i in $scope.theQuestion.propositions){
            $scope.propositions.push($scope.theQuestion.propositions[i]);
        }
        console.log($scope.propositions);
    
        $scope.propositions2 = [];
        $scope.propositions2.push($scope.theQuestion.réponse);

        var i = 0;
        var j = 0;
        while( j < $scope.diff-1 ){
            if($scope.propositions[i] != $scope.propositions2[0]){
                $scope.propositions2.push($scope.propositions[i]);
                j++;
            }
            i++;
        }

        $scope.propositions2.sort(() => Math.random() - 0.5);

        console.log("props2: " +$scope.propositions2);
    }

    $scope.anecdote = false;
    $scope.WaitingResponse = true;

    $scope.CheckResponse = function(reponse){

        $scope.nbParcouru++;

        $scope.ProgressBarLength = { width: (100/$scope.nombreQ)*$scope.nbParcouru + '%'};

        var date2 = Date.now();
        var time = date2 - date1;
        time = time/1000;

        $scope.times.push(time);

        console.log("Temps: " + time );

        var tmp = time - (10*multiplicateurDiff);
        if(tmp < 0){
            tmp = 0;
        }
        var pt = ((100/$scope.nombreQ) - tmp ) * multiplicateurDiff;

        $scope.anecdote = true;
        $scope.WaitingResponse = false;

        console.log($scope.theQuestion.réponse);
        if(reponse == $scope.theQuestion.réponse){
            $scope.score += pt;
            $scope.resp = true;
        } else {
            $scope.resp = false;
        }
    }

    var multiplicateurDiff = 1;

    $scope.DiffChoice = function(diff){
        console.log(diff);
        if(diff == 'facile'){
            $scope.diff = 2;
            multiplicateurDiff = 0.5;
        } else if (diff == 'moyen'){
            $scope.diff = 3;
            multiplicateurDiff = 0.75;
        } else if(diff == 'dur'){
            $scope.diff = 4;
            multiplicateurDiff = 1;
        }
        $scope.WaitingDiff = false;
        console.log("diff: " + $scope.diff);
    }

    $scope.ScorePage = false;

    $scope.toScorePage = function(){

        $scope.chrono = 0;
        for(var i in $scope.times){
            $scope.chrono += $scope.times[i];
        }

        var histo = {
            "iduser": $scope.getMyId(),
            "nbreponse": 5,
            "temps": $scope.chrono,
            "score": $scope.score,
        };

        if($scope.inDefi === true){

            console.log($scope.NotifDefi.score);

            if($scope.score < $scope.NotifDefi.score){
                var winner = $scope.NotifDefi.idDefie;
                var looser = $scope.getMyId();
            } else {
                var looser = $scope.NotifDefi.idDefie;
                var winner = $scope.getMyId();
            }

            var defiRes = {
                "id_users_gagnant": winner,
                "id_users_perdant": looser,
            };

            quizz.postDefiResult(defiRes).then(
                function(data){
                    console.log("Defis Updated");
                    $scope.DeleteDefi();
                }, function(error){
                    console.log(error);
                }
            );

        }

        console.log(histo);

        quizz.postHistorique(histo).then(
            function(data){
                console.log("Histo Updated");
            }, function(error){
                console.log(error);
            }
        );

        $scope.playingPage = false; 
        $scope.ScorePage = true;

        $scope.WaitingDiff = true;
        $scope.WaitingSize = true;

        doneQuestion = [];

        $scope.inDefi = false;
        console.log("Bien joué");

    }
    
    $scope.Histo;

    $scope.getHistorique = function(){

        var id = $scope.getMyId();
        console.log("id:" +id);

        quizz.getHistorique(id).then(
            function(historique){

                console.log(historique);
                $scope.Histo = historique;

                $scope.accueilPage = false;
                $scope.quizzPage = false;
                $scope.profilPage = false;
                $scope.connexionPage = false;
                $scope.quizzEditPage = false;
                $scope.playingPage = false;
                $scope.ScorePage = false;
                $scope.LeaderBoardPage = false;
                $scope.HistoriquePage = true;

            }, function(error){
                console.log(error);
            }
        );

    }

    $scope.leaderBoard = [];

    $scope.getLeaderboard = function(){

        quizz.getLeaderboard().then(
            function(data){

                console.log(data);
                $scope.leaderBoard = data;

                $scope.accueilPage = false;
                $scope.quizzPage = false;
                $scope.profilPage = false;
                $scope.connexionPage = false;
                $scope.quizzEditPage = false;
                $scope.playingPage = false;
                $scope.ScorePage = false;
                $scope.HistoriquePage = false;
                $scope.LeaderBoardPage = true;
                
            }, function(error){
                console.log(error);
            }
        );

    }

    $scope.selectedUser;

    $scope.toDefiPage = function(){

        $scope.DefiPage = true;
    }

    $scope.CloseDefiPage = function(){

        $scope.DefiPage = false;
    }

    $scope.StartDefi = function(defi){

        var key = "id";
        var obj = JSON.parse(defi);

        console.log("defiant: " + $scope.getMyId());
        console.log("defié: " + obj[key]);
        console.log("Score: " + $scope.score);
        console.log("Current quizz: ");
        console.log($scope.currentQuizz);

        var defi = {
            "idDefie": $scope.getMyId(),
            "idDefiant": obj[key],
            "identifiantDefiant": obj["identifiant"],
            "score": $scope.score,
            "quizz": $scope.currentQuizz,
        };

        quizz.postDefi(defi);

    }

    $scope.NotifDefi;

    $scope.toNotifWindow = function(defi){
        console.log(defi);
        $scope.NotifDefi = defi;
        $scope.NotifPage = true;
    }

    socketIO.on("getId", function(){
        if($scope.getMyId() !== null){
            socketIO.emit('getId', $scope.getMyId());
        }
    });

    // Met à jour la liste des défis reçu
    $scope.defis
    socketIO.on("defi", function(data){
        console.log("defis");
        console.log(data);
        $scope.defis = data;
        $scope.$apply();
    });

    // Met à jour la liste des utilisateurs connectés
    $scope.users;
    socketIO.on("users", function(data){
        $scope.users = data;
        $scope.$apply();
    });

    $scope.update = function(){
        $scope.$apply();
    }

    // Supprime un défi et cache le bandeau de défi
    $scope.DeleteDefi = function(){
        $scope.NotifPage = false;
        socketIO.emit("deleteDefi", $scope.NotifDefi._id);
    }

    $scope.inDefi = false;
    $scope.toDefiQuizz = function(quizz){
        $scope.inDefi = true;
        $scope.NotifPage = false;
        $scope.openSingleQuizzPage(quizz);
    }

}