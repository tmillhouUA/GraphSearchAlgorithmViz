///////////
//Settings
///////////

let width = 1500
let height = 840
let nNodes = 52
let graphBorder = 100
let nodeR = 15
let arrowL = 10
let minNodeDist = 100
let allowedFails = 100
let branchFactor = 2

let alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

let speeds = [1,3,5,15,30]
let speed = 2
let fps = speeds[speed]
let stepByStep = false
let currentAlg = -1
let controlColor = "rgb(150,150,150)"

/////////////////
//Math Functions
/////////////////

function arrayOfZeros(rows, columns,val = 0){
    let zArray = []
    for(let i = 0; i<rows;i++){
        zArray[i] = []
        for(let j = 0; j<columns;j++){
            zArray[i][j] = val
        }
    }  
    return zArray  
}

function drawDirectedEdge(root,tip,directed = true){

    dirVec = normalizeVec([tip[0]-root[0],tip[1]-root[1]])
    
    root = [root[0]+dirVec[0]*nodeR,root[1]+dirVec[1]*nodeR]
    tip = [tip[0]-dirVec[0]*nodeR,tip[1]-dirVec[1]*nodeR]
    legOne =  rotateVec(dirVec,30)
    legTwo = rotateVec(dirVec,-30)
    
    let d=""
      
    if(directed){
        d +=`M ${tip[0]} ${tip[1]} L ${tip[0]-legOne[0]*arrowL} ${tip[1]-legOne[1]*arrowL} L ${tip[0]-legTwo[0]*arrowL} ${tip[1]-legTwo[1]*arrowL} L ${tip[0]} ${tip[1]} 
    M ${tip[0]-dirVec[0]*(arrowL**2/2)**.5} ${tip[1]-dirVec[1]*(arrowL**2/2)**.5} L ${root[0]} ${root[1]}`
    }else{
        d += `M ${tip[0]} ${tip[1]} L ${root[0]} ${root[1]}`
    }

    let path = svg.append("path").attr("d",d)
    .attr("stroke", "rgb(50,50,50)").attr("fill","rgb(50,50,50)").attr("stroke-width",1)

    svg.append("circle").attr("r",35).attr("cx",(root[0]+tip[0])/2).attr("cy",(root[1]+tip[1])/2).attr("fill","rgba(255,255,255,.75)").attr("filter", "url(#blur)");

    let length = Math.round(normL2([tip[0]-root[0],tip[1]-root[1]]))
    svg.append("text").text(length).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("fill","rgb(64,64,64)")
                    .attr("x",(root[0]+tip[0])/2).attr("y",(root[1]+tip[1])/2).attr("font-family", "monospace").attr("font-size",14).attr("font-weight","bolder")
    
        

    return [path,length]
    //svg.append("line").attr("x1",root[0]).attr("y1",root[1])
            //.attr("x2",tip[0]).attr("y2",tip[1]).attr("stroke", "rgb(100,100,100)")

}

function getDists(nodeLoc,nodeCoords){
    //Euclidean Distance
    let dists = []

    for(let i=0; i<nodeCoords.length;i++){
        let dist = ((nodeLoc[0]-nodeCoords[i][0])**2 + (nodeLoc[1]-nodeCoords[i][1])**2)**.5
        dists.push(dist)           
    }
    //console.log(dists)
    return dists
}

function aStarDist(nodeA,nodeB,graph){    
    let f = [nodeA]
    let v = []
    let p = [[nodeA]]
    let d  = 1
    while(f.length>0){ //if search not already finished
        let bestInd = 0
        let bestCost = Infinity
        for(let i=0; i<f.length;i++){
            let iCost = computeHueristic(p[f[i]])
            if(iCost<bestCost){
                bestInd = i
                bestCost = iCost
            }
        }
        let open = f.splice(bestInd,1)
        v.push(open[0])

        if(open == nodeB){ //if goal node found            
            return(computeCost(p[open]))           
                
        }else{ //if goal node NOT found
            for(let i=0; i<graph[open].length;i++){if(graph[open][i]==1){ //get children
                if(!v.includes(i) && !f.includes(i)){ //if child not visited and not on frontier
                    f.push(i) 
                    p[i]=p[open].concat([i])                    
                }
                if(!v.includes(i) && f.includes(i)){ //if child not visited and is on frontier 
                    currCost = computeHueristic(p[i])
                    thisCost = computeHueristic(p[open].concat([i]))                    
                    if(thisCost<currCost){ //see if this path to child is shorter 
                        p[i]=p[open].concat([i]) 
                    }                  
                }
            }   
            }

        }        
    }
    return Infinity
}

function getDistsGraph(node,graph){
    //Graph Distance
    let dists = []

    for(let i=0; i<edges.length;i++){        
        dists.push(aStarDist(node,i,graph))           
    }

    return dists
}

