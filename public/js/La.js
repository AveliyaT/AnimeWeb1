const Btn = document.querySelector("#btn")

Btn.addEventListener("click", function chooseTittle() {
    let ul = document.createElement('ul'); 
document.body.append(ul); 

while (true) { 
  let data = prompt("Enter the name of anime", ""); 

  if (!data) { 
    break; 
  } 

  let li = document.createElement('li'); 
  li.textContent = data; 
 ul.append(li); 
}
}
);
