const container = document.getElementById("container");
const addBtn = document.getElementById("addBtn");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const getList = async(_msg)=>{
    const loggedin = await isUserAuthenticated();
    if(loggedin){
        registerBtn.remove();
        loginBtn.remove();
    }else{
        addBtn.remove();
        logoutBtn.remove();
    }
    try {
        const res = await fetch("/food"); //get
        if(!res.ok)throw new Error("Failed to get list");
        const list = await res.json(); //parse
        container.innerHTML = ""; //format
        const _l = document.createElement("ol");
        container.appendChild(_l);
        list.forEach(e => {
            //Create list item
            const li = document.createElement("li");

            let delete_btn,update_btn;
            if(loggedin){
                //Create delete button for list item
                delete_btn = document.createElement("button");
                delete_btn.innerText = "⌫";
                delete_btn.onclick = (ms)=>{deleteListItem(e.name);};
                delete_btn.style.marginRight="10px";
                delete_btn.style.marginLeft="20px";
                delete_btn.style.maxHeight="20px";
                delete_btn.style.maxWidth="20px";
                delete_btn.style.padding="0px";
                //Create update button for list item
                update_btn = document.createElement("button");
                update_btn.innerText = "⚙️";
                update_btn.onclick = (ms)=>{editListItem(e._id);};
                update_btn.style.maxHeight="20px";
                update_btn.style.maxWidth="20px";
                update_btn.style.padding="0px";
                
            }
            //Finish list item and append buttons
            li.className="food";
            li.innerHTML = `${e.name} <i>${e.foodType}</i>`;
            if(loggedin){
                li.appendChild(delete_btn);
                li.appendChild(update_btn);
            }
            _l.appendChild(li);
        });
        if(_msg!=undefined){
            const _p = document.createElement("p");
            _p.innerText = _msg;
            container.appendChild(_p);
        }

    } catch (e) {console.error("Error: ",e); container.innerHTML="<p style='color:red'>Failed to get list</p>";}
}

const deleteListItem = async(name)=>{
    try {
        const _a = await fetch("/userauthenticated");
        if(_a.status!=201){
            if(_a.status==200) window.location.href = "/login";
            throw new Error("Failed to authenticate user");
        }
        const _q = "/deletefood/name?name="+name;
        const res = await fetch(_q,{method:"delete"});
        if(!res.ok)throw new Error("Failed to delete list item");        
        //refresh list
        getList("Successfully deleted "+name);
    } catch (e) {console.error("Error: ",e); container.innerHTML=`<p style='color:red'>${e}</p>`;}
}

const isUserAuthenticated = async()=>{
    try {
        const _a = await fetch("/userauthenticated");
        return (_a.status==201)
    } catch (e) {return false;}
}

const editListItem = async(id)=>{
    try{
        window.location.href = "/addfooditem?id="+id;
    }catch(e){console.error("Error: ",e);}
}

const getEditItem = async(id)=>{
    try {
        const _q = "/food/"+id;
        const res = await fetch(_q,{method:"get"});
        if(!res.ok)throw new Error("Failed to get item to edit");
    } catch (e) {console.error("Error: ",e); container.innerHTML="<p style='color:red'>Failed to delete list item</p>";}
}

const getSessionUser = async()=>{
    const loggedin = await isUserAuthenticated();
    if(!loggedin)return;
    try{
        const res = await fetch("/currentuser");
        if(res.ok){
            const _user = await res.json();
            document.getElementById("currUser").innerText="Logged in as: "+_user;
        }
    }catch(e){console.error(e);}
}

const getRandCatImg = async()=>{
    try{
        const res = await fetch("https://api.thecatapi.com/v1/images/search?mime_types=gif");
        if(!res.ok)throw new Error("Failed to fetch random cat gif");
        const gif = await res.json();
        const _img = document.getElementById("randCatGif");
        _img.src = gif[0].url;
        _img.width = 260;
        _img.height = 260;
    }catch(e){console.error("Error: ",e);}
}

getRandCatImg(); //more important so do this first
getList();
getSessionUser();