/* function adjustSLD(coords,start,goal,bestToGoal){

    distToGoal = normL2([[coords[0]+start[0]-goal[0]],[coords[1]+start[1]-goal[1]]])
    
    currLength = normL2(coords)
    newLength = Math.max(0,currLength - (distToGoal-bestToGoal))
    
    console.log(newLength)
    return normalizeVec(coords,newLength)  
}
 */


////////////////
//Visualization
////////////////

//Create SVG

let svg = d3.select('#viz').append('svg').attr("width",width+200).attr("height",height+50)

//Title

svg.append("text").text("Graph Search Algorithms")
                    .attr("dominant-baseline","middle")
                    .attr("text-anchor","start")
                    .attr("x",graphBorder/2).attr("y",2*graphBorder/6)
                    .attr("font-family", "monospace")
                    .attr("font-size",graphBorder/4)
                    .attr("fill","rgb(50,50,50)")   
                 
//Play Controls    



let playControls = svg.append("g").attr("transform",`translate(${graphBorder/2+width-graphBorder} ${(graphBorder/2-40)/2})`)

let helpMessage = playControls.append("text").text("Graph Search Algorithms")
                                            .attr("dominant-baseline","middle").attr("text-anchor","end")
                                            .attr("x",-10)
                                            .attr("y",20)
                                            .attr("font-family", "monospace")
                                            .attr("font-size",graphBorder/6)
                                            .attr("fill","rgb(100,100,100)")
                                            .attr("opacity",0)

function setHelp(message){
    helpMessage.text(message)
    helpMessage.transition().duration(200).attr("opacity",1)
}
function clearHelp(){
    helpMessage.transition().duration(200).attr("opacity",0)
}

let autoGlyph = playControls.append("path").attr("d","M 10 30 L 30 20 L 10 10 L 10 30 L 30 20")
                                        .attr("rx",10)
                                        .attr("fill","None")
                                        .attr("stroke", (function(){if(stepByStep){return controlColor}else{return "rgb(0,200,0)"}}))
                                        .attr("stroke-width",2)
                                        
let autoClick = playControls.append("rect").attr("x",0).attr("y",0)
                                            .attr("height", 40)
                                            .attr("width",39)
                                            .attr("rx",10)
                                            .attr("fill","rgba(0,0,0,0)")
                                            .attr("stroke", controlColor)
                                            .attr("stroke-width",2)
                                            .on("click",clickAutoButton)
                                            .on("mouseover",function(){setHelp("(autoplay algorithm)")})
                                            .on("mouseout",clearHelp)

let stepGlyph = playControls.append("path").attr("d","M 10 30 L 25 20 L 10 10 L 10 30 L 25 20 M 30 32.5 L 30 7.5").attr("rx",10)
                                            .attr("fill","None")
                                            .attr("stroke", (function(){if(stepByStep){return "rgb(0,200,0)"}else{return controlColor}}))
                                            .attr("stroke-width",2)
                                            .attr("transform","translate(40 0)")

let stepClick =  playControls.append("rect").attr("x",40).attr("y",0)
                                            .attr("height", 40)
                                            .attr("width",39)
                                            .attr("rx",10)
                                            .attr("fill","rgba(0,0,0,0)")
                                            .attr("stroke", controlColor)
                                            .attr("stroke-width",2)
                                            .on("click",clickStepButton)
                                            .on("mouseover",function(){setHelp("(click algorithm to advance)")})
                                            .on("mouseout",clearHelp)
let speedGlyphs = []
let sGlyphInc = 110/speeds.length
let sGlyphColor = controlColor
for(let i = 0; i < speeds.length; i++){
    if(i<=speed){sGlyphColor = "rgb(250,75,75)"}
    else{sGlyphColor = controlColor}
    speedGlyphs[i] = playControls.append("path").attr("d",`M ${5+i*sGlyphInc} 32.5 L ${(i+1)*sGlyphInc-5} 20 L ${5+i*sGlyphInc} 7.5`)
                                .attr("rx",10)
                                .attr("fill","rgba(0,0,0,0)")
                                .attr("stroke", sGlyphColor)
                                .attr("stroke-width",2)
                                .attr("transform","translate(85 0)")
}

let speedClick =  playControls.append("rect").attr("x",80).attr("y",0)
                                            .attr("height", 40)
                                            .attr("width",120)
                                            .attr("rx",10)
                                            .attr("fill","rgba(0,0,0,0)")
                                            .attr("stroke", controlColor)
                                            .attr("stroke-width",2)
                                            .on("click",clickSpeedButton)
                                            .on("mouseover",function(){setHelp("(change autoplay speed)")})
                                            .on("mouseout",clearHelp)

