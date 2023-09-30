//Visualization Settings

let width = 1200
let height = 900
let nNodes = 52
let graphBorder = 100
let nodeR = 15
let arrowL = 10
let minNodeDist = 100
let allowedFails = 100
let branchFactor = 2
let fps = 60

let algorithm = 0 // [bf, uc, df, dl, id, bd]

let alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];


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
    
    let dists = []

    for(let i=0; i<nodeCoords.length;i++){
        let dist = ((nodeLoc[0]-nodeCoords[i][0])**2 + (nodeLoc[1]-nodeCoords[i][1])**2)**.5
        dists.push(dist)           
    }

    return dists
}

//Create SVG

let svg = d3.select('#viz').append('svg').attr("width",width+200).attr("height",height+50)



svg.append("text").text("Graph Search Algorithms").attr("dominant-baseline","middle").attr("text-anchor","start")
                    .attr("x",graphBorder/2).attr("y",2*graphBorder/6).attr("font-family", "monospace").attr("font-size",graphBorder/4).attr("fill","rgb(50,50,50)")   
                 

let borderRect = svg.append("rect").attr("x",graphBorder/2).attr("y",graphBorder/2)
                                    .attr("height", height-graphBorder).attr("width",width-graphBorder)
                                    .attr("fill","None").attr("stroke", "rgb(50,50,50)")



svg.append("text").text("Frontier").attr("x",width-graphBorder/2+50).attr("y",graphBorder/2+15).attr("font-size",20)
                                    .attr("dominant-baseline","middle").attr("text-anchor","middle")
                                    .attr("font-family", "monospace").attr("fill","rgb(50,50,50)").attr("font-weight","bolder")
                                    .attr("text-decoration","underline")

svg.append("text").text("Visited").attr("x",width-graphBorder/2+150).attr("y",graphBorder/2+15).attr("font-size",20)
                                    .attr("dominant-baseline","middle").attr("text-anchor","middle")
                                    .attr("font-family", "monospace").attr("fill","rgb(50,50,50)").attr("font-weight","bolder")
                                    .attr("text-decoration","underline")

let stackRect = svg.append("rect").attr("x",width-graphBorder/2).attr("y",graphBorder/2)
                                    .attr("height", height-graphBorder).attr("width",200)
                                    .attr("fill","None").attr("stroke", "rgb(50,50,50)")

let divider = svg.append("line").attr("x1",width-graphBorder/2 +100).attr("y1",graphBorder/2)
                                .attr("x2",width-graphBorder/2 +100).attr("y2",height-graphBorder/2)                                        
                                .attr("fill","None").attr("stroke", "rgb(50,50,50)")                           

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
let algButtons = []

for(let i=0;i<labelText.length;i++){
    algButtons[i] = svg.append("rect").attr("x",graphBorder/2+145*i).attr("y",graphBorder/2 + height-graphBorder+5)
        .attr("height", 40).attr("width",140)
        .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
        .attr("rx", 10).attr("opacity",.5)
        .on("click",function(){clickAlgButton(i)})

    svg.append("text").text(labelText[i]).attr("dominant-baseline","middle").attr("text-anchor","middle")
        .attr("x",75+graphBorder/2+145*i).attr("y",20+graphBorder/2 + height-graphBorder+5)
        .attr("font-family", "monospace").attr("font-size",15)
        .attr("fill","rgb(200,200,200)")
        .on("click",function(){clickAlgButton(i)})
}

shadowText = ["None","From Goal","From Start","Combined"]
let shadowButtons = []

for(let i=0;i<shadowText.length;i++){
    shadowButtons[i] = svg.append("rect").attr("x",graphBorder/2+145*i).attr("y",graphBorder/2 + height-graphBorder+45+5)
        .attr("height", 30).attr("width",140)
        .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
        .attr("rx", 10).attr("opacity",.5)
        .on("click",function(){clickShadowButton(i)})

    svg.append("text").text(shadowText[i]).attr("dominant-baseline","middle").attr("text-anchor","middle")
        .attr("x",75+graphBorder/2+145*i).attr("y",15+graphBorder/2 + height-graphBorder+45+5)
        .attr("font-family", "monospace").attr("font-size",15)
        .attr("fill","rgb(200,200,200)")
        .on("click",function(){clickShadowButton(i)})
}




