const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

sendBtn.onclick = sendMessage;

msgInput.onkeypress = e=>{
if(e.key==="Enter") sendMessage();
};

function sendMessage(){

const text = msgInput.value;

if(text==="") return;

socket.emit("chat-message",{
room,
name,
text
});

addMessage(name,text);

msgInput.value="";

}

socket.on("chat-message",data=>{

addMessage(data.name,data.text);

});

function addMessage(name,text){

const div = document.createElement("div");

div.className="message";

div.innerText=name+": "+text;

messages.appendChild(div);

messages.scrollTop=messages.scrollHeight;

}