//Layout

let borderRect = svg.append("rect").attr("x",graphBorder/2).attr("y",graphBorder/2)
                                    .attr("height", height-graphBorder).attr("width",width-graphBorder)
                                    .attr("fill","None").attr("stroke", controlColor).attr("stroke-width",2)

svg.append("text").text("Frontier").attr("x",width-graphBorder/2+50).attr("y",graphBorder/2+15).attr("font-size",20)
                                    .attr("dominant-baseline","middle").attr("text-anchor","middle")
                                    .attr("font-family", "monospace").attr("fill","rgb(50,50,50)")//.attr("font-weight","bolder")
                                    .attr("text-decoration","underline")

svg.append("text").text("Visited").attr("x",width-graphBorder/2+150).attr("y",graphBorder/2+15).attr("font-size",20)
                                    .attr("dominant-baseline","middle").attr("text-anchor","middle")
                                    .attr("font-family", "monospace").attr("fill","rgb(50,50,50)")//.attr("font-weight","bolder")
                                    .attr("text-decoration","underline")

let stackRect = svg.append("rect").attr("x",width-graphBorder/2).attr("y",graphBorder/2)
                                    .attr("height", height-graphBorder).attr("width",200)
                                    .attr("fill","None").attr("stroke", controlColor).attr("stroke-width",2)

let divider = svg.append("line").attr("x1",width-graphBorder/2 +100).attr("y1",graphBorder/2)
                                .attr("x2",width-graphBorder/2 +100).attr("y2",height-graphBorder/2)                                        
                                .attr("fill","None").attr("stroke", controlColor).attr("stroke-width",2)      

let frontierLabel = svg.append("text").text("-").attr("dominant-baseline","middle")
                                                .attr("text-anchor","start").attr("writing-mode","tb")
                                                .attr("rotate", -90).attr("letter-spacing", 10)
                                                .attr("x",width-graphBorder/2+65).attr("y",graphBorder/2+35)
                                                .attr("font-family", "monospace")
                                                .attr("font-size",graphBorder/8)
                                                .attr("fill","rgb(50,50,50)")
                                                .attr("font-weight","bolder")

let visitedLabel = svg.append("text").text("-").attr("dominant-baseline","middle")
                                                .attr("text-anchor","start").attr("writing-mode","tb")
                                                .attr("rotate", -90).attr("letter-spacing", 10)
                                                .attr("x",width-graphBorder/2+165).attr("y",graphBorder/2+35)
                                                .attr("font-family", "monospace")
                                                .attr("font-size",graphBorder/8)
                                                .attr("fill","rgb(50,50,50)")
                                                .attr("font-weight","bolder")

var filter = svg.append("defs").append("filter")
                                    .attr("id", "blur")
                                    .append("feGaussianBlur")
                                    .attr("stdDeviation", 10); 

var filter = svg.append("defs").append("filter")
                                    .attr("id", "lightBlur")
                                    .append("feGaussianBlur")
                                    .attr("stdDeviation", 3); 

let costLabel = svg.append("text").text("Steps: ??? Cost: ???").attr("x",7+graphBorder/2).attr("y",graphBorder/2 + height-graphBorder+10 -22)
                                    .attr("font-family", "monospace").attr("font-size",20)
                                    .attr("fill","rgb(50,50,50)")
                                    
labelText = ["None","Breadth First","Uniform Cost","Depth First","Depth Limited","Itr. Deepening","Greedy Best","A*"]
labelHelpText = ["(clear search algorithm)","(breadth first search)", "(uniform cost search)","(depth first graph search)", "(depth limited depth first graph search)",
                "(iterative deepening depth first tree search)", "(greedy best first search)", "(A* search)"]
let algButtons = []

for(let i=0;i<labelText.length;i++){
    algButtons[i] = svg.append("rect").attr("x",graphBorder/2+145*i).attr("y",graphBorder/2 + height-graphBorder+5)
        .attr("height", 40).attr("width",140)
        .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
        .attr("rx", 10).attr("opacity",.5)
        .on("click",function(){clickAlgButton(i)})
        .on("mouseover",function(){setHelp(labelHelpText[i])})
        .on("mouseout",clearHelp)

    svg.append("text").text(labelText[i]).attr("dominant-baseline","middle").attr("text-anchor","middle")
        .attr("x",75+graphBorder/2+145*i).attr("y",20+graphBorder/2 + height-graphBorder+5)
        .attr("font-family", "monospace").attr("font-size",15)
        .attr("fill","rgb(200,200,200)")
        .on("click",function(){clickAlgButton(i)})
        .on("mouseover",function(){setHelp(labelHelpText[i])})
        .on("mouseout",clearHelp)
}

