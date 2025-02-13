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
            const ldiv = document.createElement("li");
            ldiv.className="food";
            ldiv.innerHTML = `${e.name} ${e.foodType} Rank: ${e.ranking}`;
            _l.appendChild(ldiv);
        });

    } catch (e) {console.error("Error: ",e); container.innerHTML="<p style='color:red'>Failed to get list</p>";}
}

getList();