async function getName() {
    const res = await fetch("/getusername");

    if (res.ok) {
        const data = await res.json();
        const username = data.username;
        console.log("Username:", username);
    } else {
        console.error("Failed to fetch username");
    }
}

getName();