shadowText = ["None","Heuristic","Cost","Combined"]
shadowHelpText = ["(clear highlights)", "(highlight heuristic values)","(highlight cost)","(highlight heuristic value + cost)"]
let shadowButtons = []

for(let i=0;i<shadowText.length;i++){
    shadowButtons[i] = svg.append("rect").attr("x",graphBorder/2+145*i).attr("y",graphBorder/2 + height-graphBorder+45+5)
        .attr("height", 30).attr("width",140)
        .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
        .attr("rx", 10).attr("opacity",.5)
        .on("click",function(){clickShadowButton(i)})
        .on("mouseover",function(){setHelp(shadowHelpText[i])})
        .on("mouseout",clearHelp)
    svg.append("text").text(shadowText[i]).attr("dominant-baseline","middle").attr("text-anchor","middle")
        .attr("x",75+graphBorder/2+145*i).attr("y",15+graphBorder/2 + height-graphBorder+45+5)
        .attr("font-family", "monospace").attr("font-size",15)
        .attr("fill","rgb(200,200,200)")
        .on("click",function(){clickShadowButton(i)})
        .on("mouseover",function(){setHelp(shadowHelpText[i])})
        .on("mouseout",clearHelp)
}

//Generate Nodes

let nodeCoords = []

for(let i=0; i<nNodes;i++){ 
    let farEnough = false    
    let nX = 0
    let nY = 0
    let fails = 0
    let minDist = JSON.parse(JSON.stringify(minNodeDist))

    while(!farEnough){
        if(i==0){
            farEnough = true
            nX = (width-2*graphBorder)/2+ graphBorder
            nY = (height-2*graphBorder)/2+ graphBorder
        }else{
            nX = Math.random() * (width-2*graphBorder)  + graphBorder
            nY = Math.random() * (height-2*graphBorder) + graphBorder
            let dists = getDists([nX,nY], nodeCoords)
            let closest = Math.min(...dists)
            if(closest>=minDist){
                farEnough = true
                //console.log(closest)
            }else{
                //console.log("fail")
                fails++
                if(fails>allowedFails){
                    fails = 0
                    minDist-=5
                }
            }
            
        }
    } 

    nodeCoords.push([nX,nY])
}

//Draw Edges

let edges = arrayOfZeros(nNodes,nNodes)
let edgeGlyphs = arrayOfZeros(nNodes,nNodes,null) 
let edgeDists = arrayOfZeros(nNodes,nNodes,null) 
let nodeInds = arange(nodeCoords.length)

for(let i=0; i<nNodes-1;i++){  
    
    let nodeLoc = nodeCoords[i]   
    let dists = getDists(nodeLoc,nodeCoords)
    let neighbors = argSort(nodeInds,dists)    

    let nodesLeft = branchFactor
    let n = 0

    
    while(nodesLeft>0){
        
        let neighInd = neighbors.length-2-n
        //let neighDiag = diagonals[neighbors[neighInd]]

        if(!edges[i][neighbors[neighInd]]){

            edgeStuff = drawDirectedEdge(nodeLoc,nodeCoords[neighbors[neighInd]],false)    
            edgeGlyphs[i][neighbors[neighInd]] = edgeStuff[0]
            //edgeGlyphs[neighbors[neighInd]][i] = edgeStuff[0]

            edgeDists[i][neighbors[neighInd]] = edgeStuff[1]            
            edgeDists[neighbors[neighInd]][i] = edgeStuff[1]

            edges[i][neighbors[neighInd]] = 1
            edges[neighbors[neighInd]][i] = 1
            nodesLeft--
            //console.log(alphabet[neighbors[neighInd]])
        }

        n++
        if(n >= nNodes-1){
            nodesLeft=0
        }
    }
   
}    

console.log(edges)
console.log(getDistsGraph(0,edges))

//Draw Circles

let nodeGlyphs = []
let shadowGlyphs = []
let labelGlyphs = []

