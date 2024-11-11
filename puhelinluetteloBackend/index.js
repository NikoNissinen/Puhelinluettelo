const express = require("express")
const app = express()
require("dotenv").config()
const morgan = require('morgan')
const cors = require('cors')
const Person = require("./models/person")
const { default: mongoose } = require("mongoose")
const person = require("./models/person")

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))



let personsList = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
]


morgan.token("body", (request) => JSON.stringify(request.body))

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformated id"})
    } else if (
        error.name === "ValidationError" || 
        error.number === "ValidationError" 
        ) {
            return response.status(400).json({
                error: error.message
        })
    }
    next(error)
}


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get("/api/persons", (request, response) => {
    try {
        Person.find({}).then(people => {
            response.json(people)
        })
    } catch(error) {
        next(error)
    }
})


app.get("/info", (request, response) => {
    try {
        response.send(`<p>Phonebook has info for ${personsList.length} people<br><br/>${new Date()}</p>`)       
    } catch(error) {
        next(error)
    }   
})


app.get("/api/persons/:id", (request, response) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
        })
        .catch(error => {
            next(error)
        })
})


app.delete("/api/persons/:id", (request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(person => { 
            response.status(204).end})
        .catch(error => next(error))
})


const generateId = () => {
    return String(Math.floor((Math.random()*(10000 - 1) + 5)))
}


app.post("/api/persons/", (request, response) => {  
    const body = request.body

    const person = new Person ({
        id: String(generateId()),        
        name: body.name,
        number: String(body.number)
    })
        
   
    if (body === undefined) {
        return response.status(400).json({
            error: "Undefined body value"
        })
    }
    
    if (!body.name) {
        return response.status(400).json({
            error: "name missing"
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: "number missing"
        })
    }
    
    Person.findOne({ name: person.name }).then(existingPerson => {
        if (existingPerson) {
            return response.status(409).json({
                error: "name must be unique" }).end()
        } else {
            person.save()
            .then((savedPerson) => {
                console.log(`${savedPerson.name} saved to database`)
                response.json(person)
            }).catch((error) => {
                console.log(error.message)
                response.status(500).json({
                    error: "failed to save person to database"
                })
            })            
        }
    }).catch(error => {
        console.log(error.message)
        response.status(500).json({
            error: "Failed to check for duplicates"
        })
    }).catch(error => next(error))  
}) 



app.put("/api/persons/:id", (request, response, next) => {
    const body = request.body
    const person = {
        id: String(generateId()),
        name: body.name,
        number: String(body.number)
    }
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})


app.use(errorHandler)
app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT), () => {
    console.log(`Server running on port ${PORT}`)
}
