angular.module("quizzGame", [])
.controller("quizzController", quizzControl)
.service("session", sessionService)
.factory("socketIO", treatSocketFactory)
.factory("localStorage", localStorageServiceFactory)
.service("auth", AuthService)
.service("quizz", QuizzService)
