module.exports = {
  apps : [{
    name   : "syncpersons",
    script : "./synctables/persons.js"
  },{
    name   : "synctransactions",
    script : "./synctables/transactions.js"
  },{
    name   : "syncreaders",
    script : "./synctables/readers.js"
  },{
    name   : "enroll",
    script : "./enroll/enroll.js"
  }]
}
