// this is a world map generator

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

// basic model size
const size = 512
const landSeed = [30, 100000]
const landRate = [49000, 100000]
const landFill = [99800, 100000]
const landColor = [70000, 100000]
const lakeSeed = [2500, 100000]

// square map
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

// use a meta object for biomes
let biomes = {}

// add functions for meta biome object
const addLake = (x,y,i) => {
  biomes.lakes.push({
    x: x,
    y: y,
    i: i
  })
}

const isLake = (x,y,i) => {
  let found = false
  let rate = 4
  for (o in biomes.lakes) {
    let c = biomes.lakes[o]
    if ((c.x - rate <= x && c.x + rate >= x) && (c.y - rate <= y && c.y + rate >= y)) {
      found = true
      break
    }
  }
  return found
}

// used to modify the grid one by one 
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
/////////////////////
/// MAP GENERATOR ///
/////////////////////

// determine base land: some land dots on an ocean
const determineBaseLand = (x,y,i) => {
  if (x-1 === 0 || y-1 === 0) {
    return 'water'
  }

  let rand = Math.floor(Math.random() * (landSeed[1]+1))
  if (rand < landSeed[0]) {
    return 'land'
  } else {
    return 'water'
  }
}

// draw base land: expand the land dots
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
      let rand = Math.floor(Math.random() * (landRate[1]+1))
      if (rand < landRate[0]) {
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

// fill the gaps: landscaping
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
    let terrain = arr.filter(n => n==='land').length
    let terrainAlt = arr.filter(n => n==='alternate_land').length
    if (terrain+terrainAlt > 2) {
      let rand = Math.floor(Math.random() * (landFill[1]+1))
      if (rand < landFill[0]) {
        if (Math.floor(Math.random() * (landColor[1]+1)) < landColor[0]) {
          return 'land'
        } else {
          return 'alternate_land'
        }
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

// draw lakes: remaining water dots should be lakes or removed
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
        if (Math.floor(Math.random() * (lakeSeed[1]+1)) < lakeSeed[0]) {
          addLake(x,y,i)
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

// coast lines: draw them
const coastLines = (x,y,i) => {
  if (grid[i].type === 'land' || grid[i].type === 'alternate_land') {
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
      let waterblocks = arr.filter(n => n==='water').length
      if (waterblocks >= 1 && waterblocks < 8) {
        if (isLake(x,y,i)) {
          return 'coastLake'
        } else {
          return 'coastSea'
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

// draw the actual map from the grid
const drawGrid = () => {
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

  // loader hide
  document.getElementById('loader').style.display = 'none'
  document.getElementById('map').style.display = 'block'
}

// show loader
const loader = () => {
  document.getElementById('map').style.display = 'none'
  document.getElementById('loader').style.display = 'block'
}

const reset = () => {
  biomes = false
  biomes = {
    lakes: []
  }
}

// actual generation
const generate = () => {
  loader()
  reset()
  iterate(determineBaseLand)
  iterate(drawBaseLand)
  iterate(fillGaps)
  iterate(drawLakes)
  iterate(coastLines)
  setTimeout(() => {
    drawGrid()
  }, 0)
}

// auto-generate on page load
generate()