function testWhereAction() {
    var lambda = require('../src/lambda.dev.js');
    if (!lambda) throw "lambda is undefined";
    var arr = [{
        FirstName: "Aron",
        LastName: "R",
        Age: 24,
        Gender: "Male"
    }, {
        FirstName: "Arun",
        LastName: "G",
        Age: 25,
        Gender: "Male"
    }, {
        FirstName: "Jessie",
        LastName: "K",
        Age: 24,
        Gender: "Female"
    }];

    return lambda.where(arr, { FirstName: "Arun" });
}

console.log(testWhereAction());