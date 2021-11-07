let currentAccount = null;
if (typeof window.ethereum !== 'undefined') {
    document.querySelector('#checkMetamask').innerHTML = "✅";
}

async function connect() {

    const walletAddress = await window.ethereum.request({
        method: "eth_requestAccounts",
        params: [
            {
                eth_accounts: {}
            }
        ]
    });

    await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [
            {
                eth_accounts: {}
            }
        ]
    });

    console.log(window.ethereum.selectedAddress);
    loadDatas();
}

async function loadDatas () {
    await getAccount();
    await getNetwork();
    await getBalance();            
}



if (typeof window.ethereum !== 'undefined') {
    loadDatas ();
}        

async function getAccount() {
    if (typeof window.ethereum == 'undefined') {
        alert('Você precisa instalar o Metamask para utilizar essa aplicação!');
        return;
    }
    await ethereum.request({ method: 'eth_requestAccounts' });
    if (ethereum.chainId == 0x1) {
        alert("Oi! Por enquanto esse projeto não esta habilitado para mainnet :(");
        console.log("Você está usando uma rede principal");
        return;
    }
    if (ethereum.chainId == 0x4) {
        console.log("Você está usando uma rede de Teste")
    }
    document.querySelector('#addressInput').value = ethereum.selectedAddress;
}        

async function getNetwork() {
    console.info(ethereum.chainId);
    if (ethereum.chainId == 0x1) {
        document.querySelector('#network').innerHTML = "mainnet - principal 🚀";
        console.log("Você está usando uma rede principal")
    }
    if (ethereum.chainId == 0x4) {
        document.querySelector('#network').innerHTML = "rinkeby - teste 🎢";
        console.log("Você está usando uma rede de teste")
    }
}


async function getBalance() {
    console.info("ethereum.selectedAddress" + ethereum.selectedAddress);
    try {
        balance = await ethereum
            .request({
                method: "eth_getBalance",
                params: [ethereum.selectedAddress, "latest"],
            })
        // covert to readable format (account for decimals)
        readBalance = parseInt(balance) / 10 ** 18; // will need change based on what token
        console.log("Balance:" + readBalance.toFixed(5));

        if (readBalance > 0) {
            document.querySelector('#balance').innerHTML = readBalance.toFixed(5) + " 😎";
        } else {
            document.querySelector('#balance').innerHTML = readBalance.toFixed(5) + " 🥴";
            $("#check_balance").css('color', 'red');
        }

    } catch (error) {
        console.log(error);
    }
}

window.ethereum.on('networkChanged', function (accounts) {
    console.log(accounts[0])
});

window.ethereum.on('notification', function (payload) {
    console.log("notification");
});

window.ethereum.on('accountsChanged', function (accounts) {
    loadDatas();
    console.log("accountsChanged");
})

window.ethereum.on('chainChanged', (chainId) => {
    window.location.reload();
    loadDatas();
});

async function buyNow() {
    if (!ethereum.selectedAddress) {
        alert("Not connected")
    }

    if (ethereum.chainId == 0x1) {
        alert("Oi! Por enquanto esse projeto não esta habilitado para mainnet :(");
        return;
    }            

    const number = 1;
    if (!(number >= 1) || !(number <= 20) || !(Number.isInteger(number))) {
        alert('Number of mint limit 2')
        return;
    }
    const responsePrice = await fetch(`https://unitedcryptopunks.org/tokens/price/${number}`);
    const priceJson = await responsePrice.json();

    const functionAbi = "d96a094a";

    const actualSize = 2 + functionAbi.length + number.toString(16).length;

    console.log("actualSize" + actualSize);



    console.log("data: " + "0x" + functionAbi + "0".repeat(74 - actualSize) + number.toString(16));

    var transactionParameters = {
        from: ethereum.selectedAddress, // User address
        to: '0x3e2dD7D210Db8C5ab7A4b44B9f1710BC28b8c9fA', // Contract address
        // "gas": (237840).toString(16), // Gas fee
        "gas": (number * 240000).toString(16), // Gas fee
        "value": (Number(priceJson['price'])).toString(16), // Only required to send ether to the recipient from the initiating external account.
        "data": "0x" + functionAbi + "0".repeat(74 - actualSize) + number.toString(16) // Function  ABI from contract
    };

    // txHash is a hex string
    // As with any RPC call, it may throw an error
    const txHash = ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
    })
}