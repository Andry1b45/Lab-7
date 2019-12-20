const socket = io(); 
let messages; 
let isHistory = false; 
let isVisited = false; 

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("room").onsubmit = e => {
    e.preventDefault(); //do not update
    const username = e.target.elements[0].value; 
    if (!e.target.elements[0].value)
    {
      alert("Enter username");
      return;
    }
    e.target.elements[0].value = ""; 
    socket.emit("set username", username); //to server
    document.getElementById("username").innerHTML = username; 
    isVisited = true;
  };

  document.getElementById("messageForm").onsubmit = e => {
    e.preventDefault(); 
    if (!e.target.elements[0].value)
    {
      alert("Dont left field empty");
      return;
    }
    if (!isVisited) {
      alert("Firstly create account");
      return;
    }
    socket.emit("message", e.target.elements[0].value); 
    e.target.elements[0].value = ""; 
  };
  document.getElementById("toHistory").onclick = async () => {
    if (!isHistory && isVisited) {  
      await fetch("/db") 
        .then(response => {
          if (response.ok) {
            return response.json(); //оbject with db data
          }
        })
        .then(data => {
          const box = document.getElementById("messages"); 
          messages = box.innerText; 
          isHistory = true; 
          box.innerText = ""; 
          data.forEach(elem => {
            box.innerText += `[${elem.username}]: ${elem.message}`; 
          });
        });
    } else {
      alert("Firstly create account");
      return;
    }
  };
  document.getElementById("toChat").onclick = () => { 
    if (isHistory) { 
      document.getElementById("messages").innerText = messages; 
      isHistory = false; 
    }
  };
});

socket.on("system new", name => {
  document.getElementById("messages").innerText += `\t\t\ ${name} connected! \n`; 
});

socket.on("render message", data => {
  document.getElementById(    
    "messages"
  ).innerText += `[${data.username}]: ${data.message} \n`; 
});
