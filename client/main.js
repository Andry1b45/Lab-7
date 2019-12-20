const socket = io();
let messages;
let isHistory = false;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("room").onsubmit = async e => {
    e.preventDefault();
    console.log(await fetchUsers());
    const username = e.target.elements[0].value;
    if (!(await fetchUsers(username))) {
      e.target.elements[0].value = "";
      socket.emit("set username", username);
      document.getElementById("username").innerHTML = username;
    }
  };
  document.getElementById("messageForm").onsubmit = e => {
    e.preventDefault();
    socket.emit("message", e.target.elements[0].value);
    e.target.elements[0].value = "";
  };
  document.getElementById("toHistory").onclick = async () => {
    if (!isHistory) {
      await fetch("/db")
        .then(response => {
          if (response.ok) {
            return response.json();
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
    }
  };
  document.getElementById("toChat").onclick = () => {
    if (isHistory) {
      document.getElementById("messages").innerText = messages;
      isHistory = false;
    }
  };
});

const fetchUsers = async username => {
  const usersFetched = await fetch("/users")
    .then(response => {
      if (response.ok) {
        return response.text();
      }
    })
    .then(data => data.split(","));
  return usersFetched.some(elem => elem === username);
};

socket.on("system new", name => {
  document.getElementById("messages").innerText += `${name} joined! \n`;
});

socket.on("render message", data => {
  if(test == data.username){
    document.getElementById("messages").innerText += `=[${data.username}]: ${data.message} \n`; 
  }
  else{
    document.getElementById("messages").innerText += `[${data.username}]: ${data.message} \n`; 
  }
});