/* 
let bfButton = svg.append("rect").attr("x",graphBorder/2).attr("y",graphBorder/2 + height-graphBorder+10)
                                    .attr("height", 50).attr("width",150)
                                    .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
                                    .attr("rx", 10)
                                    .on("click",function(){clickAlgButton(0)})
                                    .attr("rx", 10).attr("opacity",.5)

svg.append("text").text("Breadth First").attr("dominant-baseline","middle").attr("text-anchor","middle")
                                        .attr("x",75+graphBorder/2).attr("y",25+graphBorder/2 + height-graphBorder+10)
                                        .attr("font-family", "monospace").attr("font-size",15)
                                        .attr("fill","rgb(200,200,200)")
                                        .on("click",function(){clickAlgButton(0)})

let ucButton = svg.append("rect").attr("x",graphBorder/2+160).attr("y",graphBorder/2 + height-graphBorder+10)
                                    .attr("height", 50).attr("width",150)
                                    .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
                                    .attr("rx", 10).attr("opacity",.5)
                                    .on("click",function(){clickAlgButton(1)})

svg.append("text").text("Uniform Cost").attr("dominant-baseline","middle").attr("text-anchor","middle")
                                    .attr("x",75+graphBorder/2+160).attr("y",25+graphBorder/2 + height-graphBorder+10)
                                    .attr("font-family", "monospace").attr("font-size",15)
                                    .attr("fill","rgb(200,200,200)")
                                    .on("click",function(){clickAlgButton(1)})


let dfButton = svg.append("rect").attr("x",graphBorder/2+160*2).attr("y",graphBorder/2 + height-graphBorder+10)
                                    .attr("height", 50).attr("width",150)
                                    .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
                                    .attr("rx", 10).attr("opacity",.5)
                                    .on("click",function(){clickAlgButton(2)})

svg.append("text").text("Depth First").attr("dominant-baseline","middle").attr("text-anchor","middle")
                                    .attr("x",75+graphBorder/2+160*2).attr("y",25+graphBorder/2 + height-graphBorder+10)
                                    .attr("font-family", "monospace").attr("font-size",15)
                                    .attr("fill","rgb(200,200,200)")
                                    .on("click",function(){clickAlgButton(2)})


let dlButton = svg.append("rect").attr("x",graphBorder/2+160*3).attr("y",graphBorder/2 + height-graphBorder+10)
                                    .attr("height", 50).attr("width",150)
                                    .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
                                    .attr("rx", 10).attr("opacity",.5)
                                    .on("click",function(){clickAlgButton(3)})

svg.append("text").text("Depth Limited").attr("dominant-baseline","middle").attr("text-anchor","middle")
                                    .attr("x",75+graphBorder/2+160*3).attr("y",25+graphBorder/2 + height-graphBorder+10)
                                    .attr("font-family", "monospace").attr("font-size",15)
                                    .attr("fill","rgb(200,200,200)")
                                    .on("click",function(){clickAlgButton(3)})


let idButton = svg.append("rect").attr("x",graphBorder/2+160*4).attr("y",graphBorder/2 + height-graphBorder+10)
                                    .attr("height", 50).attr("width",150)
                                    .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
                                    .attr("rx", 10).attr("opacity",.5)
                                    .on("click",function(){clickAlgButton(4)})

svg.append("text").text("Iterative Deep.").attr("dominant-baseline","middle").attr("text-anchor","middle")
                                    .attr("x",75+graphBorder/2+160*4).attr("y",25+graphBorder/2 + height-graphBorder+10)
                                    .attr("font-family", "monospace").attr("font-size",15)
                                    .attr("fill","rgb(200,200,200)")
                                    .on("click",function(){clickAlgButton(4)})

let gbfsButton = svg.append("rect").attr("x",graphBorder/2+160*5).attr("y",graphBorder/2 + height-graphBorder+10)
                                    .attr("height", 50).attr("width",150)
                                    .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
                                    .attr("rx", 10).attr("opacity",.5)
                                    .on("click",function(){clickAlgButton(5)})

svg.append("text").text("Greedy Best").attr("dominant-baseline","middle").attr("text-anchor","middle")
                                    .attr("x",75+graphBorder/2+160*5).attr("y",25+graphBorder/2 + height-graphBorder+10)
                                    .attr("font-family", "monospace").attr("font-size",15)
                                    .attr("fill","rgb(200,200,200)")
                                    .on("click",function(){clickAlgButton(5)})

let aStarButton = svg.append("rect").attr("x",graphBorder/2+160*6).attr("y",graphBorder/2 + height-graphBorder+10)
                                    .attr("height", 50).attr("width",150)
                                    .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
                                    .attr("rx", 10).attr("opacity",.5)
                                    .on("click",function(){clickAlgButton(6)})

svg.append("text").text("A*").attr("dominant-baseline","middle").attr("text-anchor","middle")
                                    .attr("x",75+graphBorder/2+160*6).attr("y",25+graphBorder/2 + height-graphBorder+10)
                                    .attr("font-family", "monospace").attr("font-size",15)
                                    .attr("fill","rgb(200,200,200)")
                                    .on("click",function(){clickAlgButton(6)})
 */

