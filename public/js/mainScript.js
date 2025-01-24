const container = document.getElementById("container");

const getList = async()=>{
    try {
        const res = await fetch("/food"); //get
        if(!res.ok)throw new Error("Failed to get list");
        const list = await res.json(); //parse
        container.innerHTML = ""; //format
        const _l = document.createElement("ol");
        container.appendChild(_l);
        list.forEach(e => {
            const ldiv = document.createElement("div");
            ldiv.className="hoz";
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.innerText = "-";
            btn.onclick = (ms)=>{deleteListItem(e.name);};
            btn.style.marginRight="40px";
            btn.style.maxHeight="20px";
            li.className="food";
            li.innerHTML = `${e.name} ${e.foodType} Rank: ${e.ranking}`;
            ldiv.appendChild(li);
            ldiv.appendChild(btn);
            _l.appendChild(ldiv);
        });

    } catch (e) {console.error("Error: ",e); container.innerHTML="<p style='color:red'>Failed to get list</p>";}
}

const deleteListItem = async(name)=>{
    try {
        const _q = "/deletefood/name?name="+name
        console.log(_q);
        const res = await fetch(_q,{method:"delete"}); //get
        if(!res.ok)throw new Error("Failed to delete list item");
        //const list = await res.json(); //parse
    } catch (e) {console.error("Error: ",e); container.innerHTML="<p style='color:red'>Failed to delete list item</p>";}
    //refresh list
    getList();
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

getList();
getRandCatImg();