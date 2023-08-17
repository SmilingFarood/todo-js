const express = require('express')
const axios = require('axios')
const fs = require('fs')
const app = express()
const port = 3000

//import chalk from 'chalk';
const chalk = require('chalk')
const { error } = require('console')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', async (request, response) => {

    return response.send('Hello World!')
})

app.get('/todos', (request, response) => {
    const showPending = request.query.showPending

    fs.readFile('./store/todos.json', 'utf-8', (err, data) => {
        if (err) {
            return response.status(500).send('Sorry!, something went wrong')
        }
        const todos = JSON.parse(data)

        if (showPending !== "1") {
            return response.json({ todos: todos })
        } else {
            return response.json({
                todos: todos.filter(t => {
                    return t.complete === false
                })
            })
        }

        // return response.json({ todos: todos })
    })
})

app.put('/todos/:id/complete', (request, response) => {
    const id = request.params.id

    const findTodoById = (todos, id) => {
        for (let i = 0; i < todos.length; i++) {
            if (todos[i].id === parseInt(id)) {
                return i
            }
        }
        return -1
    }


    fs.readFile('./store/todos.json', 'utf-8', (err, data) => {
        if (err) {
            return response.status(500).send('Sorry!, something went wrong')
        }
        let todos = JSON.parse(data)
        const toDoIndex = findTodoById(todos, id)

        if (toDoIndex === -1) {
            return response.status(404).send('Sorry, not found.')
        }
        todos[toDoIndex].complete = true

        fs.writeFile('./store/todos.json', JSON.stringify(todos), () => {
            fs.readFile('./store/todos.json', 'utf-8', (err, data) => {
                if (err) {
                    return response.status(500).send('Sorry!, something went wrong')
                }
                const todos = JSON.parse(data)
                return response.json({ todos: todos })
            })
            // return response.json({ 'status': 'ok' })
        })
    })
})

app.post('/todo', (request, response) => {
    if (!request.body.name) {
        return response.status(404).send('Missing name parameter')
    }
    fs.readFile('./store/todos.json', 'utf-8', (err, data) => {
        if (err) {
            return response.status(500).send('Internal server error')
        }
        const todos = JSON.parse(data)
        let maxId = Math.max.apply(Math, todos.map(t => { return t.id }))

        todos.push({
            id: maxId += 1,
            name: request.body.name,
            complete: false
        })
        fs.writeFile('./store/todos.json', JSON.stringify(todos), (err, _) => {
            if (err) {
                return response.status(500).send('Something went wrong')
            }
            return response.json({
                todos: todos
            })
        })
    })
    const todo = request.body
})

app.post('/file/create', (request, response) => {
    const name = request.body.name
    const quantity = request.body.quantity
    const price = request.body.price

    const csvData = '\n' + name + ',' + quantity + ',' + price
    if (!name || !quantity || !price) {
        return response.status(422).send('Missing parameters')
    }


    fs.writeFile('groceries.csv', csvData, { flag: 'a' }, (err, _) => {
        if (err) {
            console.log(chalk.red(err.message))
            return response.status(500).send('An error occured')
        }
        fs.readFile('groceries.csv', 'utf-8', (err, data) => {
            if (err) {
                return response.status(500).send('An error occured')
            }
            console.log(chalk.yellow(data))
            // const jsData = JSON.parse(data)
            return response.json({
                data: data
            })
        })
    })

})

// Axios
app.get('/request', async (resuest, response) => {

    await axios({
        method: 'get',
        url: 'https://jsonplaceholder.typicode.com/todos',
        params: {
            _limit: 5
        }
    }).then((respo) => {

        return response.json({ data: respo.data })

    }).catch(
        (err) => {
            console.log(`This is error ${err}`)
            return response.status(500).send(err)
        }
    )



})
// Axios
app.patch('/request/:id', (request, response) => {
    const id = request.params.id
    //const title = request.body.title
    //const complete = request.body.complete

    const { title, complete } = request.body;

    if (!title) {

        return response.status(400).send('Input title')
    }

    console.log("title", title);
    axios({
        method: 'patch',
        url: `https://jsonplaceholder.typicode.com/todos/${id}`,
        data: {
            title: title,
            complete: complete
        }
    }).then(respo => {
        // console.log(`This is the post response ${JSON.stringify(respo)}`)
        return response.json({ data: respo.data })

    }).catch(err => {
        console.log(`This is an error ${err}`)
        return response.status(500).send('Internal server error')
    })
})





app.listen(port, () => {

    console.log(chalk.green(`Application running on http://localhost:${port}`))

})

