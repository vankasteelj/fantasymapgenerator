// this is a world map generator

// basic model
const size = 256

/** 
 * une carte doit avoir 2 niveaux: 
 *  - surface
 *  - souterrains
 * 
 * En surface, il y a des règles à prendre en compte: 
 *  - la mer: encadre la zone de terre
 *  - les terres: génère un grand continent et quelques iles
 * 
 * Sur les terres, il y a des biomes:
 *  - desert
 *  - ville
 *  - montagne
 *  - forêt
 *  - fleuves
 *  - plaines
 * 
 * les souterrains sont générés après la surface: 
 *  - points d'entrée: des montagnes
 *  - taille: uniquement dans des blocs "terre"
 * les souterrains peuvent relier une plage à une île si proches (distance: combien de blocs?) et si montagnes près de la mer
 * les souterrains peuvent aussi relier 2 villes si proches (distance: combien de blocs?)
*/


// générer une grille carrée
const gridSize = size*size
let grid = []

let x = 1
let y = 1

for (let i = 0; i < gridSize; i++) {
  let baseObj = {
    x: x,
    y: y
  }
  grid.push(baseObj)

  if (x < size) {
    x++
  } else {
    x = 1
    y++
  }
}

const iterate = (fn) => {
  let x = 1
  let y = 1
  for (let i = 0; i < gridSize; i++) {
    grid[i].type = fn(x,y,i)
  
    if (x < size) {
      x++
    } else {
      x = 1
      y++
    }
  }
}

// determine base land
const determineBaseLand = (x,y,i) => {
  if (x-1 === 0 || y-1 === 0) {
    return 'water'
  }

  let rand = Math.floor(Math.random() * 10001)
  if (rand < 7) {
    return 'land'
  } else {
    return 'water'
  }
}

iterate(determineBaseLand)

// draw base land
const drawBaseLand = (x,y,i) => {
  try {
    if (x-1 === 0 || y-1 === 0) {
      return 'water'
    }

    let topN = i-size
    let bottomN = i+size
    let top = grid[topN].type
    let topleft = grid[topN-1].type
    let topright = grid[topN+1].type
    let left = grid[i-1].type
    let right = grid[i+1].type
    let bottom = grid[bottomN].type
    let bottomright = grid[bottomN+1].type
    let bottomleft = grid[bottomN-1].type

    let arr = [top, topleft, topright, left, right, bottom, bottomright, bottomleft]
    if (arr.indexOf('land') > -1) {
      let rand = Math.floor(Math.random() * 1001)
      if (rand < 493) {
        return 'land'
      } else {
        return 'water'
      }
    } else {
      return 'water'
    }
  } catch(e) {
    return 'water'
  }
}

iterate(drawBaseLand)

// fill the gaps
const fillGaps = (x,y,i) => {
  try {
    if (x-1 === 0 || y-1 === 0) {
      return 'water'
    }

    let topN = i-size
    let bottomN = i+size
    let top = grid[topN].type
    let topleft = grid[topN-1].type
    let topright = grid[topN+1].type
    let left = grid[i-1].type
    let right = grid[i+1].type
    let bottom = grid[bottomN].type
    let bottomright = grid[bottomN+1].type
    let bottomleft = grid[bottomN-1].type

    let arr = [top, topleft, topright, left, right, bottom, bottomright, bottomleft]
    if (arr.filter(n => n==='land').length > 2) {
      let rand = Math.floor(Math.random() * 1001)
      if (rand < 996) {
        return 'land'
      } else {
        return 'water'
      }
    } else {
      return 'water'
    }
  } catch(e) {
    let topN = i-size
    let top = grid[topN].type
    return top
  }
}

iterate(fillGaps)

// draw lakes
const drawLakes = (x,y,i) => {
  if (grid[i].type === 'water') {
    try {
      let topN = i-size
      let bottomN = i+size
      let top = grid[topN].type
      let topleft = grid[topN-1].type
      let topright = grid[topN+1].type
      let left = grid[i-1].type
      let right = grid[i+1].type
      let bottom = grid[bottomN].type
      let bottomright = grid[bottomN+1].type
      let bottomleft = grid[bottomN-1].type

      let arr = [top, topleft, topright, left, right, bottom, bottomright, bottomleft]
      if (arr.indexOf('water') === -1) {
        // we are on a single spot of water, 85% to change it into a lake
        console.log('found lake')
        if (Math.floor(Math.random() * 101) < 6) {
          grid[topN].type = (Math.floor(Math.random() * 101) < 71) && 'water' || 'land'
          grid[topN-1].type = (Math.floor(Math.random() * 101) < 61) && 'water' || 'land'
          grid[topN+1].type = (Math.floor(Math.random() * 101) < 71) && 'water' || 'land'
          grid[i-1].type = (Math.floor(Math.random() * 101) < 61) && 'water' || 'land'
          grid[i+1].type = (Math.floor(Math.random() * 101) < 71) && 'water' || 'land'
          grid[bottomN].type = (Math.floor(Math.random() * 101) < 61) && 'water' || 'land'
          grid[bottomN+1].type = (Math.floor(Math.random() * 101) < 71) && 'water' || 'land'
          grid[bottomN-1].type = (Math.floor(Math.random() * 101) < 61) && 'water' || 'land'
          return 'water'
        } else { 
          return 'land'
        }
      } else {
        return grid[i].type
      }
    } catch(e) {
      return grid[i].type
    }
  } else {
    return grid[i].type
  }
}

iterate(drawLakes)

// draw the grid
console.log(grid)

let html = ''
let line = 0
for (let i = 0; i < gridSize; i++) {
  let current = grid[i]

  if (line === current.y) {
    html += `<td title="${current.x+';'+current.y}" class="${current.type}"></td>`
  } else {
    html += `</tr><tr>`
    html += `<td title="${current.x+';'+current.y}" class="${current.type}"></td>`
    line++
  }

}

// import grid in html
document.getElementById('map').innerHTML = html