for(let i=0; i<nNodes;i++){
    
    let shadowGlyph = svg.append("circle")
                    .attr("cx",nodeCoords[i][0])
                    .attr("cy",nodeCoords[i][1])
                    .attr("r",nodeR*1.75)
                    .attr("fill", "rgb(0,0,0)")
                    .attr("filter", "url(#lightBlur)")
                    .attr("opacity",0)
                    //.attr("stroke", "rgba(50,50,50,1)")
                    //.attr("stroke-width",20)
                    //.on("mouseover",function(){return emphasizeNeighbors(i)})               
                    //.on("mouseout",function(){return clearEmphasis()}) 
 

    let glyph = svg.append("circle")
                    .attr("cx",nodeCoords[i][0])
                    .attr("cy",nodeCoords[i][1])
                    .attr("r",nodeR)
                    .attr("fill", "rgb(255,255,255)")
                    .attr("stroke", "rgb(50,50,50)")
                    .attr("stroke-width",2)
                    //.on("mouseover",function(){return emphasizeNeighbors(i)})               
                    //.on("mouseout",function(){return clearEmphasis()}) 
                    
    let label = svg.append("text")
                    .attr("x",nodeCoords[i][0])
                    .attr("y",nodeCoords[i][1]+1)
                    .attr("dominant-baseline","middle")
                    .attr("text-anchor","middle")
                    //.attr("fill", "rgb(255,255,255)")
                    .attr("font-family", "monospace")
                    .attr("font-size", 15)
                    .attr("fill", "rgb(50,50,50)")
                    //.attr("stroke-width",1)
                    //.on("mouseover",function(){return emphasizeNeighbors(i)})     
                    .text(alphabet[i])          
                    //.on("mouseout",function(){return clearEmphasis()})
                    
    
    if(i==0){glyph.attr("stroke", "rgb(50,150,50)").attr("stroke-width",4).attr("r",nodeR)}
    if(i==nNodes-1){glyph.attr("stroke", "rgb(150,50,50)").attr("stroke-width",4).attr("r",nodeR)}       
     

    nodeGlyphs.push(glyph)
    shadowGlyphs.push(shadowGlyph)
    labelGlyphs.push(label)
}

//Viz Functions

function drawRadialBoundary(center,r,adjust=function(x){return x},steps=200){
    let vecInit = adjust([r,0])
    let d = `M ${center[0]+ vecInit[0]} ${center[1]+vecInit[1]} `
    let stepSize = 360/steps
    for(let i=0;i<steps; i++){
        let rotVec = adjust(rotateVec([r,0],stepSize+stepSize*i))
        d+= `L ${center[0]+ rotVec[0]} ${center[1]+rotVec[1]} `
    }

    //d += `L ${center[0]+ vecInit[0]} ${center[1]+vecInit[1]} `
    //console.log(d)
    svg.append("path").attr("d",d).attr("stroke", "rgb(50,50,50)").attr("fill","None").attr("stroke-width",1)
    

}

function emphasizeNeighbors(nodeInd){
    nodeGlyphs[nodeInd].transition().duration(100).attr("fill", "rgb(50,50,200)") 
    labelGlyphs[nodeInd].transition().duration(100).attr("fill", "rgb(200,200,200)") 
    for(i=0;i<nNodes;i++){
        if(edges[nodeInd][i]==1){
            nodeGlyphs[i].transition().duration(100).attr("fill", "rgb(200,50,50)") 
            //labelGlyphs[i].transition().duration(100).attr("stroke", "rgb(200,200,200)") 
            labelGlyphs[i].transition().duration(100).attr("fill", "rgb(225,225,225)") 
            
        }

    }
}

function clearEmphasis(){
    for(i=0;i<nNodes;i++){        
            nodeGlyphs[i].transition().duration(100).attr("fill", "rgb(255,255,255)")
            labelGlyphs[i].transition().duration(100).attr("fill", "rgb(50,50,50)")
    }
}

function getDistOpacity(ind,measure=0){
    
    let opacities = []
    let refLeft = getDists(nodeCoords[nodeCoords.length-1],nodeCoords)
    let refOut = getDistsGraph(0,edges) 
    
    if(measure==0){
        for(let i=0; i<refLeft.length;i++){
            opacities.push(0)
        }
    }
    if(measure==1){                
        let worstDist = Math.max(...refLeft)        
        for(let i=0; i<refLeft.length;i++){
            opacities.push(.1 + .9* ((worstDist-refLeft[i])/worstDist)**2)
        }  
    }
    if(measure==2){        
        let worstDist = Math.max(...refOut)        
        for(let i=0; i<refOut.length;i++){
            opacities.push(.1 + .9* ((worstDist-refOut[i])/worstDist)**2)
        }
    }

    if(measure==3){    
        refBoth = []
        for(let j=0;j<refLeft.length;j++){
            refBoth.push(refLeft[j]+refOut[j])
        }
        let worstDist = Math.max(...refBoth)

        for(let i=0; i<refBoth.length;i++){
            opacities.push(.1 + .9* ((worstDist-refBoth[i])/worstDist)**2)
        }            
    }
    
    return opacities
}

function highlightNodes(targets,color){
    for(let i=0;i<nodeGlyphs.length;i++){
        if(targets.includes(i)){
            nodeGlyphs[i].attr("fill",color)       
        }
    }
}