/* 
let bdButton = svg.append("rect").attr("x",graphBorder/2+160*5).attr("y",graphBorder/2 + height-graphBorder+10)
                                    .attr("height", 50).attr("width",150)
                                    .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
                                    .attr("rx", 10).attr("opacity",.5)
                                    .on("click",function(){clickAlgButton(5)})

svg.append("text").text("Bidirectional").attr("dominant-baseline","middle").attr("text-anchor","middle")
                                    .attr("x",75+graphBorder/2+160*5).attr("y",25+graphBorder/2 + height-graphBorder+10)
                                    .attr("font-family", "monospace").attr("font-size",15)
                                    .attr("fill","rgb(200,200,200)")
                                    .on("click",function(){clickAlgButton(5)}) */

//let algButtons = [bfButton,ucButton,dfButton,dlButton,idButton,gbfsButton,aStarButton]//,bdButton]
//

function adjustSLD(coords,start,goal,bestToGoal){

    distToGoal = normL2([[coords[0]+start[0]-goal[0]],[coords[1]+start[1]-goal[1]]])
    //bestToGoal = normL2([[best[0]-goal[0]],[best[1]-goal[1]]])
    currLength = normL2(coords)
    newLength = Math.max(0,currLength - (distToGoal-bestToGoal))
    
    console.log(newLength)
    return normalizeVec(coords,newLength)  
}

function drawRadialBoundary(center,r,adjust=function(x){return x},steps=200){
    let vecInit = adjust([r,0])
    let d = `M ${center[0]+ vecInit[0]} ${center[1]+vecInit[1]} `
    let stepSize = 360/steps
    for(let i=0;i<steps; i++){
        let rotVec = adjust(rotateVec([r,0],stepSize+stepSize*i))
        d+= `L ${center[0]+ rotVec[0]} ${center[1]+rotVec[1]} `
    }

    //d += `L ${center[0]+ vecInit[0]} ${center[1]+vecInit[1]} `
    console.log(d)
    svg.append("path").attr("d",d).attr("stroke", "rgb(50,50,50)").attr("fill","None").attr("stroke-width",1)
    

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
                console.log(closest)
            }else{
                console.log("fail")
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
/* else if(i==1){
    farEnough = true            
    nX = (width-2*graphBorder)  + graphBorder
    nY = (height-2*graphBorder) + graphBorder */


//refDist = normL2([nodeCoords[10][0]-[nodeCoords.length-1][0],nodeCoords[10][1]-[nodeCoords.length-1][1]])





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

//Draw Circles
nodeGlyphs = []
shadowGlyphs = []
labelGlyphs = []

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
    if(measure==0){return 0}

    if(measure==1){
        let refLeft = getDists(nodeCoords[nodeCoords.length-1],nodeCoords)        
        let worstDist = Math.max(...refLeft)        
        return .1 + .9* ((worstDist-refLeft[ind])/worstDist)**2
    }
    if(measure==2){
        let refOut = getDists(nodeCoords[0],nodeCoords)        
        let worstDist = Math.max(...refOut)
        return .1 + .9* ((worstDist-refOut[ind])/worstDist)**2
    }

    if(measure==3){
        let refLeft = getDists(nodeCoords[nodeCoords.length-1],nodeCoords)         
        let refOut = getDists(nodeCoords[0],nodeCoords) 

        
        
        refBoth = []
        for(let j=0;j<refLeft.length;j++){
            refBoth.push(refLeft[j]+refOut[j]*1.5)
        }
        let worstDist = Math.max(...refBoth)

        return .1 + .9* ((worstDist-refBoth[ind])/worstDist)**2
    }
}





for(let i=0; i<nNodes;i++){
    
    let shadowGlyph = svg.append("circle")
                    .attr("cx",nodeCoords[i][0])
                    .attr("cy",nodeCoords[i][1])
                    .attr("r",nodeR*1.75)
                    .attr("fill", "rgb(0,0,0)")
                    .attr("filter", "url(#lightBlur)")
                    .attr("opacity",getDistOpacity(i))
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
    for(let i=0;i<arrayOfNums.length-1;i++){
        stringOfChars += alphabet[arrayOfNums[i]]
    }
    return stringOfChars

}

function writeFrontVisit(F,V){
    frontierLabel.text(toString(F))
    visitedLabel.text(toString(V))
}


let frontier = []
let visited = []
let paths = [[0]]
let done  = 1

class queueNodes{
    constructor(start){
        this.frontier = [start]
    }
    next(){
        console.log(this.frontier)
       return this.frontier.shift()
       
    }
    add(node){
            this.frontier.push(node)
        }
}

