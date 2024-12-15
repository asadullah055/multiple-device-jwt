const mode = 'dev'

let base_url = ''

if(mode === 'dev'){
    base_url = 'http://localhost:5000'
}

export { base_url }