function highlightEdges(path, color){
    for(let i=0;i<path.length-1;i++){
        if(edgeGlyphs[path[i]][path[i+1]]!=null){
            edgeGlyphs[path[i]][path[i+1]].attr("stroke",color).attr("fill",color).attr("stroke-width",3)
        }else{
            edgeGlyphs[path[i+1]][path[i]].attr("stroke",color).attr("fill",color).attr("stroke-width",3)
        }
        
    }
}

function revertEdges(color){
    for(let i=0;i<edgeGlyphs.length;i++){
        for(let j=0;j<edgeGlyphs[i].length;j++){
            if(edgeGlyphs[i][j]){
                edgeGlyphs[i][j].attr("stroke",color).attr("fill",color).attr("stroke-width",1)
            }
            
        }

        
       
    }
}

function computeSLD(a,b){
    return normL2([a[0]-b[0],a[1]-b[1]])


}

function computeCost(path){
    cost = 0
    for(let i=0;i<path.length-1;i++){
        cost += edgeDists[path[i]][path[i+1]]
    }
    return cost
}

function computeSLDtoGoal(path){
    let nodeLoc = nodeCoords[path[path.length-1]]
    let goalLoc = nodeCoords[nodeCoords.length-1]
    return computeSLD(nodeLoc,goalLoc)
}

function computeHueristic(path){

    return computeCost(path) + computeSLDtoGoal(path)
}

function letterize(arrayOfNums){
    stringOfChars = ""
    for(let i=0;i<arrayOfNums.length;i++){
        stringOfChars += alphabet[arrayOfNums[i]]
    }
    return stringOfChars

}

function writeFrontVisit(F,V){
    frontierLabel.text(toString(F))
    visitedLabel.text(toString(V))
}

class queueNodes{
    constructor(start){
        this.frontier = [start]
    }
    next(){
        //console.log(this.frontier)
       return this.frontier.shift()
       
    }
    add(node){
            this.frontier.push(node)
        }
}

function updateLists(){
    frontierLabel.text(letterize(frontier))
    visitedLabel.text(letterize(visited))
}

function updateSearchViz(){
    highlightNodes(nodeInds,"rgb(255,255,255)")
    highlightNodes(frontier,"rgb(200,50,50)")
    highlightNodes(visited,"rgb(128,128,128)")       
    //console.log(visited)     
}

function showSolution(){
    revertEdges("rgb(50,50,50)")  
    highlightNodes(paths[nNodes-1],"rgba(200,100,0)")            
    highlightEdges(paths[nNodes-1],"rgba(200,100,0)")       
    let cost  = computeCost(paths[nNodes-1])
    costLabel.text(`Steps: ${paths[nNodes-1].length-1} Cost: ${cost}`)    
}

function costShadowNodes(){

    let minCost = Infinity
    let maxCost = -Infinity
    for(let i=0;i<shadowGlyphs.length;i++){
        if(frontier.includes(i)){
            let fCost = computeCost(paths[i])
            if(fCost<minCost){minCost=fCost}
            if(fCost>maxCost){maxCost=fCost}
        }
    }
    maxDif = 1 + maxCost-minCost

    for(let i=0;i<shadowGlyphs.length;i++){
        if(frontier.includes(i)){
            shadowGlyphs[i].attr("opacity",1-(computeCost(paths[i])-minCost)/maxDif)
        }
        else{
            shadowGlyphs[i].attr("opacity",0)
        }
    }
}

//////////////////////////
//Graph Search Algorithms
//////////////////////////

//Graph Search Global Variables
let frontier = []
let visited = []
let paths = [[0]]
let done  = 1

//BFS
function breadthFirstSearch(){
    if(!done){ //if search not already finished
        let open = frontier.shift()
        visited.push(open)

        if(open == nNodes-1){ //if goal node found
            //set search to finished
            done = 1
            //update visualization
            showSolution();updateLists(frontier)            
        }
        else{ //if goal node NOT found
            for(let i=0; i<edges[open].length;i++){if(edges[open][i]==1){ //get children
                if(!visited.includes(i) && !frontier.includes(i)){ //if child not visited and not on frontier
                    frontier.push(i) 
                    paths[i]=paths[open].concat([i])
                }
            }}
            //update visualization        
            updateSearchViz(frontier);updateLists(frontier)  
        }        
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }
}

