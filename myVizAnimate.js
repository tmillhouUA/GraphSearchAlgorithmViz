//Visualization Settings

let width = 800
let height = 800
let gridSide = 9

//Create SVG

let svg = d3.select('#viz').append('svg').attr("width",width).attr("height",height)


//Create Visualization Elements


let neighborhoodGrid = []

for(i=0;i<gridSide;i++){
    neighborhoodGrid[i] = []
    for(j=0;j<gridSide;j++){
        neighborhoodGrid[i][j] = svg.append("circle").attr("r",width/gridSide/4)
                                //.attr("height",height/gridSide)
                                .attr("cx", width/gridSide/2 + width/gridSide * i )
                                .attr("cy", width/gridSide/2 + height/gridSide * j )
                                .attr("stroke","None")
                                .attr("fill",`rgba(${parseInt(255 * Math.random())},${parseInt(255 * Math.random())},${parseInt(255 * Math.random())},.5)`)
}}


let backgroundRectangle = svg.append("rect").attr("width",width)
                                            .attr("height",height)
                                            .attr("stroke","None")
                                            .attr("fill","rgba(200,200,200,0)")
                                            .on("click",function(){pause();relocateCircle(d3.mouse(this),testCircle)})

let testCircle = svg.append("circle").attr("cx",width/2)
                                     .attr("cy",height/2)
                                     .attr("r",100)
                                     .attr("fill","rgba(0,0,255,.5)")
                                     .attr("stroke","rgba(0,0,255,1)")
                                     .on("mouseenter ",function(){emphasize(d3.select(this),1.5)}) //"on" expects a function as an argument not a function call, 
                                                                                                   // hence the anonymous function wrapped around the call to "emphasize"
                                     .on("mouseleave ",function(){deemphasize(d3.select(this),1.5)})
                                     .attr("emphasized",0)


//Create Interaction Functions

function colorDance(){
    for(i=0;i<gridSide;i++){        
        for(j=0;j<gridSide;j++){

            let currX = parseFloat(neighborhoodGrid[i][j].attr("cx"))
            let currY = parseFloat(neighborhoodGrid[i][j].attr("cy"))
            if(Math.random()>=.5){currY -= 1}else{currY += 1}
            if(Math.random()>=.5){currX += 1}else{currX -= 1}
            
            
            /* //let cogX=0
            //let cogY=0
            let norm = 0
            let dists = 0
            let dirVec = [0,0]
            let otherX = 0
            let otherY = 0
            let distSq =0

             for(n=0;n<gridSide;n++){                        
                for(m=0;m<gridSide;m++){
                    if(i!=n && j!=m){
                        let a = 0
                    otherX = parseInt(neighborhoodGrid[n][m].attr("cx"))
                    otherY = parseInt(neighborhoodGrid[n][m].attr("cy"))
                    distSq = 1+(otherX-currX)**2 + (otherY-currY)**2
                    dirVec[0] += ((otherX-currX)/distSq**.5)/distSq
                    dirVec[1] += ((otherY-currY)/distSq**.5)/distSq
                } 
            }
            }

          
            //console.log(dirVec)
            currX += dirVec[0]
            currY += dirVec[1]  */
            
            neighborhoodGrid[i][j].transition().duration(33)//.attr("fill",`rgba(${parseInt(255 * Math.random())},${parseInt(255 * Math.random())},${parseInt(255 * Math.random())},.5)`)
                                  //.attr("r",width/gridSide/4*(1+(Math.random()-.5)/2))
                                  .attr("cy",currY)
                                  .attr("cx",currX)
                                  
        }}

}

function relocateCircle(pos, target){
    target.transition().duration(200).attr("cx", pos[0]).attr("cy", pos[1])
}

function emphasize(target,multiplier=2){
    if(target.attr("emphasized")==0){        
        currentRadius = target.attr("r")
        target.transition().duration(100).attr("r", currentRadius*multiplier).attr("emphasized",1)        
    }
}
    
function deemphasize(target,divisor=2){    
    if(target.attr("emphasized")==1){        
        currentRadius = target.attr("r")
        target.transition().duration(100).attr("r", currentRadius/divisor).attr("emphasized",0)     
    }
}       



 //start animation and set frame time.
 fps = 24
 animation = setInterval(colorDance, 1000/fps)

 let play = 1
 function pause(){if(play==1){play=0;clearInterval(animation)} 
             else{play=1; animation = setInterval(colorDance, 1000/fps)}} //not used, but useful                