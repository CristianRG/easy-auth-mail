import { customHTML } from "../index.js";
import path from 'path'
const matches = [
    {
        match: {id: 'token', value: 'Hello World'}
    },
    {
        match: {id: 'user', value: 'Cristian'}
    }
]
const html = await customHTML({path: path.join(process.cwd(), 'src', 'test', 'index.html'), matches})
console.log(html)