//UCS
function uniformCostSearch(){
    if(!done){ //if search not already finished
        let bestInd = 0
        let bestCost = Infinity
        for(let i=0; i<frontier.length;i++){
            let iCost = computeCost(paths[frontier[i]])
            if(iCost<bestCost){
                bestInd = i
                bestCost = iCost
            }
        }
        let open = frontier.splice(bestInd,1)
        visited.push(open[0])

        if(open == nNodes-1){ //if goal node found
            //set search to finished
            done = 1
            //update visualization
            showSolution();updateLists(frontier)//;costShadowNodes()            
        }
        else{ //if goal node NOT found
            for(let i=0; i<edges[open].length;i++){if(edges[open][i]==1){ //get children
                if(!visited.includes(i) && !frontier.includes(i)){ //if child not visited and not on frontier
                    frontier.push(i) 
                    paths[i]=paths[open].concat([i])                    
                }
                if(!visited.includes(i) && frontier.includes(i)){ //if child not visited and is on frontier 
                    currCost = computeCost(paths[i])
                    thisCost = computeCost(paths[open].concat([i]))                    
                    if(thisCost<currCost){ //see if this path to child is shorter 
                        paths[i]=paths[open].concat([i]) 
                    }                  
                }
            }}
            //update visualization        
            updateSearchViz(frontier);updateLists(frontier)//;costShadowNodes()
            
            

        }        
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }
}

//DFS
function depthFirstSearch(){
    if(!done){ //if search not already finished
        let open = frontier.pop()
        visited.push(open)

        if(open == nNodes-1){ //if goal node found
            //set search to finished
            done = 1
            //update visualization           
            showSolution();updateLists(frontier)     
        }
        else{ //if goal node NOT found
            for(let i=0; i<edges[open].length;i++){if(edges[open][i]==1){ //get children
                if(!visited.includes(i) && !frontier.includes(i)){ //if child not visited and not on frontier
                    frontier.push(i) 
                    paths[i]=paths[open].concat([i])
                }
            }}        
            //update visualization        
            updateSearchViz(frontier);updateLists(frontier)  
        }
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }
}

//DLS
depthLimit = 4
function depthLimitedSearch(){ 
    if(!done){ //if search not already finished
        let open = frontier.pop()
        
        visited.push(open)
        

        if(open == nNodes-1){ //if goal node found
            //set search to finished
            done = 1
            //update visualization           
            showSolution();updateLists(frontier)  
        }
        else{ //if goal node NOT found
            for(let i=0; i<edges[open].length;i++){if(edges[open][i]==1){ //get children
                if(!visited.includes(i) && !frontier.includes(i)){ //if child not visited and not on frontier
                    if(paths[open].length+1<=depthLimit){
                        frontier.push(i) 
                        paths[i]=paths[open].concat([i])
                    }
                }
            }}        
            //update visualization        
            updateSearchViz(frontier);updateLists(frontier)  
        }
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }
    if(frontier.length==0){ //if goal node too deep
        costLabel.text(`Steps: NA Cost: NA`)
        done = 1        
    }
}

//IDS
maxDepth = 0
let depths = [0]
for(let i=1; i<edges[0].length;i++){
        depths[i] = Infinity
    }
costLabel.text(`Steps: ${maxDepth} Cost: ???`)

function iterativeDeepeningSearch(){
    if(!done){ //if search not already finished
        let open = frontier.pop()  

        if(open == nNodes-1){ //if goal node found
            //set search to finished
            done = 1
            //update visualization           
            showSolution();updateLists(frontier) 
        }
        else{ //if goal node NOT found
            //investigate children
            for(let i=0; i<edges[open].length;i++){ //get children   
                if(edges[open][i]==1){ //get children                            
                    if(depths[open]<maxDepth && (depths[open] + 1)<depths[i]){  
                        depths[i] = depths[open] + 1
                        frontier.push(i)                            
                        paths[i]=paths[open].concat([i])
                    }                          
                }
            }        
            //update visualization        
            updateSearchViz(frontier);updateLists(frontier)  
        }
        if(frontier.length==0){ //if goal node too deep for current limit
            //console.log(depths) 
            maxDepth++
            frontier = [0]
            depths = [0]
            for(let i=1; i<edges[0].length;i++){
                depths[i] = Infinity
            }            
            paths = [[0]]  
            
            costLabel.text(`Steps: ${maxDepth} Cost: ???`)        
        }
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }

}

//BFS
function greedyBestSearch(){
    if(!done){ //if search not already finished
        let bestInd = 0
        let bestCost = Infinity
        for(let i=0; i<frontier.length;i++){
            let iCost = computeSLDtoGoal(paths[frontier[i]])
            if(iCost<bestCost){
                bestInd = i
                bestCost = iCost
            }
        }
        let open = frontier.splice(bestInd,1)
        visited.push(open[0])

        if(open == nNodes-1){ //if goal node found
            //set search to finished
            done = 1
            //update visualization
            showSolution();updateLists(frontier)//;costShadowNodes()            
        }else{ //if goal node NOT found
            for(let i=0; i<edges[open].length;i++){if(edges[open][i]==1){ //get children
                if(!visited.includes(i) && !frontier.includes(i)){ //if child not visited and not on frontier
                    frontier.push(i) 
                    paths[i]=paths[open].concat([i])                    
                }
                if(!visited.includes(i) && frontier.includes(i)){ //if child not visited and is on frontier 
                    currCost = computeSLDtoGoal(paths[i])
                    thisCost = computeSLDtoGoal(paths[open].concat([i]))                    
                    if(thisCost<currCost){ //see if this path to child is shorter 
                        paths[i]=paths[open].concat([i]) 
                    }                  
                }
        }}
            //update visualization        
            updateSearchViz(frontier);updateLists(frontier)//;costShadowNodes()
            
            

        }        
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }
}