function updateLists(fontier){
    frontierLabel.text(letterize(fontier))
    visitedLabel.text(letterize(visited))
}

function updateSearchViz(fontier){
    highlightNodes(nodeInds,"rgb(255,255,255)")
    highlightNodes(fontier,"rgb(200,50,50)")
    highlightNodes(visited,"rgb(128,128,128)")       
    console.log(visited)     
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
    }
}

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
    }
}

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
    }
}

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
    }
    if(frontier.length==0){ //if goal node too deep
        costLabel.text(`Steps: NA Cost: NA`)
        done = 1
    }
}

maxDepth = 0

function iterativeDeepeningSearch(){
    costLabel.text(`Steps: ${maxDepth} Cost: ???`)
    let depths = [0]
    for(let i=1; i<edges[0].length;i++){
        depths[i] = Infinity
    }

    if(!done){ //if search not already finished
        let open = frontier.pop()  

        if(open == nNodes-1){ //if goal node found
            //set search to finished
            done = 1
            //update visualization           
            showSolution();updateLists(frontier) 
        }
        else{ //if goal node NOT found
            //if(depths[open]<maxDepth){
                for(let i=0; i<edges[open].length;i++){
                    if(edges[open][i]==1){ //get children
                        //if(!frontier.includes(i)){
                        //if(!paths[open].includes(i)){ //if child not visited and not on frontier //&& !frontier.includes(i)
                        //if(paths[open].length<maxDepth){ 
                            let childDepth = Math.min(depths[open] + 1, depths[i])
                            if(childDepth<=maxDepth){  
                            frontier.push(i)                            
                            paths[i]=paths[open].concat([i])
                            depths[i] = depths[open] + 1
                            console.log(depths)
                            }
                        //} 
                        //}
                    //}
                }
        }        
            //update visualization        
            updateSearchViz(frontier);updateLists(frontier)  
        }
        if(frontier.length==0){ //if goal node too deep for current limit
            console.log(depths) 
            maxDepth++
            frontier = [0]
            depths = [0]
            for(let i=1; i<edges[0].length;i++){
                depths[i] = Infinity
            }
            //visited = []
            paths = [[0]]  
            
            costLabel.text(`Steps: ${maxDepth} Cost: ???`)        
        }
    }

}


function iterativeDeepeningSearchNEW(){
    costLabel.text(`Steps: ${maxDepth} Cost: ???`)
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
                if(!visited.includes(i)){ //if child not visited and not on frontier
                    if(paths[open].length-1<maxDepth){
                        if(frontier.includes(i)){
                            if(paths[i].length>paths[open].length){
                                console.log("It Happened!")
                                paths[i]=paths[open].concat([i])
                            } 
                        }
                        else{
                            frontier.push(i)
                            paths[i]=paths[open].concat([i])
                        }                             
                    }
                }
            }}        
            //update visualization        
            updateSearchViz(frontier);updateLists(frontier)  
        }
    }
    if(frontier.length==0){ //if goal node too deep for current limit
        maxDepth++
        frontier = [0]
        visited = []
        paths = [[0]]   
        costLabel.text(`Steps: ${maxDepth} Cost: ???`)        
    }

}


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
    }
}

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
    }
}




let algorithms = [null,breadthFirstSearch,uniformCostSearch,depthFirstSearch,depthLimitedSearch,iterativeDeepeningSearch,greedyBestSearch,aStarSearch]


function clickShadowButton(ind){   

    let fills = ["rgb(0,0,0)","rgb(200,0,0)","rgb(0,0,200)","rgb(200,0,200)"]
    if(done){
        
        if(typeof animation !== 'undefined'){clearInterval(animation)} 
              
        for(let i=0;i<shadowButtons.length;i++){
            if(i==ind){
                shadowButtons[i].attr("opacity",1)
            }else{
                shadowButtons[i].attr("opacity",.5)
            }
        }        

        for(let i=0; i<nNodes;i++){            
            shadowGlyphs[i].attr("opacity",getDistOpacity(i,ind)).attr("fill",fills[ind])

            

        }
        
   
    }

}

clickShadowButton(0)

function clickAlgButton(ind){   

    if(done){
        
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
            done = 0
            animation = setInterval(algorithms[ind], 1000/fps) 
        }   
    }
}

clickAlgButton(0)







//function pause(){if(play==1){play=0;clearInterval(animation)} 
             //else{play=1; animation = setInterval(uniformCostSearch, 1000/fps)}}

//function play()
//fps = 4
//animation = setInterval(uniformCostSearch, 1000/fps)
//

 //not used, but useful                