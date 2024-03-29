angular.module("quizzGame", ['growlNotifications'])
    .controller("quizzController", quizzControl)
    .service("session", sessionService)
    .factory("socketIO", treatSocketFactory)
    .factory("localStorage", localStorageServiceFactory)
    .service("auth", AuthService)
    .service("quizz", QuizzService)
