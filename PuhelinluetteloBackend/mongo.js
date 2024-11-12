const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}


if (process.argv.length < 5) {
  console.log('give necessary name and number to add in database')
  process.exit(1)
}


const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]
const id = process.argv[5]

const url =
  `mongodb+srv://nikon:${password}@puhelinluettelo.lcs3y.mongodb.net/people?retryWrites=true&w=majority&appName=Puhelinluettelo`

mongoose.set('strictQuery', false)
mongoose.connect(url)


const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: String,
})


const Person = mongoose.model('Person', personSchema)


const person = new Person({
  name: name,
  number: number,
  id: id,
})


person.save().then(result => {
  console.log(`added ${name} number ${number} to puhelinluettelo`)
  mongoose.connection.close()
})


//testing Find- function for MongoDB (working one)
// if (process.argv.length === 3) {
//   Person.find({}).then(result => {
//    result.forEach(person => {
//      console.log(person)
//    })
//    mongoose.connection.close()
//  })
//}