//A*
function aStarSearch(){
    if(!done){ //if search not already finished
        let bestInd = 0
        let bestCost = Infinity
        for(let i=0; i<frontier.length;i++){
            let iCost = computeHueristic(paths[frontier[i]])
            if(iCost<bestCost){
                bestInd = i
                bestCost = iCost
            }
        }
        let open = frontier.splice(bestInd,1)
        visited.push(open[0])

        if(open == nNodes-1){ //if goal node found
            //set search to finished
            done = 1
            //update visualization
            showSolution();updateLists(frontier)//;costShadowNodes()            
        }else{ //if goal node NOT found
            for(let i=0; i<edges[open].length;i++){if(edges[open][i]==1){ //get children
                if(!visited.includes(i) && !frontier.includes(i)){ //if child not visited and not on frontier
                    frontier.push(i) 
                    paths[i]=paths[open].concat([i])                    
                }
                if(!visited.includes(i) && frontier.includes(i)){ //if child not visited and is on frontier 
                    currCost = computeHueristic(paths[i])
                    thisCost = computeHueristic(paths[open].concat([i]))                    
                    if(thisCost<currCost){ //see if this path to child is shorter 
                        paths[i]=paths[open].concat([i]) 
                    }                  
                }
        }}
            //update visualization        
            updateSearchViz(frontier);updateLists(frontier)//;costShadowNodes()
            
            

        }        
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }
}

let algorithms = [null,breadthFirstSearch,uniformCostSearch,depthFirstSearch,depthLimitedSearch,iterativeDeepeningSearch,greedyBestSearch,aStarSearch]

function clickShadowButton(ind){   
    
    let fills = ["rgb(0,0,0)","rgb(200,0,0)","rgb(0,0,200)","rgb(200,0,200)"]
            
    for(let i=0;i<shadowButtons.length;i++){
        if(i==ind){
            shadowButtons[i].attr("opacity",1)
        }else{
            shadowButtons[i].attr("opacity",.5)
        }
    }        
    
    let opacities = getDistOpacity(0,ind)        
    for(let i=0; i<nNodes;i++){            
        shadowGlyphs[i].attr("opacity",opacities[i]).attr("fill",fills[ind])          
    }
    
}

function clickSpeedButton(){
    speed = (speed + 1)%speeds.length
    
    if(typeof animation !== 'undefined' && stepByStep==false){
        clearInterval(animation)
        animation = setInterval(algorithms[currentAlg], 1000/speeds[speed]) 
    }   
    for(let i = 0; i < speeds.length; i++){
        if(i<=speed){sGlyphColor = "rgb(250,75,75)"}
        else{sGlyphColor = controlColor}
        speedGlyphs[i].attr("stroke", sGlyphColor)    
    }
}

function clickAutoButton(){
    stepByStep = false 
    
    animation = setInterval(algorithms[currentAlg], 1000/speeds[speed]) 
    
    autoGlyph.attr("stroke","rgb(0,200,0)")
    stepGlyph.attr("stroke",controlColor)
}

function clickStepButton(){
    stepByStep = true 
    if(typeof animation !== 'undefined'){clearInterval(animation)} 
    autoGlyph.attr("stroke",controlColor)
    stepGlyph.attr("stroke","rgb(0,200,0)")
}

function clickAlgButton(ind){   
    
    if(done||currentAlg != ind){
        
        currentAlg = ind

        if(typeof animation !== 'undefined'){clearInterval(animation)} 
              
        for(let i=0;i<algButtons.length;i++){
            if(i==ind){
                algButtons[i].attr("opacity",1)
            }else{
                algButtons[i].attr("opacity",.5)
            }
        }
        
        frontier = [0]
        visited = []
        paths = [[0]]        
        
        maxDepth = 1

        revertEdges("rgb(50,50,50)")  
        highlightNodes(nodeInds,"rgb(255,255,255)")
        
        
        if(ind>0){
            done = false
            if(!stepByStep){
                animation = setInterval(algorithms[ind], 1000/speeds[speed]) 
            }else{
                algorithms[ind]()
            }
        } 
    }else{
        if(stepByStep){        
        algorithms[ind]()
        }
    }    
}

clickShadowButton(0)
clickAlgButton(0)
