if (await isDir('src')) {
  console.log('é um diretório')
} else {
  console.log('não é um diretório')
}

const data = await fetch('https://api.github.com/repos/github/gitignore', {
  method: 'GET',
})

console.log(data.status)