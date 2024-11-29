const express = require('express')
const app = express()
require('dotenv').config()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const { default: mongoose } = require('mongoose')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))



morgan.token('body', (request) => JSON.stringify(request.body))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformated id' })
  } else if (
    error.name === 'ValidationError' ||
        error.number === 'ValidationError'
  ) {
    return response.status(400).json({
      error: error.message
    })
  }
  next(error)
}


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  }).catch(error => {
    // eslint-disable-next-line no-undef
    next(error)
  })
}
)


app.get('/info', (request, response) => {
  try {
    response.send(`<p>Phonebook has info for ${Person.length} people<br><br/>${new Date()}</p>`)
  } catch(error) {
    // eslint-disable-next-line no-undef
    next(error)
  }
})


app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => {
      // eslint-disable-next-line no-undef
      next(error)
    })
})


app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then(person => {
      console.log(`Person ${person.name} deleted from database`)
      response.status(204).end})
    // eslint-disable-next-line no-undef
    .catch(error => next(error))
})


const generateId = () => {
  return String(Math.floor((Math.random()*(10000 - 1) + 5)))
}


app.post('/api/persons/', (request, response) => {
  const body = request.body

  const person = new Person ({
    id: String(generateId()),
    name: body.name,
    number: String(body.number)
  })


  if (body === undefined) {
    return response.status(400).json({
      error: 'Undefined body value'
    })
  }

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  Person.findOne({ name: person.name }).then(existingPerson => {
    if (existingPerson) {
      return response.status(409).json({
        error: 'name must be unique' }).end()
    } else {
      person.save()
        .then((savedPerson) => {
          console.log(`${savedPerson.name} saved to database`)
          response.json(person)
        }).catch((error) => {
          console.log(error.message)
          response.status(500).json({
            error: error.message
          })
        })
    }
  }).catch(error => {
    console.log(error.message)
    response.status(500).json({
      error: 'Failed to check for duplicates'
    })
  // eslint-disable-next-line no-undef
  }).catch(error => next(error))
})



app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: String(body.number)
  }

  if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
    return response.status(400).json({ error: 'Invalid ID format' })
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
