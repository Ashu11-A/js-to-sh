const exemplo = [1, 3]

for (const num of exemplo) {
  console.log(num)
  switch(num) {
  case 1: { console.log('teste'); break }
  case 3: { console.error(num); break }
  }
}