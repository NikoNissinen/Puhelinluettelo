const express = require("express")
const app = express()
const morgan = require('morgan')
const cors = require('cors')
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
        response.json(personsList)
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
    try {
        const id = request.params.id
        const person = personsList.find(person => person.id === id)
    
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    } catch(error) {
        next(error)
    }
})


app.delete("/api/persons/:id", (request, response) => {
    try {
        const id = request.params.id
        personsList = personsList.filter(person => person.id !== id)
     
        response.status(204).end()
    } catch(error) {
        next(error)
    }
})


const generateId = () => {
    return String(Math.floor((Math.random()*(10000 - 1) + 5)))
}


app.post("/api/persons/", (request, response) => {
    try {    
    const body = request.body

    const person = ({
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

    let duplicateCount = false

    personsList
        .forEach((p) => {
            if (p.name === person.name) {
                duplicateCount = true
            }
        })

        if (duplicateCount === false) {
            personsList = personsList.concat(person)
            response.json(person)            
        } else {
            return response.status(409).json({
                error: "name must be unique" }).end()
        }
    } 
    catch(error) {
        next(error)
    }       
})


app.use(errorHandler)
app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT), () => {
    console.log(`Server running on port ${PORT}`)
}
