const contractAddress = "0xa8eebB036bbF33DD7B888a95F5AdaE735325538E";
const abi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "approveDiploma",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_major",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_class",
				"type": "string"
			}
		],
		"name": "issueDiploma",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "allIds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "diplomas",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "studentName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "major",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "classification",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "issueDate",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isValid",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPendingDiplomas",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "verifyDiploma",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let web3;
let contract;

window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        contract = new web3.eth.Contract(abi, contractAddress);
        const accounts = await web3.eth.getAccounts();
        if(document.getElementById("walletAddress")) document.getElementById("walletAddress").innerText = accounts[0];
    }
});

async function issueDiploma() {
    const name = document.getElementById("nameInput").value;
    const major = document.getElementById("majorInput").value;
    const classification = document.getElementById("classInput").value;
    const autoID = Math.floor(Date.now() / 1000);
    const accounts = await web3.eth.getAccounts();
    try {
        await contract.methods.issueDiploma(autoID, name, major, classification).send({ from: accounts[0] });
        document.getElementById("successArea").style.display = "block";
        document.getElementById("generatedID").innerText = autoID;
        document.getElementById("inputForm").style.display = "none";
    } catch (e) { alert("Lỗi nhập liệu!"); }
}

async function verifyDiploma() {
    const id = document.getElementById("searchId").value;
    try {
        const data = await contract.methods.verifyDiploma(id).call();
        const isValid = data[4]; 

        document.getElementById("resName").innerText = data[0];
        document.getElementById("resMajor").innerText = data[1];
        document.getElementById("resClass").innerText = data[2];
        document.getElementById("resDate").innerText = new Date(data[3] * 1000).toLocaleDateString("vi-VN");
        
        const badge = document.getElementById("statusBadge");
        const qrArea = document.getElementById("qrSection");

        if (badge && qrArea) {
            if (isValid) {
                badge.innerText = "VERIFIED";
                badge.className = "badge bg-success rounded-pill";
                qrArea.style.display = "block";
                document.getElementById("qrCodeImage").src = `https://api.qrserver.com/v1/create-qr-code/?data=${id}`;
            } else {
                badge.innerText = "CHỜ PHÊ DUYỆT";
                badge.className = "badge bg-warning text-dark rounded-pill";
                qrArea.style.display = "none";
            }
        }
        
        if(document.getElementById("resultArea")) document.getElementById("resultArea").style.display = "block";
        return true; // Trả về true để báo hiệu thành công
    } catch (e) { 
        console.error("Lỗi xác thực:", e); 
       
        return false; 
    }
}

async function loadPending() {
    const listDiv = document.getElementById("pendingList");
    if (!listDiv) return; 

    try {
        // Lấy danh sách ID chờ duyệt
        const pendingIds = await contract.methods.getPendingDiplomas().call();
        
        listDiv.innerHTML = "";
        if (pendingIds.length === 0) {
            listDiv.innerHTML = "<div class='text-center p-4 text-muted'>Không có hồ sơ chờ duyệt.</div>";
            return;
        }

        // Duyệt qua từng ID để lấy chi tiết
        for (let id of pendingIds) {
            const data = await contract.methods.verifyDiploma(id).call();

            listDiv.innerHTML += `
                <div class="list-group-item d-flex justify-content-between align-items-center mb-2 border rounded shadow-sm">
                    <div>
                        <h6 class="mb-0 fw-bold">${data[0]}</h6>
                        <small class="text-muted">${data[1]} | ID: ${id}</small>
                    </div>
                    <button onclick="approveDiploma('${id}')" class="btn btn-danger btn-sm rounded-pill px-3">Xác nhận</button>
                </div>`;
        }
    } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        listDiv.innerHTML = "<div class='alert alert-danger'>Không thể tải dữ liệu. Kiểm tra mạng hoặc ví Admin!</div>";
    }
}

async function approveDiploma(id) {
    const accounts = await web3.eth.getAccounts();
    try {
        await contract.methods.approveDiploma(id).send({ from: accounts[0] });
        alert("Phê duyệt thành công!");
        loadPending(); // Tải lại danh sách sau khi duyệt
    } catch (error) {
        alert("Lỗi: Bạn không có quyền Admin hoặc giao dịch bị hủy.");
    }
}