const svg= document.getElementById("hex-svg");
const centerx = 350;
const centery =350;
 const radii=[300,200,100];
 
 // to get vertices of hexagon
function  getpoints( cx,cy,r){
    const points=[];
    for(let i=0;i<6;i++){
     const angle =60*i;
    const radian = Math.PI/180*angle;
    const x =cx + r*Math.cos(radian);
    const y=cy + r*Math.sin(radian);
    points.push({x,y});   
}    
   return points;
}


let outerHexPoints = [];  
let midHexPoints = [];
let innerHexPoints = [];  


// hexagon
 radii.forEach((radius,i)=>{
     const hexpoints = getpoints( centerx,centery,radius);
    
     if(i===0){
      outerHexPoints = hexpoints; 
     }
     if(i===1){
      midHexPoints = hexpoints; 
     }
     if(i===2){
      innerHexPoints = hexpoints; 
     }

     const hexagon= document.createElementNS("http://www.w3.org/2000/svg","polygon");
     function formatPoint(point) {
        return `${point.x},${point.y}`;
      }
    hexagon.setAttribute("points", hexpoints.map(formatPoint).join(" "));  
    hexagon.setAttribute("stroke","white");
    hexagon.setAttribute("stroke-width","4");  
    hexagon.setAttribute("fill","none");
    svg.appendChild(hexagon);
   
    });

   
console.log(outerHexPoints);
console.log(midHexPoints);
console.log(innerHexPoints);

for( let i=0;i<6;i++){
  let x1, y1, x2, y2;

  if(i%2===0){
    x1=outerHexPoints[i].x  ;
    y1=outerHexPoints[i].y  ;
    x2=midHexPoints[i].x  ;
    y2=midHexPoints[i].y  ;
  }
   else{
    x1=midHexPoints[i].x  ;
    y1=midHexPoints[i].y  ;
    x2=innerHexPoints[i].x  ;
    y2=innerHexPoints[i].y  ;
   } 
   const line =document.createElementNS("http://www.w3.org/2000/svg","line");
   line.setAttribute( "x1",x1);
   line.setAttribute( "y1",y1);
   line.setAttribute( "x2",x2  );
   line.setAttribute( "y2",y2 );
   line.setAttribute("stroke","white");
   line.setAttribute("stroke-width","4");
   svg.appendChild(line);
    
     
    const midX =(x1+x2) / 2;
    const midY = (y1+y2) / 2;
    const  text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", midX);
    text.setAttribute("y", midY - 15); // offset a bit above the line
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", "15");
    text.setAttribute("font-family", "Arial");
    text.setAttribute("text-anchor", "middle");
    text.textContent = "1";
    svg.appendChild(text);
   }
   
//circle
radii.forEach((radius,i)=>{
  const hexpoints = getpoints( centerx,centery,radius);
 hexpoints.forEach( getcircle);
function getcircle(p){
const circle=document.createElementNS("http://www.w3.org/2000/svg","circle");
circle.setAttribute("r","15");
circle.setAttribute("cx",p.x);
circle.setAttribute("cy",p.y);
circle.setAttribute("stroke","white");
circle.setAttribute("fill","grey");
circle.setAttribute("stroke-width","4");
svg.appendChild(circle);
}
});


   const innerweight = [9, 8, 8, 9, 8, 8];
   const midweight = [4, 6, 5, 4, 6, 5];
   const outerweight = [2, 1, 2, 3, 1, 1];
   
   const weightsMap = {
     300: outerweight,
     200: midweight,
     100: innerweight
   };
   
  
  
   
   radii.forEach((r) => {
     const angle = Math.PI / 3;
     const weights = weightsMap[r];
   
     for (let i = 0; i < 6; i++) {
       const x1 = centerx + (r - 20) * Math.cos(angle * i);
       const y1 = centery + (r - 20) * Math.sin(angle * i);
       const x2 = centerx + (r - 20) * Math.cos(angle * ((i + 1) % 6)); 
       const y2 = centery + (r - 20) * Math.sin(angle * ((i + 1) % 6));
   
       const midX = (x1 + x2) / 2;
       const midY = (y1 + y2) / 2;
   
       const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
       text.setAttribute("x", midX);
       text.setAttribute("y", midY);
       text.setAttribute("fill", "white");
       text.setAttribute("font-size", "15");
       text.setAttribute("font-family", "Arial");
       text.setAttribute("text-anchor", "middle");
       text.textContent = weights[i];
       svg.appendChild(text);
     }
   });
   
  
      
// }
// // function  Greentimer(){
// // const timeoutIdG= setTimeout(() => {
// //     window.alert("GAME END");
// //     },10000);     
// // }


// // function Redtimer(){
// // const timeoutIdR= setTimeout(() => {
// //      window.alert("GAME END");
// //      },10000);
// // }


let isRED =true;
const chance = document.querySelector(".chance");

let countG=0;
let countR=0;
const circles = document.querySelectorAll("circle");
circles.forEach(c=>{
    c.addEventListener("click" ,()=>
    {
   let  currcolor=c.getAttribute("fill");
   
     if(currcolor==="grey"){

    if(isRED){
     if(countR<4){ 
       c.setAttribute("fill","red");
       c.setAttribute("stroke","none");
        chance.textContent="green";
        chance.style.color="green";
        isRED=false;
    //    clearTimeout(Redtimer);
    //    Greentimer();
        countR++;
     }
     else {
      const nextsib = c.nextSibling;
      const nextcolour = nextsib.getAttribute("stroke");
      console.log(nextsib);
      const prevsib = c.previousSibling;
      console.log(prevsib);
      const prevcolour = prevsib.getAttribute("stroke");
       if(nextcolour==="red"||prevcolour==="red"){
        c.setAttribute("fill","red");
        c.setAttribute("stroke","none");
       }
      
     }
     
    }
    
     else{
        if(countG<4){  
      c.setAttribute("fill","green");
      c.setAttribute("stroke","none");
      chance.textContent="red";
       chance.style.color="red";
       isRED=true;
     //  clearTimeout(Greentimer);
     //  Redtimer();
       
        countG++;
     }
     else {
        const nextsib = c.nextSibling;
        const nextcolour = nextsib.getAttribute("stroke");
        console.log(nextSibling);
        const prevsib = c.previousSibling;
        console.log(prevsib);
        const prevcolour = prevsib.getAttribute("stroke");
         if(nextcolour==="green"||prevcolour==="green"){
          c.setAttribute("fill","green");
          c.setAttribute("stroke","none");
         }
         
       }
    }


  }
  
    });
});
//score logic
